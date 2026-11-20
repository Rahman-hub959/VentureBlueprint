import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class QuestionnaireDefinition(Base):
    __tablename__ = "questionnaire_definitions"

    id = Column(String, primary_key=True, default=generate_uuid)
    version = Column(Integer, default=1)
    title = Column(String(255), nullable=False)
    sections = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class QuestionnaireResponse(Base):
    __tablename__ = "questionnaire_responses"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("startup_projects.id"), nullable=False)
    questionnaire_id = Column(String, ForeignKey("questionnaire_definitions.id"), nullable=True)
    step_id = Column(String(100), nullable=False)
    answers = Column(JSON, default=dict)
    is_completed = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    project = relationship("StartupProject", back_populates="questionnaire_responses")
