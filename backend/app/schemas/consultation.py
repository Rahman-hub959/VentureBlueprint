from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ConsultationCreate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: str
    alternate_phone: Optional[str] = None
    company_name: Optional[str] = None
    pillar: str = "GENERAL"  # CS, CA, LAW, GENERAL
    service_category: Optional[str] = None
    preferred_entity_type: Optional[str] = None
    topic: str
    preferred_date: Optional[str] = None
    preferred_time_slot: Optional[str] = "Within 24 to 48 Hours"
    notes: Optional[str] = None

class ConsultationResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    full_name: str
    email: str
    phone_number: str
    alternate_phone: Optional[str] = None
    company_name: Optional[str] = None
    pillar: str
    service_category: Optional[str] = None
    preferred_entity_type: Optional[str] = None
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
    pdf_summary_url: Optional[str] = None
    questionnaire_sent_at: Optional[datetime] = None
    expert_shared_at: Optional[datetime] = None
    document_sent_at: Optional[datetime] = None
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
    alternate_phone: Optional[str] = None
    service_category: Optional[str] = None

class SendQuestionnaireRequest(BaseModel):
    pillar: Optional[str] = None  # CS, CA, LAW
    custom_message: Optional[str] = None

class ShareExpertRequest(BaseModel):
    expert_name: str
    expert_role: str
    expert_email: Optional[str] = None
    expert_phone: Optional[str] = None
    custom_note: Optional[str] = None

class SendDocumentRequest(BaseModel):
    document_title: Optional[str] = "Company Setup Blueprint & Statutory Dossier"
    document_format: Optional[str] = "pdf"
    custom_message: Optional[str] = None

