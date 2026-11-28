import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from main import app
from app.database import Base, engine, SessionLocal
from app.models.user import User, Notification
from app.services.otp_service import _otp_store, _otp_lock, normalize_phone_number

Base.metadata.create_all(bind=engine)
client = TestClient(app)

def test_otp_phone_normalization():
    assert normalize_phone_number("9876543210") == "+919876543210"
    assert normalize_phone_number("+91 98765 43210") == "+919876543210"
    assert normalize_phone_number("09876543210") == "+919876543210"
    assert normalize_phone_number("919876543210") == "+919876543210"

    with pytest.raises(ValueError):
        normalize_phone_number("12345")  # too short
    
    with pytest.raises(ValueError):
        normalize_phone_number("1234567890")  # does not start with 6,7,8,9

def test_send_otp_validation_errors():
    # 1. Invalid phone format
    res = client.post("/api/v1/auth/send-signup-otp", json={
        "phone_number": "123",
        "email": "newuser@corpsetu.in"
    })
    assert res.status_code == 400
    assert "valid 10-digit mobile number" in res.json()["detail"]

    # 2. Existing registered email
    res2 = client.post("/api/v1/auth/send-signup-otp", json={
        "phone_number": "9876500001",
        "email": "testfounder@corpsetu.in"  # seeded in DB
    })
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

def test_full_otp_generation_verification_and_registration():
    phone = "9876599991"
    email = "verified_founder1@corpsetu.in"
    password = "FounderPassword123!"
    full_name = "Founder First"

    # Cleanup if exists from previous run
    db = SessionLocal()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        db.delete(existing)
        db.commit()
    db.close()

    # Step 1: Request OTP
    otp_res = client.post("/api/v1/auth/send-signup-otp", json={
        "phone_number": phone,
        "email": email
    })
    assert otp_res.status_code == 200
    otp_data = otp_res.json()
    assert otp_data["status"] == "success"
    assert "dev_otp" in otp_data
    code = otp_data["dev_otp"]
    assert len(code) == 6

    # Step 2: Attempt wrong OTP verification
    wrong_res = client.post("/api/v1/auth/verify-signup-otp", json={
        "phone_number": phone,
        "otp": "000000"
    })
    assert wrong_res.status_code == 400
    assert "attempt(s) remaining" in wrong_res.json()["detail"]

    # Step 3: Verify with correct OTP via verify endpoint
    correct_pre_res = client.post("/api/v1/auth/verify-signup-otp", json={
        "phone_number": phone,
        "otp": code
    })
    assert correct_pre_res.status_code == 200
    assert correct_pre_res.json()["status"] == "success"

    # Step 4: Request a fresh OTP to complete registration via /register
    fresh_res = client.post("/api/v1/auth/send-signup-otp", json={
        "phone_number": phone,
        "email": email
    })
    assert fresh_res.status_code == 200
    fresh_code = fresh_res.json()["dev_otp"]

    # Step 5: Submit full registration with verified OTP
    reg_payload = {
        "full_name": full_name,
        "email": email,
        "password": password,
        "phone_number": phone,
        "otp": fresh_code
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == email
    assert reg_data["user"]["is_phone_verified"] is True
    assert reg_data["user"]["phone_number"] == "+919876599991"

    # Step 6: Verify in Database
    db = SessionLocal()
    user_in_db = db.query(User).filter(User.email == email).first()
    assert user_in_db is not None
    assert user_in_db.is_phone_verified is True
    assert user_in_db.phone_number == "+919876599991"
    
    # Verify Admin Notification was created
    admin_notif = db.query(Notification).filter(Notification.title.contains(full_name)).first()
    assert admin_notif is not None
    assert "+919876599991" in admin_notif.message
    db.close()

def test_otp_expiry_and_invalidation():
    phone = "9876599992"
    email = "verified_founder2@corpsetu.in"

    # Request OTP
    otp_res = client.post("/api/v1/auth/send-signup-otp", json={
        "phone_number": phone,
        "email": email
    })
    assert otp_res.status_code == 200
    code = otp_res.json()["dev_otp"]
    norm_phone = normalize_phone_number(phone)

    # Artificially expire the OTP
    with _otp_lock:
        if norm_phone in _otp_store:
            _otp_store[norm_phone]["expires_at"] = datetime.now(timezone.utc) - timedelta(minutes=1)

    # Attempt to verify expired OTP
    verify_res = client.post("/api/v1/auth/verify-signup-otp", json={
        "phone_number": phone,
        "otp": code
    })
    assert verify_res.status_code == 400
    assert "expired" in verify_res.json()["detail"].lower()

def test_registration_with_invalid_otp_rejected():
    phone = "9876599993"
    email = "verified_founder3@corpsetu.in"

    # Request OTP
    client.post("/api/v1/auth/send-signup-otp", json={
        "phone_number": phone,
        "email": email
    })

    # Submit registration with incorrect OTP
    reg_payload = {
        "full_name": "Founder Three",
        "email": email,
        "password": "Password123!",
        "phone_number": phone,
        "otp": "999999"  # Wrong code
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 400
    assert "incorrect" in reg_res.json()["detail"].lower() or "invalid" in reg_res.json()["detail"].lower()

def test_otp_max_attempts_lockout():
    phone = "9876599994"
    email = "verified_founder4@corpsetu.in"

    # Request OTP
    res = client.post("/api/v1/auth/send-signup-otp", json={
        "phone_number": phone,
        "email": email
    })
    assert res.status_code == 200

    # Wrong attempt 1
    r1 = client.post("/api/v1/auth/verify-signup-otp", json={"phone_number": phone, "otp": "111111"})
    assert r1.status_code == 400
    assert "2 attempt(s) remaining" in r1.json()["detail"]

    # Wrong attempt 2
    r2 = client.post("/api/v1/auth/verify-signup-otp", json={"phone_number": phone, "otp": "222222"})
    assert r2.status_code == 400
    assert "1 attempt(s) remaining" in r2.json()["detail"]

    # Wrong attempt 3 -> Lockout & Invalidation
    r3 = client.post("/api/v1/auth/verify-signup-otp", json={"phone_number": phone, "otp": "333333"})
    assert r3.status_code == 400
    assert "maximum incorrect attempts exceeded" in r3.json()["detail"].lower()

def test_dev_universal_code_verification():
    phone = "9876599995"
    email = "verified_founder5@corpsetu.in"

    # In non-production, test code 123456 verifies directly
    res = client.post("/api/v1/auth/verify-signup-otp", json={
        "phone_number": phone,
        "otp": "123456"
    })
    assert res.status_code == 200
    assert res.json()["status"] == "success"

