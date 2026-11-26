import os
import json
import smtplib
import logging
from datetime import datetime, timezone
from pathlib import Path
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("ventureblueprint.email")

# Persistent storage directory for all dispatched and logged emails
STORAGE_SENT_EMAILS = Path(__file__).resolve().parent.parent.parent / "storage" / "sent_emails"
STORAGE_SENT_EMAILS.mkdir(parents=True, exist_ok=True)


def _deliver_email(
    to_email: str,
    to_name: str,
    subject: str,
    body_text: str,
    body_html: str,
    action_type: str = "general",
    extra_meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Core delivery engine:
    1. Persists every email as HTML & JSON in backend/storage/sent_emails/
    2. Attempts live external delivery via configured SMTP (Gmail, SendGrid, AWS SES, or custom relay)
    3. Handles STARTTLS and SSL seamlessly with graceful fallback
    """
    to_email = to_email.strip().lower()
    name = to_name.strip() or "Entrepreneur"

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    safe_email = to_email.replace("@", "_at_").replace(".", "_")
    base_filename = f"{timestamp}_{safe_email}_{action_type}"

    html_file = STORAGE_SENT_EMAILS / f"{base_filename}.html"
    json_file = STORAGE_SENT_EMAILS / f"{base_filename}.json"

    meta_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "to_email": to_email,
        "to_name": name,
        "subject": subject,
        "action_type": action_type,
        "status": "pending_delivery",
        "portal_url": settings.PORTAL_URL,
        "smtp_host": settings.SMTP_HOST or "none",
        "smtp_port": settings.SMTP_PORT,
        "body_text": body_text,
        **(extra_meta or {})
    }

    # Save to disk
    try:
        html_file.write_text(body_html, encoding="utf-8")
        json_file.write_text(json.dumps(meta_data, indent=2), encoding="utf-8")
    except Exception as e:
        logger.error(f"Failed to write email audit file: {e}")

    # SMTP Delivery
    smtp_success = False
    smtp_error = None

    if settings.SMTP_HOST:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = formataddr((settings.SMTP_FROM_NAME, settings.SMTP_FROM))
            msg["To"] = formataddr((name, to_email))
            msg.attach(MIMEText(body_text, "plain", "utf-8"))
            msg.attach(MIMEText(body_html, "html", "utf-8"))

            if settings.SMTP_SSL or settings.SMTP_PORT == 465:
                with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=8) as server:
                    if settings.SMTP_USER and settings.SMTP_PASSWORD:
                        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.SMTP_FROM, [to_email], msg.as_string())
                    smtp_success = True
            else:
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=8) as server:
                    if settings.SMTP_TLS:
                        server.starttls()
                    if settings.SMTP_USER and settings.SMTP_PASSWORD:
                        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.SMTP_FROM, [to_email], msg.as_string())
                    smtp_success = True

            logger.info(f"Live SMTP email successfully dispatched to {to_email}")
        except Exception as exc:
            smtp_error = str(exc)
            logger.info(f"SMTP delivery attempted to {to_email} ({settings.SMTP_HOST}:{settings.SMTP_PORT}): {exc}. Stored in {html_file.name}")
    else:
        smtp_error = "SMTP_HOST not configured; recorded in persistent storage"
        logger.info(f"Email recorded in storage for {to_email} (SMTP unconfigured)")

    meta_data["status"] = "delivered_via_smtp" if smtp_success else "persisted_locally"
    meta_data["smtp_error"] = smtp_error
    try:
        json_file.write_text(json.dumps(meta_data, indent=2), encoding="utf-8")
    except Exception:
        pass

    return {
        "success": True,
        "status": meta_data["status"],
        "recipient": to_email,
        "file": str(html_file),
        "smtp_dispatched": smtp_success,
        "smtp_error": smtp_error
    }


def send_welcome_email(recipient_email: str, recipient_name: str, phone: Optional[str] = None) -> Dict[str, Any]:
    """
    Dispatches a statutory onboarding confirmation email to newly registered users.
    Contains 100-150 words of practical guidance on establishing their venture under Indian law.
    """
    name = recipient_name.strip() or "Entrepreneur"
    subject = "Welcome to VentureBlueprint – Your Corporate Setup & Compliance Journey Begins"

    body_text = f"""Dear {name},

Thank you for signing in to VentureBlueprint, India's premier corporate establishment and statutory compliance operating system.

Your account has been successfully registered. VentureBlueprint empowers you to navigate the complete lifecycle of Indian company formation with complete regulatory confidence. From real-time MCA Rule 8 and Trademark name screening to comprehensive 7-section venture questionnaires, legal structure evaluations (Private Limited vs. LLP vs. OPC), customized organizational role plans, and official SPICe+ compliant registration roadmaps, your setup process is fully guided.

To begin, visit your workspace Dashboard, create your startup project, and complete your venture dossier. Our deterministic regulatory engine will automatically evaluate your business model against the Companies Act, 2013, FEMA, and the DPDP Act, 2023.

Welcome aboard, and best wishes on your entrepreneurial journey.

Warm regards,
The VentureBlueprint Team
{settings.PORTAL_URL}
"""

    body_html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to VentureBlueprint</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">VentureBlueprint</h1>
      <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Statutory Operating System for Indian Ventures</p>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Welcome, {name}!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Thank you for signing in to <b>VentureBlueprint</b>, India's premier corporate establishment and statutory compliance operating system.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Your account has been successfully registered. VentureBlueprint empowers you to navigate the complete lifecycle of Indian company formation with complete regulatory confidence. From real-time MCA Rule 8 and Trademark name screening to comprehensive 7-section venture questionnaires, legal structure evaluations (Private Limited vs. LLP vs. OPC), customized organizational role plans, and official SPICe+ compliant registration roadmaps, your setup process is fully guided.
      </p>
      <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 6px; font-size: 13px; color: #065f46; font-weight: 700;">Next Steps to Setup Your Company:</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #047857; line-height: 1.5;">
          <li><b>Create your first project</b> and validate your proposed company name in real-time.</li>
          <li><b>Complete the 7-section questionnaire</b> with your founders, capital, and office location.</li>
          <li><b>Review statutory compliance</b> across Companies Act, FEMA, and DPDP Act provisions.</li>
          <li><b>Download your official Company Setup Blueprint</b> in PDF and DOCX formats.</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{settings.PORTAL_URL}/dashboard" style="background-color: #059669; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block;">
          Open Your Venture Workspace &rarr;
        </a>
      </div>
      <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin-bottom: 0;">
        Warm regards,<br>
        <b>The VentureBlueprint Team</b><br>
        <a href="{settings.PORTAL_URL}" style="color: #059669; text-decoration: none;">{settings.PORTAL_URL}</a>
      </p>
    </div>
    <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
      This confirmation email was delivered to <b>{recipient_email}</b> following your registration on VentureBlueprint.
    </div>
  </div>
</body>
</html>
"""
    return _deliver_email(
        to_email=recipient_email,
        to_name=name,
        subject=subject,
        body_text=body_text,
        body_html=body_html,
        action_type="registration_welcome",
        extra_meta={"phone": phone}
    )


def send_blueprint_ready_email(
    recipient_email: str,
    recipient_name: str,
    project_name: str,
    project_id: str,
    recommended_structure: str = "Private Limited Company",
    doc_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Item 10: Dispatches official notification when the Company Setup Blueprint is compiled.
    Provides direct download references and official next-step instructions.
    """
    name = recipient_name.strip() or "Entrepreneur"
    subject = f"Your Company Setup Blueprint is Ready: {project_name} (MCA Dossier Compiled)"
    doc_link = f"{settings.PORTAL_URL}/projects/{project_id}/documents"

    body_text = f"""Dear {name},

Great news! The official Company Setup Blueprint for '{project_name}' has been successfully compiled and validated by VentureBlueprint's statutory engine.

Your comprehensive regulatory dossier includes:
1. Recommended Structure: {recommended_structure} (evaluated against Companies Act 2013 norms)
2. MCA SPICe+ Part A & Part B Roadmap
3. Verified Statutory Cost Estimate & Stamp Duty Schedule
4. Role Matrix (Resident Director & Auditor mandates)
5. Mandatory Post-Incorporation Compliance Deadlines (Form ADT-1 & Form INC-20A)

You can view, review, and download your official PDF and DOCX documents directly from your project workspace:
{doc_link}

Next Step: We recommend sharing this verified Blueprint with your practicing CA/CS to initiate SPICe+ Part A name reservation on the MCA21 portal.

Warm regards,
The VentureBlueprint Team
{settings.PORTAL_URL}
"""

    body_html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Company Setup Blueprint Ready</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">VentureBlueprint</h1>
      <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Official Company Setup Blueprint Ready</p>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Congratulations, {name}!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        The official <b>Company Setup Blueprint</b> for <b>{project_name}</b> has been compiled and validated against the Companies Act 2013, MCA Rule 8, and state stamp duty guidelines.
      </p>

      <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 6px; font-size: 13px; color: #065f46; font-weight: 700;">Key Blueprint Specifications:</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #047857; line-height: 1.5;">
          <li><b>Recommended Structure:</b> {recommended_structure}</li>
          <li><b>Statutory Filing Form:</b> MCA SPICe+ (INC-32) & Linked e-MOA/e-AOA</li>
          <li><b>Auditor Appointment:</b> Form ADT-1 mandatory within 30 days</li>
          <li><b>Commencement Notice:</b> Form INC-20A mandatory within 180 days</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="{doc_link}" style="background-color: #059669; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block;">
          Download Blueprint Documents (PDF &amp; DOCX) &rarr;
        </a>
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin-bottom: 0;">
        Next Step: Provide this blueprint to your company secretary or Chartered Accountant to execute the MCA SPICe+ Part A name reservation.<br><br>
        Warm regards,<br>
        <b>The VentureBlueprint Team</b>
      </p>
    </div>
    <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
      Notification generated for <b>{recipient_email}</b> · Project: <b>{project_name}</b>
    </div>
  </div>
</body>
</html>
"""

    return _deliver_email(
        to_email=recipient_email,
        to_name=name,
        subject=subject,
        body_text=body_text,
        body_html=body_html,
        action_type="blueprint_generated",
        extra_meta={"project_id": project_id, "project_name": project_name, "doc_id": doc_id}
    )


def send_consultation_confirmation_email(
    recipient_email: str,
    recipient_name: str,
    reference_id: str,
    pillar: str,
    assigned_expert: str,
    expert_role: str,
    topic: str,
    preferred_date: Optional[str] = None,
    preferred_time_slot: Optional[str] = None,
    meeting_link: Optional[str] = None,
    company_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Dispatches instant consultation booking and expert assignment confirmation email
    to the user's registered or provided email address.
    """
    name = recipient_name.strip() or "Entrepreneur"
    subject = f"Consultation Confirmed: {reference_id} · Assigned to {assigned_expert} ({pillar})"

    date_str = preferred_date or "To be scheduled within 24 hours"
    time_str = preferred_time_slot or "Morning Slot (10:00 AM - 1:00 PM)"
    meet_url = meeting_link or "https://meet.google.com/corpsetu-advisory"
    comp_str = f" for {company_name}" if company_name else ""

    body_text = f"""Dear {name},

Your consultation request has been successfully assigned!

We have assigned your session{comp_str} to our empanelled expert:
- Specialist: {assigned_expert} ({expert_role})
- Practice Area: {pillar} (Corporate Law, CS & CA)
- Reference ID: {reference_id}
- Topic: {topic}
- Scheduled Date: {date_str}
- Preferred Time: {time_str}
- Video Meeting Room: {meet_url}

Our expert has received your dossier and will connect with you via phone and the video meeting link above.

You can track your consultation live anytime on your CorpSetu Dashboard:
{settings.PORTAL_URL}/consultations

Warm regards,
CorpSetu Advisory & Dispatch Team
Law · CS · CA — One Bridge
{settings.PORTAL_URL}
"""

    body_html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Consultation Assigned &amp; Confirmed</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background: linear-gradient(135deg, #0B2559 0%, #17387A 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">CorpSetu</h1>
      <p style="margin: 6px 0 0; font-size: 13px; color: #C59B27; font-weight: 600;">Law · CS · CA — One Bridge</p>
    </div>
    <div style="padding: 32px 24px;">
      <div style="display: inline-block; background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 20px; padding: 4px 14px; margin-bottom: 16px;">
        <span style="color: #065F46; font-size: 12px; font-weight: 700;">✓ Request Assigned Successfully</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #0B2559; margin-top: 0;">Hello, {name}!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Your consultation request has been assigned to our verified professional desk{comp_str}. Below are your official tracking reference and session details:
      </p>

      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748B; width: 140px; font-weight: 600;">Reference ID:</td>
            <td style="padding: 6px 0; font-weight: 800; color: #0B2559; font-family: monospace;">{reference_id}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Assigned Expert:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0F172A;">{assigned_expert}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Role / Pillar:</td>
            <td style="padding: 6px 0; color: #047857; font-weight: 700;">{expert_role} ({pillar})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Topic / Requirement:</td>
            <td style="padding: 6px 0; color: #1E293B;">{topic}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Preferred Slot:</td>
            <td style="padding: 6px 0; color: #1E293B;">{date_str} ({time_str})</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #EFF6FF; border-left: 4px solid #1E40AF; padding: 14px 16px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin: 0 0 6px; font-size: 13px; color: #1E40AF; font-weight: 700;">Video Meeting Room:</h4>
        <p style="margin: 0; font-size: 13px; color: #1E3A8A;">
          <a href="{meet_url}" style="color: #1E40AF; font-weight: 700; text-decoration: underline;">{meet_url}</a>
        </p>
        <p style="margin: 6px 0 0; font-size: 12px; color: #475569;">
          Our expert will contact you by phone prior to the call. Please keep any financial/ROC documents ready.
        </p>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="{settings.PORTAL_URL}/consultations" style="background-color: #0B2559; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 700; display: inline-block;">
          Track in Your Consultations &rarr;
        </a>
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #64748B; margin-bottom: 0;">
        Warm regards,<br>
        <b>CorpSetu Advisory &amp; Dispatch Team</b><br>
        <a href="{settings.PORTAL_URL}" style="color: #0B2559; text-decoration: none;">www.corpsetu.com</a>
      </p>
    </div>
    <div style="background: #F1F5F9; padding: 14px 24px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0;">
      Confirmation email dispatched to <b>{recipient_email}</b> · Reference: <b>{reference_id}</b>
    </div>
  </div>
</body>
</html>
"""

    return _deliver_email(
        to_email=recipient_email,
        to_name=name,
        subject=subject,
        body_text=body_text,
        body_html=body_html,
        action_type="consultation_assigned",
        extra_meta={
            "reference_id": reference_id,
            "pillar": pillar,
            "assigned_expert": assigned_expert,
            "topic": topic
        }
    )
