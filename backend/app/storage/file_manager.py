import os
import shutil
from pathlib import Path
from typing import Optional
from app.config import settings

def get_project_storage_dir(user_id: str, project_id: str, subfolder: str = "documents") -> Path:
    """
    Returns a sandboxed, secure project storage directory.
    Prevents path traversal attacks.
    """
    clean_user = "".join(c for c in user_id if c.isalnum() or c in "-_")
    clean_project = "".join(c for c in project_id if c.isalnum() or c in "-_")
    clean_sub = "".join(c for c in subfolder if c.isalnum() or c in "-_")

    target_dir = settings.STORAGE_DIR / "users" / clean_user / "projects" / clean_project / clean_sub
    target_dir.mkdir(parents=True, exist_ok=True)
    return target_dir

def save_uploaded_file(user_id: str, project_id: str, filename: str, content: bytes) -> Path:
    storage_dir = get_project_storage_dir(user_id, project_id, "uploads")
    clean_filename = Path(filename).name  # Prevent directory traversal
    dest_path = storage_dir / clean_filename
    
    with open(dest_path, "wb") as f:
        f.write(content)
        
    return dest_path
