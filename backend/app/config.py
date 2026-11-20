import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DEFAULT = BASE_DIR.parent / "storage"

class Settings(BaseSettings):
    PROJECT_NAME: str = "VentureBlueprint"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ventureblueprint-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database: Supports PostgreSQL or local SQLite fallback
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR / 'ventureblueprint.db'}"
    )
    
    # Storage configuration
    STORAGE_DIR: Path = Path(os.getenv("STORAGE_DIR", str(STORAGE_DEFAULT)))
    MAX_UPLOAD_SIZE_MB: int = 15

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
