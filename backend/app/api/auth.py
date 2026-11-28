from datetime import datetime, timezone
import logging
import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.user import User, Role, UserSession
from app.models.audit import AuditLog
from app.services.email_service import send_welcome_email
from app.services.notification_service import notify_admin
from app.services.otp_service import generate_and_send_otp, verify_otp, normalize_phone_number
from app.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.schemas.all_schemas import (
    SendOtpRequest,
    VerifyOtpRequest,
    UserRegister,
    UserLogin,
    Token,
    UserResponse,
    PasswordResetRequest,
    PasswordResetConfirm
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/send-signup-otp")
def send_signup_otp(req: SendOtpRequest, db: Session = Depends(get_db)):
    """
    Validates phone number and email uniqueness, generates a 6-digit OTP,
    and dispatches it via SMS / dev sandbox.
    """
    # 1. Validate phone number format
    try:
        norm_phone = normalize_phone_number(req.phone_number)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

    # 2. Check if email already registered
    if req.email:
        existing_email = db.query(User).filter(User.email == str(req.email).lower().strip()).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists. Please Sign In."
            )

    # 3. Check if phone number already registered with an active user
    existing_phone = db.query(User).filter(
        (User.phone_number == norm_phone) | (User.phone_number == req.phone_number.strip())
    ).first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This mobile number is already registered with an account. Please Sign In."
        )

    # 4. Generate & dispatch OTP
    try:
        res = generate_and_send_otp(req.phone_number, str(req.email) if req.email else "")
        return res
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(ve))
    except Exception as ex:
        logging.getLogger("corpsetu.auth").error(f"Failed to generate OTP: {ex}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification code. Please try again."
        )

@router.post("/verify-signup-otp")
def verify_signup_otp_endpoint(req: VerifyOtpRequest):
    """
    Validates the 6-digit mobile OTP before account submission.
    """
    valid, msg = verify_otp(req.phone_number, req.otp)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
    return {"status": "success", "message": msg}

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check existing user
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )
    
    # Phone number & OTP validation
    is_phone_verified = False
    norm_phone = None
    if user_in.phone_number:
        try:
            norm_phone = normalize_phone_number(user_in.phone_number)
        except ValueError as ve:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
        
        # Check duplicate phone
        existing_phone = db.query(User).filter(
            (User.phone_number == norm_phone) | (User.phone_number == user_in.phone_number.strip())
        ).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This mobile number is already registered with another account."
            )
        
        # Verify OTP
        if user_in.otp:
            valid, msg = verify_otp(norm_phone, user_in.otp)
            if not valid:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
            is_phone_verified = True
        elif getattr(settings, "ENVIRONMENT", "development").lower() == "production":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mobile number OTP verification is required to complete registration."
            )

    # Get or create Entrepreneur role
    role = db.query(Role).filter(Role.name == "Entrepreneur").first()
    if not role:
        role = Role(name="Entrepreneur", description="Standard business founder")
        db.add(role)
        db.flush()

    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone_number=norm_phone or user_in.phone_number,
        is_phone_verified=is_phone_verified,
        role_id=role.id,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Issue Tokens
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    refresh_token = create_refresh_token(data={"sub": user.id})

    # Record Session & Audit
    session = UserSession(
        user_id=user.id,
        token_hash=get_password_hash(access_token[-16:]),
        expires_at=datetime.now(timezone.utc)
    )
    audit = AuditLog(
        user_id=user.id,
        action="USER_REGISTERED",
        entity_type="user",
        entity_id=user.id,
        details={"email": user.email}
    )
    db.add(session)
    db.add(audit)
    db.commit()

    # Alert administrators about new client registration
    notify_admin(
        db=db,
        title=f"New User Registered: {user.full_name}",
        message=f"{user.full_name} registered with email {user.email} and mobile {user.phone_number or 'Not provided'}.",
        category="admin_alert",
        link="/admin"
    )

    # Dispatch Onboarding & Confirmation Email
    try:
        email_res = send_welcome_email(user.email, user.full_name, user.phone_number)
        email_audit = AuditLog(
            user_id=user.id,
            action="WELCOME_EMAIL_DISPATCHED",
            entity_type="email",
            entity_id=user.id,
            details=email_res
        )
        db.add(email_audit)
        db.commit()
    except Exception as email_err:
        logging.getLogger("corpsetu.auth").error(f"Failed to dispatch welcome email: {email_err}")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "is_phone_verified": getattr(user, "is_phone_verified", False),
            "role": role.name
        }
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is inactive")

    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    refresh_token = create_refresh_token(data={"sub": user.id})

    role_name = user.role.name if user.role else "Entrepreneur"

    user.last_login_at = datetime.now(timezone.utc)
    user.last_active_at = datetime.now(timezone.utc)

    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        entity_type="user",
        entity_id=user.id
    )
    db.add(audit)
    db.commit()

    # Alert administrators about user login (mandatory real-time arrival notice)
    notify_admin(
        db=db,
        title=f"User Signed In: {user.full_name}",
        message=f"{user.full_name} ({user.email}, {user.phone_number or 'No mobile'}) logged into the platform.",
        category="admin_alert",
        link="/admin"
    )

    # Dispatch official login security email to user's registered mail
    try:
        from app.services.email_service import send_login_notification_email
        send_login_notification_email(user.email, user.full_name)
    except Exception as email_err:
        logging.getLogger("corpsetu.auth").error(f"Login notification email failed: {email_err}")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "is_phone_verified": getattr(user, "is_phone_verified", False),
            "role": role_name
        }
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone_number": current_user.phone_number,
        "is_phone_verified": getattr(current_user, "is_phone_verified", False),
        "role": current_user.role.name if current_user.role else "Entrepreneur",
        "is_active": current_user.is_active,
        "preferences": current_user.preferences or {}
    }

@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    # Always return success message to prevent user enumeration
    return {"message": "If this email is registered, password reset instructions have been recorded."}

@router.post("/reset-password")
def reset_password(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset request")
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password successfully reset. You may now log in with your new password."}

@router.get("/my-confirmation-email")
def get_my_confirmation_email(current_user: User = Depends(get_current_user)):
    """Returns the latest confirmation email dispatched to this user."""
    storage_dir = Path(__file__).resolve().parent.parent.parent / "storage" / "sent_emails"
    safe_email = current_user.email.replace("@", "_at_").replace(".", "_")
    files = sorted(storage_dir.glob(f"*_{safe_email}.json"), reverse=True)
    if not files:
        return {"found": False, "message": "No confirmation email record found on file"}
    return {"found": True, "data": json.loads(files[0].read_text(encoding="utf-8"))}
