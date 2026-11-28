import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DEFAULT = BASE_DIR.parent / "storage"

class Settings(BaseSettings):
    PROJECT_NAME: str = "CorpSetu"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "corpsetu-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database: Supports PostgreSQL or local SQLite fallback
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR / 'corpsetu.db'}"
    )
    
    @property
    def normalized_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url
    
    # Storage configuration
    STORAGE_DIR: Path = Path(os.getenv("STORAGE_DIR", str(STORAGE_DEFAULT)))
    MAX_UPLOAD_SIZE_MB: int = 15

    # SMTP / External Email Delivery Configuration
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").lower() in ("true", "1", "yes")
    SMTP_SSL: bool = os.getenv("SMTP_SSL", "false").lower() in ("true", "1", "yes")
    SMTP_FROM: str = os.getenv("SMTP_FROM", "no-reply@corpsetu.in")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "CorpSetu Corporate Advisory Suite")
    PORTAL_URL: str = os.getenv("PORTAL_URL", "http://localhost:5173")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
