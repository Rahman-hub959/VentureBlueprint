import random
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

def generate_ticket_id() -> str:
    return f"CS-GRV-2026-{random.randint(1000, 9999)}"

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, default=generate_ticket_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    company_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True, index=True)
    phone_number = Column(String(50), nullable=True)
    pillar = Column(String(30), nullable=False, default="CS")  # CS, CA, LAW, GENERAL
    category = Column(String(255), nullable=False)
    priority = Column(String(50), nullable=False, default="Standard")  # Low, Standard, High, Critical
    status = Column(String(50), nullable=False, default="Registered")  # Registered, In Review by Expert, Action In Progress, Resolved
    assigned_expert = Column(String(255), nullable=True)
    expert_role = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    resolution_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", foreign_keys=[user_id])
