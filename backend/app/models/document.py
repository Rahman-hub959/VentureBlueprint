import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class DocumentTemplate(Base):
    __tablename__ = "document_templates"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_type = Column(String(100), unique=True, nullable=False)  # formation_blueprint, mca_compliance, founder_director, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    required_sections = Column(JSON, default=list)
    template_schema = Column(JSON, default=dict)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class GeneratedDocument(Base):
    __tablename__ = "generated_documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("startup_projects.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    document_type = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_format = Column(String(10), nullable=False)  # pdf, docx
    file_size_bytes = Column(Integer, default=0)
    checksum_sha256 = Column(String(64), nullable=True)
    version = Column(Integer, default=1)
    input_snapshot = Column(JSON, default=dict)
    rule_version_snapshot = Column(JSON, default=dict)
    status = Column(String(50), default="completed")  # generating, completed, failed
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("StartupProject", back_populates="generated_documents")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")

class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("generated_documents.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    file_format = Column(String(10), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    checksum_sha256 = Column(String(64), nullable=True)
    change_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    document = relationship("GeneratedDocument", back_populates="versions")
