from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.enquiry import ClientEnquiry
from app.models.platform_setting import PlatformSetting
from app.models.user import User
from app.schemas.all_schemas import ClientEnquiryCreate, ClientEnquiryResponse, PlatformSettingsSchema
from app.api.deps import get_optional_current_user
from app.services.notification_service import notify_admin
from app.services.email_service import _deliver_email

router = APIRouter(tags=["Enquiries & Platform Settings"])

DEFAULT_PLATFORM_SETTINGS = {
    "platform_name": "CorpSetu",
    "tagline": "Law · CS · CA — One Bridge",
    "support_phone": "+91 98765 43210",
    "support_email": "advisory@corpsetu.com",
    "support_hours": "Mon - Sat: 9:00 AM - 7:00 PM IST",
    "office_address": "Floor 4, CorpSetu Hub, Financial District, Hyderabad, Telangana 500032",
    "announcement_banner": "Empanelled Senior Corporate Advisory & Multi-Disciplinary Practice Suite",
    "consultation_turnaround": "Within 24 Hours",
}

@router.get("/platform-settings", response_model=PlatformSettingsSchema)
def get_public_platform_settings(db: Session = Depends(get_db)):
    """
    Publicly accessible platform settings used across the header, footer, contact links,
    and consultation callback information.
    """
    row = db.query(PlatformSetting).filter(PlatformSetting.key == "general").first()
    if row and isinstance(row.value, dict):
        merged = {**DEFAULT_PLATFORM_SETTINGS, **row.value}
        return PlatformSettingsSchema(**merged)
    return PlatformSettingsSchema(**DEFAULT_PLATFORM_SETTINGS)

@router.post("/enquiries", response_model=ClientEnquiryResponse)
def create_client_enquiry(
    payload: ClientEnquiryCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Records an incoming client enquiry / lead from the website, live chat, or landing page.
    Saves all details in the database, alerts administrators in real-time, and sends confirmation.
    """
    user_id = current_user.id if current_user else None
    
    enquiry = ClientEnquiry(
        user_id=user_id,
        full_name=payload.full_name.strip(),
        email=payload.email.strip().lower(),
        phone_number=payload.phone_number.strip(),
        company_name=payload.company_name.strip() if payload.company_name else None,
        service_pillar=payload.service_pillar.upper() if payload.service_pillar else "GENERAL",
        topic=payload.topic.strip(),
        message=payload.message.strip() if payload.message else None,
        source=payload.source or "website_lead",
        status="New"
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)

    # 1. Alert administrators immediately with direct phone number
    notify_admin(
        db=db,
        title=f"New Lead Enquiry: {enquiry.full_name} ({enquiry.service_pillar})",
        message=f"{enquiry.full_name} ({enquiry.phone_number}, {enquiry.email}) enquired about '{enquiry.topic}'. Direct call available in Admin Portal.",
        category="admin_alert",
        link="/admin"
    )

    # 2. Dispatch official confirmation email to the user
    try:
        subject = f"Enquiry Received: {enquiry.id} · CorpSetu Advisory Team"
        body_text = f"""Dear {enquiry.full_name},

Thank you for contacting CorpSetu. We have received your corporate enquiry:
- Enquiry Reference: {enquiry.id}
- Service Practice: {enquiry.service_pillar} (Company Secretarial, CA & Corporate Law)
- Subject: {enquiry.topic}
- Registered Phone: {enquiry.phone_number}

Our corporate advisory desk is reviewing your requirements and our empanelled specialist will contact you directly via phone ({enquiry.phone_number}) and email within 24 hours.

Warm regards,
CorpSetu Corporate Advisory Lead
Law · CS · CA — One Bridge
www.corpsetu.com
"""
        body_html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Enquiry Received</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background: linear-gradient(135deg, #0B2559 0%, #17387A 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">CorpSetu</h1>
      <p style="margin: 6px 0 0; font-size: 13px; color: #C59B27; font-weight: 600;">Law · CS · CA — One Bridge</p>
    </div>
    <div style="padding: 30px 24px;">
      <h2 style="font-size: 18px; font-weight: 800; color: #0B2559; margin-top: 0;">Hello, {enquiry.full_name}!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Thank you for submitting your enquiry. Our team has received your request and logged reference <b>{enquiry.id}</b>.
      </p>
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 20px; margin: 18px 0; font-size: 13px;">
        <p style="margin: 4px 0;"><b>Practice Area:</b> {enquiry.service_pillar}</p>
        <p style="margin: 4px 0;"><b>Topic / Requirement:</b> {enquiry.topic}</p>
        <p style="margin: 4px 0;"><b>Contact Phone:</b> {enquiry.phone_number}</p>
      </div>
      <p style="font-size: 13px; line-height: 1.6; color: #64748B;">
        Our empanelled professional will reach out to you directly via phone callback at <b>{enquiry.phone_number}</b> shortly.
      </p>
    </div>
  </div>
</body>
</html>"""
        _deliver_email(
            to_email=enquiry.email,
            to_name=enquiry.full_name,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
            action_type="enquiry_confirmation",
            extra_meta={"enquiry_id": enquiry.id}
        )
    except Exception as exc:
        print(f"Failed to dispatch enquiry confirmation email: {exc}")

    return enquiry
