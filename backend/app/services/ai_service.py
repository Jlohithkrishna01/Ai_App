import json
import logging
from abc import ABC, abstractmethod
from typing import AsyncGenerator, List, Dict, Any, Optional
import httpx

from app.config import settings

logger = logging.getLogger("lumiq.ai_service")

class BaseAIProvider(ABC):
    @abstractmethod
    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> AsyncGenerator[str, None]:
        pass

def _format_api_error(status_code: int, raw_bytes: bytes) -> str:
    try:
        data = json.loads(raw_bytes.decode("utf-8", errors="ignore"))
        msg = data.get("error", {}).get("message") or data.get("detail")
        if msg:
            return f"{msg} (HTTP {status_code})"
    except Exception:
        pass
    return f"HTTP error {status_code}"

class GroqOpenAIProvider(BaseAIProvider):
    def __init__(self, api_key: Optional[str] = None, base_url: str = settings.GROQ_BASE_URL, default_model: str = settings.GROQ_DEFAULT_MODEL):
        self._api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model

    @property
    def api_key(self) -> str:
        return (self._api_key or settings.GROQ_API_KEY or "").strip()

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> AsyncGenerator[str, None]:
        active_key = self.api_key
        if not active_key:
            yield "⚠️ **AI Service Error**: `GROQ_API_KEY` is not configured. Please add your Groq API key in your `backend/.env` file and restart the backend."
            return

        selected_model = model or self.default_model
        endpoint = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {active_key}",
            "Content-Type": "application/json",
            "User-Agent": "LUMIQ-AI/1.0.0 (FastAPI-Client)"
        }
        payload = {
            "model": selected_model,
            "messages": messages,
            "stream": True,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                async with client.stream("POST", endpoint, json=payload, headers=headers) as response:
                    if response.status_code != 200:
                        err_body = await response.aread()
                        logger.error(f"Groq API error {response.status_code}: {err_body.decode('utf-8', errors='ignore')}")
                        # If primary model failed, try fallback model if different
                        if selected_model != settings.GROQ_FALLBACK_MODEL and settings.GROQ_FALLBACK_MODEL:
                            logger.info(f"Retrying with fallback model {settings.GROQ_FALLBACK_MODEL}")
                            payload["model"] = settings.GROQ_FALLBACK_MODEL
                            async with client.stream("POST", endpoint, json=payload, headers=headers) as fallback_resp:
                                if fallback_resp.status_code != 200:
                                    fallback_err = await fallback_resp.aread()
                                    yield f"\n\n⚠️ **AI Service Error**: {_format_api_error(fallback_resp.status_code, fallback_err)}"
                                    return
                                async for line in fallback_resp.aiter_lines():
                                    line = line.strip()
                                    if line.startswith("data: ") and line != "data: [DONE]":
                                        try:
                                            chunk = json.loads(line[6:])
                                            delta = chunk.get("choices", [{}])[0].get("delta", {})
                                            token = delta.get("content") or ""
                                            if token:
                                                yield token
                                        except Exception:
                                            continue
                            return

                        yield f"\n\n⚠️ **AI Service Error**: {_format_api_error(response.status_code, err_body)}"
                        return

                    async for line in response.aiter_lines():
                        line = line.strip()
                        if line.startswith("data: "):
                            if line == "data: [DONE]":
                                break
                            try:
                                chunk = json.loads(line[6:])
                                delta = chunk.get("choices", [{}])[0].get("delta", {})
                                token = delta.get("content") or ""
                                if token:
                                    yield token
                            except Exception:
                                continue

            except httpx.ConnectError as ce:
                logger.exception(f"Connection error to AI service: {ce}")
                yield "\n\n⚠️ **Network Error**: Unable to reach AI servers (DNS or connection error). Please check your internet connection."
            except httpx.TimeoutException as te:
                logger.exception(f"Timeout connecting to AI service: {te}")
                yield "\n\n⚠️ **Timeout Error**: The AI service did not respond in time. Please try again."
            except Exception as e:
                logger.exception(f"Exception during stream: {e}")
                yield f"\n\n⚠️ **AI Service Error**: {str(e)}"

class AIService:
    def __init__(self):
        self._provider: Optional[BaseAIProvider] = None

    @property
    def provider(self) -> BaseAIProvider:
        if self._provider is None:
            self._provider = GroqOpenAIProvider()
        return self._provider

    def set_provider(self, provider: BaseAIProvider):
        self._provider = provider

    def build_system_prompt(
        self,
        custom_system_prompt: Optional[str] = None,
        sources: Optional[List[Dict[str, str]]] = None,
        document_text: Optional[str] = None,
        file_name: Optional[str] = None
    ) -> str:
        prompt_parts = [
            "You are LUMIQ AI, a state-of-the-art, helpful, and highly intelligent AI companion and coding assistant.",
            "Always deliver clear, beautifully structured markdown responses with headings, bullet points, clean formatting, and precise code blocks where applicable.",
            "Maintain a professional, inspiring, and concise tone. For programming questions, always include syntax-highlighted code blocks with language identifiers."
        ]

        if custom_system_prompt and custom_system_prompt.strip():
            prompt_parts.append(f"\nUser Preference Instructions:\n{custom_system_prompt.strip()}")

        if sources and len(sources) > 0:
            prompt_parts.append("\n=== REAL-TIME WEB SEARCH RESULTS ===")
            prompt_parts.append("You have accessed up-to-date live search information below. Synthesize this data accurately to answer the user:")
            for i, src in enumerate(sources, start=1):
                prompt_parts.append(f"[{i}] {src.get('title')} ({src.get('source_name')}) - URL: {src.get('url')}\nSnippet: {src.get('snippet')}\n")
            prompt_parts.append("Clearly present facts from these verified sources. Distinguish current web-backed facts from general AI historical knowledge.")

        if document_text and document_text.strip():
            prompt_parts.append(f"\n=== ATTACHED DOCUMENT ({file_name or 'Uploaded File'}) ===")
            prompt_parts.append("The user has provided the following document content. Base your answers, summaries, and analysis directly on this document:")
            # Cap document context to avoid exceeding token limits (e.g. first 24000 characters)
            doc_snippet = document_text.strip()
            if len(doc_snippet) > 24000:
                doc_snippet = doc_snippet[:24000] + "\n...[Document truncated for length]..."
            prompt_parts.append(doc_snippet)
            prompt_parts.append("=== END ATTACHED DOCUMENT ===")

        return "\n\n".join(prompt_parts)

    async def generate_chat_stream(
        self,
        conversation_history: List[Dict[str, str]],
        system_prompt: str,
        model: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        full_messages = [{"role": "system", "content": system_prompt}]
        full_messages.extend(conversation_history)
        async for token in self.provider.stream_chat(full_messages, model=model):
            yield token

ai_service = AIService()
