from pydantic import BaseModel
from typing import Optional

class UserSettingsResponse(BaseModel):
    theme: str = "system"
    enter_to_send: bool = True
    show_timestamps: bool = True
    default_model: str = "qwen/qwen3.8-27b"
    system_prompt: Optional[str] = None

    class Config:
        from_attributes = True

class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    enter_to_send: Optional[bool] = None
    show_timestamps: Optional[bool] = None
    default_model: Optional[str] = None
    system_prompt: Optional[str] = None
