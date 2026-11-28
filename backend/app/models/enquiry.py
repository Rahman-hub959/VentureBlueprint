import random
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

def generate_enquiry_id() -> str:
    return f"ENQ-2026-{random.randint(1000, 9999)}"

class ClientEnquiry(Base):
    __tablename__ = "client_enquiries"

    id = Column(String, primary_key=True, default=generate_enquiry_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone_number = Column(String(30), nullable=False)
    company_name = Column(String(255), nullable=True)
    service_pillar = Column(String(30), nullable=False, default="GENERAL")  # CS, CA, LAW, GENERAL
    topic = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    source = Column(String(100), default="website_lead")  # website_lead, live_chat, advisory_desk, questionnaire
    status = Column(String(50), default="New")  # New, Contacted, Converted, Closed
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", foreign_keys=[user_id])
