from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ConsultationCreate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: str
    company_name: Optional[str] = None
    pillar: str = "GENERAL"  # CS, CA, LAW, GENERAL
    topic: str
    preferred_date: Optional[str] = None
    preferred_time_slot: Optional[str] = "Morning (10:00 AM - 1:00 PM)"
    notes: Optional[str] = None

class ConsultationResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    full_name: str
    email: str
    phone_number: str
    company_name: Optional[str] = None
    pillar: str
    topic: str
    preferred_date: Optional[str] = None
    preferred_time_slot: Optional[str] = None
    status: str
    assigned_expert: Optional[str] = None
    expert_role: Optional[str] = None
    notes: Optional[str] = None
    meeting_link: Optional[str] = None
    meeting_platform: Optional[str] = None
    resolution_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ConsultationStatusUpdate(BaseModel):
    status: Optional[str] = None
    assigned_expert: Optional[str] = None
    expert_role: Optional[str] = None
    notes: Optional[str] = None
    resolution_summary: Optional[str] = None
    meeting_platform: Optional[str] = None

