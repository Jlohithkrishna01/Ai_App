import json
import asyncio
from datetime import datetime
from typing import AsyncGenerator
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.session import get_db, SessionLocal
from app.models.user import User, UserSettings
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.source import Source
from app.schemas.chat import SendMessageRequest
from app.middleware.auth_deps import get_current_user
from app.services.ai_service import ai_service
from app.services.web_search import should_search_web, perform_web_search

router = APIRouter(prefix="/ai", tags=["AI Streaming"])

def generate_title_from_content(content: str) -> str:
    cleaned = content.strip().split("\n")[0]
    words = cleaned.split()
    if len(words) > 7:
        title = " ".join(words[:7]) + "..."
    else:
        title = " ".join(words)
    return title[:60] if title else "New Chat"

@router.post("/chat/stream")
async def chat_stream(
    req: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.content.strip() and not req.file_extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content or document is required."
        )

    # 1. Get or create conversation
    if req.conversation_id:
        conversation = (
            db.query(Conversation)
            .filter(Conversation.id == req.conversation_id, Conversation.user_id == current_user.id)
            .first()
        )
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found.")
    else:
        # Create a new conversation
        title = generate_title_from_content(req.content)
        conversation = Conversation(
            user_id=current_user.id,
            title=title
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # 2. Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=req.content.strip(),
        file_name=req.file_name,
        file_url=req.file_url,
        file_type=req.file_type
    )
    db.add(user_msg)
    conversation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user_msg)

    # 3. Fetch user settings (for custom system prompt / default model)
    user_settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    custom_system_prompt = user_settings.system_prompt if user_settings else None
    preferred_model = req.model or (user_settings.default_model if user_settings else None)

    # 4. Fetch last 10 messages for conversation context
    past_messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id, Message.id < user_msg.id)
        .order_by(Message.created_at.desc())
        .limit(10)
        .all()
    )
    past_messages.reverse()

    conv_history = []
    for m in past_messages:
        conv_history.append({"role": m.role, "content": m.content})
    # Add current user message
    conv_history.append({"role": "user", "content": req.content})

    conversation_id = conversation.id
    user_id = current_user.id
    file_extracted = req.file_extracted_text
    file_name = req.file_name
    query_text = req.content
    web_search_flag = req.enable_web_search

    async def sse_event_stream() -> AsyncGenerator[str, None]:
        # Yield initial conversation info event
        init_data = json.dumps({
            "type": "init",
            "conversation_id": conversation_id,
            "title": conversation.title,
            "user_message_id": user_msg.id
        })
        yield f"data: {init_data}\n\n"
        await asyncio.sleep(0.01)

        # Web search check
        need_search = should_search_web(query_text, web_search_flag)
        sources_found = []

        if need_search:
            status_data = json.dumps({
                "type": "status",
                "message": "Searching the web for current information..."
            })
            yield f"data: {status_data}\n\n"
            await asyncio.sleep(0.05)

            # Run web search in threadpool to not block async loop
            loop = asyncio.get_event_loop()
            sources_found = await loop.run_in_executor(None, perform_web_search, query_text, 5)

            if sources_found:
                src_data = json.dumps({
                    "type": "sources",
                    "sources": sources_found
                })
                yield f"data: {src_data}\n\n"
                await asyncio.sleep(0.05)

        # Thinking status
        thinking_data = json.dumps({
            "type": "status",
            "message": "LUMIQ AI is thinking..."
        })
        yield f"data: {thinking_data}\n\n"
        await asyncio.sleep(0.05)

        # Build prompt
        system_prompt = ai_service.build_system_prompt(
            custom_system_prompt=custom_system_prompt,
            sources=sources_found,
            document_text=file_extracted,
            file_name=file_name
        )

        full_response_text = ""
        try:
            async for token in ai_service.generate_chat_stream(
                conversation_history=conv_history,
                system_prompt=system_prompt,
                model=preferred_model
            ):
                full_response_text += token
                chunk_data = json.dumps({
                    "type": "token",
                    "content": token
                })
                yield f"data: {chunk_data}\n\n"
                # brief yield to flush buffer smoothly
                await asyncio.sleep(0.005)

        except Exception as e:
            err_data = json.dumps({
                "type": "error",
                "message": "Unable to connect to the AI service. Please try again."
            })
            yield f"data: {err_data}\n\n"
            return

        # Save assistant message to database in a new session
        assistant_msg_id = None
        new_db = SessionLocal()
        try:
            assistant_msg = Message(
                conversation_id=conversation_id,
                role="assistant",
                content=full_response_text
            )
            new_db.add(assistant_msg)
            new_db.commit()
            new_db.refresh(assistant_msg)
            assistant_msg_id = assistant_msg.id

            # Save sources linked to this message
            saved_sources = []
            for src in sources_found:
                db_src = Source(
                    message_id=assistant_msg.id,
                    title=src.get("title", ""),
                    url=src.get("url", ""),
                    source_name=src.get("source_name", "Web Source"),
                    snippet=src.get("snippet", "")
                )
                new_db.add(db_src)
                saved_sources.append(src)
            new_db.commit()

            # Update conversation timestamp & title if needed
            conv_obj = new_db.query(Conversation).filter(Conversation.id == conversation_id).first()
            if conv_obj:
                conv_obj.updated_at = datetime.utcnow()
                if conv_obj.title == "New Chat":
                    conv_obj.title = generate_title_from_content(query_text)
                new_db.commit()
                current_title = conv_obj.title
            else:
                current_title = "Chat"

        except Exception as db_err:
            print(f"[AI Stream] DB error saving assistant message: {db_err}")
            current_title = "Chat"
        finally:
            new_db.close()

        # Send final completion event
        done_data = json.dumps({
            "type": "done",
            "conversation_id": conversation_id,
            "message_id": assistant_msg_id,
            "title": current_title,
            "sources": sources_found
        })
        yield f"data: {done_data}\n\n"

    return StreamingResponse(
        sse_event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
