import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "LUMIQ AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://root:password@127.0.0.1:3306/successfully?charset=utf8mb4"
    )

    # Groq AI
    GROQ_API_KEY: str = os.getenv(
        "GROQ_API_KEY",
        ""
    )
    GROQ_DEFAULT_MODEL: str = os.getenv("GROQ_DEFAULT_MODEL", "qwen/qwen3.8-27b")
    GROQ_FALLBACK_MODEL: str = os.getenv("GROQ_FALLBACK_MODEL", "openai/gpt-oss-120b")
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"

    # Security / JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "lumiq-ai-change-this-secret-key-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRES_MINUTES: int = 60 * 24 * 7  # 7 days

    # Uploads
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    AVATARS_DIR: Path = BASE_DIR / "uploads" / "avatars"
    FILES_DIR: Path = BASE_DIR / "uploads" / "files"
    MAX_FILE_SIZE_MB: int = 15

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure upload dirs exist
settings.AVATARS_DIR.mkdir(parents=True, exist_ok=True)
settings.FILES_DIR.mkdir(parents=True, exist_ok=True)
