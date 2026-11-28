import re
import secrets
import logging
import threading
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, Tuple
from app.config import settings

logger = logging.getLogger("corpsetu.otp")
logger.setLevel(logging.INFO)

# Thread-safe in-memory store for OTP records
# Key: normalized phone number -> Dict with code, email, created_at, expires_at, attempts
_otp_lock = threading.Lock()
_otp_store: Dict[str, Dict[str, Any]] = {}
_rate_limit_store: Dict[str, list] = {}

def normalize_phone_number(phone: str) -> str:
    """
    Normalizes Indian phone numbers to standard E.164-like format: +91XXXXXXXXXX
    """
    if not phone:
        return ""
    # Strip all non-digit characters except leading plus
    cleaned = re.sub(r"[^\d+]", "", phone.strip())
    
    if cleaned.startswith("+91"):
        digits = cleaned[3:]
    elif cleaned.startswith("91") and len(cleaned) == 12:
        digits = cleaned[2:]
    elif cleaned.startswith("0") and len(cleaned) == 11:
        digits = cleaned[1:]
    else:
        digits = cleaned.lstrip("+")
    
    # Check if exactly 10 digits
    if len(digits) != 10:
        raise ValueError("Please provide a valid 10-digit mobile number.")
    
    # Must start with 6, 7, 8, or 9 for Indian mobile numbers
    if digits[0] not in "6789":
        raise ValueError("Mobile number must be a valid Indian mobile number starting with 6, 7, 8, or 9.")
        
    return f"+91{digits}"

def generate_and_send_otp(phone_number: str, email: str = "") -> Dict[str, Any]:
    """
    Generates a secure 6-digit OTP, stores it with 5-minute TTL, and dispatches via SMS or dev logger.
    """
    normalized_phone = normalize_phone_number(phone_number)
    now = datetime.now(timezone.utc)
    
    with _otp_lock:
        # Rate-limiting check: max 4 requests per phone number within 10 minutes
        history = _rate_limit_store.get(normalized_phone, [])
        cutoff = now - timedelta(minutes=10)
        recent_requests = [t for t in history if t > cutoff]
        
        if len(recent_requests) >= 4:
            raise ValueError("Too many OTP requests for this number. Please wait 10 minutes before trying again.")
        
        recent_requests.append(now)
        _rate_limit_store[normalized_phone] = recent_requests
        
        # Generate 6-digit numeric OTP
        code = str(secrets.randbelow(900000) + 100000)
        expires_at = now + timedelta(minutes=5)
        
        _otp_store[normalized_phone] = {
            "otp": code,
            "email": email.strip().lower() if email else "",
            "phone_number": normalized_phone,
            "created_at": now,
            "expires_at": expires_at,
            "attempts": 0,
            "max_attempts": 3,
        }

    # Dispatch via SMS gateway if configured, else log to console/sandbox
    sms_sent = False
    sms_gateway_key = getattr(settings, "SMS_GATEWAY_API_KEY", "")
    
    if sms_gateway_key:
        try:
            # Here we can hook up Fast2SMS, Twilio, or Msg91
            import urllib.request
            import urllib.parse
            import json
            
            # Example Fast2SMS Quick SMS integration
            url = "https://www.fast2sms.com/dev/bulkV2"
            raw_mobile = normalized_phone.replace("+91", "")
            sms_data = json.dumps({
                "route": "otp",
                "variables_values": code,
                "numbers": raw_mobile,
            }).encode("utf-8")
            
            req = urllib.request.Request(
                url,
                data=sms_data,
                headers={
                    "authorization": sms_gateway_key,
                    "Content-Type": "application/json",
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status in (200, 201):
                    sms_sent = True
                    logger.info(f"SMS OTP dispatched successfully to {normalized_phone}")
        except Exception as ex:
            logger.warning(f"SMS gateway delivery failed, falling back to local sandbox: {ex}")

    # Standard dev/sandbox logging
    masked_phone = f"{normalized_phone[:6]}*****{normalized_phone[-2:]}"
    print(f"\n=======================================================")
    print(f" [CorpSetu Mobile Verification] OTP Code for {normalized_phone}")
    print(f" OTP: {code}  (Expires in 5 minutes)")
    print(f"=======================================================\n")
    logger.info(f"[CorpSetu OTP] Code for {normalized_phone}: {code}")

    is_production = getattr(settings, "ENVIRONMENT", "development").lower() == "production"
    
    return {
        "status": "success",
        "message": f"6-digit verification code sent to {masked_phone}",
        "phone_number": normalized_phone,
        "masked_phone": masked_phone,
        "expires_in_seconds": 300,
        "dev_otp": code if not is_production else None,
    }

def verify_otp(phone_number: str, code: str) -> Tuple[bool, str]:
    """
    Verifies the submitted 6-digit OTP.
    Returns (success: bool, message: str).
    """
    if not code or not code.strip():
        return False, "Please enter the 6-digit verification code."
    
    code_clean = code.strip()
    
    try:
        normalized_phone = normalize_phone_number(phone_number)
    except ValueError as ve:
        return False, str(ve)
    
    now = datetime.now(timezone.utc)
    is_production = getattr(settings, "ENVIRONMENT", "development").lower() == "production"
    
    # Universal dev/testing bypass code in non-production environments
    if not is_production and code_clean == "123456":
        return True, "Phone number verified successfully (Test Code)."

    with _otp_lock:
        record = _otp_store.get(normalized_phone)
        
        if not record:
            return False, "No active verification code found for this phone number. Please request a new code."
        
        # Check expiry
        if now > record["expires_at"]:
            del _otp_store[normalized_phone]
            return False, "Verification code has expired. Please request a new code."
        
        # Check code match
        if record["otp"] != code_clean:
            record["attempts"] += 1
            remaining = record["max_attempts"] - record["attempts"]
            if remaining <= 0:
                del _otp_store[normalized_phone]
                return False, "Maximum incorrect attempts exceeded. Please request a new verification code."
            return False, f"Incorrect verification code. {remaining} attempt(s) remaining."
        
        # Verified successfully: remove from store
        del _otp_store[normalized_phone]
        return True, "Phone number verified successfully."
