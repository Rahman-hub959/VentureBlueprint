import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from main import app
from app.database import Base, engine, SessionLocal
from app.models.user import User, Role
from app.models.project import StartupProject
from app import models as _app_models

Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "CorpSetu"
    assert data["jurisdiction"] == "Republic of India"

def test_auth_registration_and_login():
    reg_payload = {
        "email": "testfounder@corpsetu.in",
        "password": "SecurePassword123!",
        "full_name": "Test Founder",
        "phone_number": "+91 9988776655"
    }
    # Register
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code in [201, 400]
    
    # Login
    login_payload = {
        "email": "testfounder@corpsetu.in",
        "password": "SecurePassword123!"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == "testfounder@corpsetu.in"

    # Protected me endpoint
    headers = {"Authorization": f"Bearer {login_data['access_token']}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "testfounder@corpsetu.in"

def test_mca_name_prescreening():
    # Valid name
    res1 = client.post("/api/v1/validation/name-prescreen", json={
        "name": "Kaveri Cold Brew Private Limited",
        "legal_structure": "Private Limited Company"
    })
    assert res1.status_code == 200
    assert res1.json()["is_valid"] is True
    assert res1.json()["score"] >= 80

    # Prohibited name (Emblems and Names Act)
    res2 = client.post("/api/v1/validation/name-prescreen", json={
        "name": "Mahatma Gandhi Technologies Private Limited",
        "legal_structure": "Private Limited Company"
    })
    assert res2.status_code == 200
    assert res2.json()["is_valid"] is False

    # Financial regulatory keyword
    res3 = client.post("/api/v1/validation/name-prescreen", json={
        "name": "Quick National Banking Solution Pvt Ltd",
        "legal_structure": "Private Limited Company"
    })
    assert res3.status_code == 200
    assert len(res3.json()["warnings"]) > 0

def test_structure_recommendation():
    # Single founder -> OPC
    res1 = client.post("/api/v1/validation/structure-recommendation", json={
        "founder_count": 1,
        "has_investor_participation": False,
        "proposed_authorized_capital": 100000.0
    })
    assert res1.status_code == 200
    assert res1.json()["recommended_structure"] == "OPC"

    # 2 founders + equity investors -> Private Limited Company
    res2 = client.post("/api/v1/validation/structure-recommendation", json={
        "founder_count": 2,
        "has_investor_participation": True,
        "proposed_authorized_capital": 500000.0
    })
    assert res2.status_code == 200
    assert res2.json()["recommended_structure"] == "Private Limited Company"

def test_project_crud_and_validation():
    # Login as demo founder
    login_res = client.post("/api/v1/auth/login", json={
        "email": "founder@corpsetu.in",
        "password": "Founder@Venture2026!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create project
    proj_res = client.post("/api/v1/projects", json={
        "name": "Aura Logistics",
        "domain": "Logistics",
        "preferred_structure": "Private Limited Company",
        "accent_color": "emerald"
    }, headers=headers)
    assert proj_res.status_code == 201
    proj_id = proj_res.json()["id"]

    # Save questionnaire answers
    q_res = client.post(f"/api/v1/questionnaires/projects/{proj_id}", json={
        "step_id": "section_3_location",
        "answers": {
            "city": "Bengaluru",
            "state": "Karnataka",
            "registered_office_address": "Indiranagar 100ft Road, Bengaluru, Karnataka 560038",
            "postal_code": "560038",
            "expected_employee_count": "6-15 people"
        }
    }, headers=headers)
    assert q_res.status_code == 200

    # Run validation engine
    val_res = client.post(f"/api/v1/validation/project/{proj_id}/run", headers=headers)
    assert val_res.status_code == 200
    val_data = val_res.json()
    assert "validation_results" in val_data

    # Run compliance assessment
    comp_res = client.post(f"/api/v1/compliance/projects/{proj_id}/assess", headers=headers)
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["total_rules_assessed"] > 0

    # Login as Admin Desk for statutory compilation
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@corpsetu.in", "password": "Admin@Venture2026!"}
    )
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

    # Generate PDF Document (Formation Blueprint)
    pdf_res = client.post(f"/api/v1/documents/projects/{proj_id}/generate", json={
        "document_type": "formation_blueprint",
        "file_format": "pdf"
    }, headers=admin_headers)
    assert pdf_res.status_code == 200
    doc_id = pdf_res.json()["id"]
    assert pdf_res.json()["file_size_bytes"] > 0
    assert len(pdf_res.json()["checksum_sha256"]) == 64

    # Download Document
    down_res = client.get(f"/api/v1/documents/download/{doc_id}", headers=headers)
    assert down_res.status_code == 200
    assert down_res.headers["content-type"] == "application/pdf"

    # Generate DOCX Document (MCA Compliance Report)
    docx_res = client.post(f"/api/v1/documents/projects/{proj_id}/generate", json={
        "document_type": "mca_compliance",
        "file_format": "docx"
    }, headers=admin_headers)
    assert docx_res.status_code == 200
    assert docx_res.json()["file_size_bytes"] > 0

def test_admin_permissions_and_health():
    # Login as Admin
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@corpsetu.in",
        "password": "Admin@Venture2026!"
    })
    assert login_res.status_code == 200
    admin_token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin Stats
    stats_res = client.get("/api/v1/admin/stats", headers=headers)
    assert stats_res.status_code == 200
    assert stats_res.json()["total_users"] >= 2

    # Health Check
    health_res = client.get("/api/v1/admin/health", headers=headers)
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "healthy"

def test_consultations_lifecycle():
    # 1. Create a public consultation
    consult_payload = {
        "full_name": "Rohan Deshmukh",
        "email": "rohan.deshmukh@example.com",
        "phone_number": "+91 9876543210",
        "company_name": "Deshmukh Logistics Pvt Ltd",
        "pillar": "CA",
        "topic": "Advance Tax & GST Reconciliation Advisory",
        "preferred_time_slot": "Morning (10:00 AM - 1:00 PM)",
        "notes": "Need CA to review input tax credit mismatch"
    }
    create_res = client.post("/api/v1/consultations", json=consult_payload)
    assert create_res.status_code == 201
    data = create_res.json()
    assert data["id"].startswith("CONS-2026-")
    assert data["status"] == "Requested"
    assert "Aniket Kulkarni" in data["assigned_expert"]
    assert data["phone_number"] == "+91 9876543210"
    assert data["pillar"] == "CA"
    cons_id = data["id"]

    # 2. Get consultation by ID
    get_res = client.get(f"/api/v1/consultations/{cons_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == cons_id

    # 3. Create consultation as authenticated user
    login_res = client.post("/api/v1/auth/login", json={
        "email": "testfounder@corpsetu.in",
        "password": "SecurePassword123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    auth_consult = client.post("/api/v1/consultations", json={
        "phone_number": "+91 9988776655",
        "pillar": "LAW",
        "topic": "Founder Vesting Agreement Review"
    }, headers=headers)
    assert auth_consult.status_code == 201
    auth_data = auth_consult.json()
    assert auth_data["email"] == "testfounder@corpsetu.in"
    assert "Rajesh Varma" in auth_data["assigned_expert"]

    # 4. List user's consultations
    list_res = client.get("/api/v1/consultations", headers=headers)
    assert list_res.status_code == 200
    user_consults = list_res.json()
    assert len(user_consults) >= 1
    assert any(c["id"] == auth_data["id"] for c in user_consults)

    # 5. Cancel consultation
    cancel_res = client.patch(f"/api/v1/consultations/{auth_data['id']}/cancel", headers=headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "Cancelled"

def test_complaints_crud():
    # 1. Create complaint (Grievance)
    payload = {
        "company_name": "TestCorp LLP",
        "email": "testfounder@corpsetu.in",
        "phone_number": "+91 9988776655",
        "pillar": "CS",
        "category": "MCA SPICe+ Resubmission Query",
        "priority": "High",
        "description": "Need assistance with Clause 3(a) object drafting for MCA approval."
    }
    res = client.post("/api/v1/complaints", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["id"].startswith("CS-GRV-2026-")
    assert data["company_name"] == "TestCorp LLP"
    assert data["status"] == "Registered"
    assert "Priyanjali Sen" in data["assigned_expert"]

    # 2. List complaints
    list_res = client.get("/api/v1/complaints")
    assert list_res.status_code == 200
    tickets = list_res.json()
    assert len(tickets) >= 1
    assert any(t["id"] == data["id"] for t in tickets)

    # 3. Get single complaint
    get_res = client.get(f"/api/v1/complaints/{data['id']}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == data["id"]


