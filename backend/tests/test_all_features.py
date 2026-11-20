import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from main import app
from app.database import Base, engine, SessionLocal
from app.models.user import User, Role
from app.models.project import StartupProject

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "VentureBlueprint"
    assert data["jurisdiction"] == "Republic of India"

def test_auth_registration_and_login():
    reg_payload = {
        "email": "testfounder@ventureblueprint.in",
        "password": "SecurePassword123!",
        "full_name": "Test Founder",
        "phone_number": "+91 9988776655"
    }
    # Register
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code in [201, 400]
    
    # Login
    login_payload = {
        "email": "testfounder@ventureblueprint.in",
        "password": "SecurePassword123!"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == "testfounder@ventureblueprint.in"

    # Protected me endpoint
    headers = {"Authorization": f"Bearer {login_data['access_token']}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "testfounder@ventureblueprint.in"

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
        "email": "founder@ventureblueprint.in",
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

    # Generate PDF Document (Formation Blueprint)
    pdf_res = client.post(f"/api/v1/documents/projects/{proj_id}/generate", json={
        "document_type": "formation_blueprint",
        "file_format": "pdf"
    }, headers=headers)
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
    }, headers=headers)
    assert docx_res.status_code == 200
    assert docx_res.json()["file_size_bytes"] > 0

def test_admin_permissions_and_health():
    # Login as Admin
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@ventureblueprint.in",
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
