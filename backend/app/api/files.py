from fastapi import APIRouter, Depends, UploadFile, File
from app.models.user import User
from app.middleware.auth_deps import get_current_user
from app.services.file_service import save_uploaded_file

router = APIRouter(prefix="/files", tags=["Files"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    result = await save_uploaded_file(file)
    return result
