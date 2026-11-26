import uuid
import random
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

def generate_consultation_id() -> str:
    return f"CONS-2026-{random.randint(1000, 9999)}"

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(String, primary_key=True, default=generate_consultation_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone_number = Column(String(30), nullable=False)
    company_name = Column(String(255), nullable=True)
    pillar = Column(String(30), nullable=False, default="GENERAL")  # CS, CA, LAW, GENERAL
    topic = Column(String(255), nullable=False)
    preferred_date = Column(String(50), nullable=True)
    preferred_time_slot = Column(String(100), nullable=True)
    status = Column(String(50), nullable=False, default="Requested")  # Requested, Scheduled, In Progress, Completed, Cancelled
    assigned_expert = Column(String(255), nullable=True)
    expert_role = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    meeting_link = Column(String(255), nullable=True)
    meeting_platform = Column(String(50), default="Google Meet / Direct Phone")
    resolution_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", foreign_keys=[user_id])
