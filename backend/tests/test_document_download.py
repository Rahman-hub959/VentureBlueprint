import pytest
from fastapi.testclient import TestClient
from main import app
from app.database import get_db, SessionLocal
from app.models.user import User
from app.models.project import StartupProject, BusinessProfile, Founder

client = TestClient(app)

def test_document_generation_and_download_flow():
    # 1. Login as founder
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "founder@ventureblueprint.in", "password": "Founder@Venture2026!"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create project with user details (e.g. Abdul Solutions)
    proj_res = client.post(
        "/api/v1/projects",
        json={
            "name": "Abdul Solutions",
            "domain": "Information Technology",
            "preferred_structure": "Private Limited Company"
        },
        headers=headers
    )
    assert proj_res.status_code in [200, 201]
    project_id = proj_res.json()["id"]

    # 3. Submit Questionnaire answers
    submit_res = client.post(
        f"/api/v1/questionnaires/projects/{project_id}",
        json={
            "step_id": "section_1_company",
            "answers": {
                "company_name": "Abdul Solutions Pvt Ltd",
                "business_domain": "Information Technology",
                "business_description": "Enterprise cloud infrastructure and software consultancy",
                "registered_office_address": "MG Road, Suite 402, Bengaluru, Karnataka",
                "city": "Bengaluru",
                "state": "Karnataka",
                "postal_code": "560001",
                "proposed_authorized_capital": 1000000.0,
                "proposed_paid_up_capital": 500000.0,
                "expected_employee_count": "10-25 engineers",
                "founders_list": [
                    {
                        "full_name": "Abdul Rahman",
                        "email": "abdul@solutions.in",
                        "proposed_shareholding_percentage": 70,
                        "is_resident_of_india": True,
                        "executive_role": "Managing Director"
                    }
                ]
            }
        },
        headers=headers
    )
    assert submit_res.status_code == 200

    # 4. Generate DOC-A (Company Formation Blueprint) PDF
    gen_res = client.post(
        f"/api/v1/documents/projects/{project_id}/generate",
        json={"document_type": "formation_blueprint", "file_format": "pdf"},
        headers=headers
    )
    assert gen_res.status_code == 200
    doc_id = gen_res.json()["id"]

    # 5. Download with Bearer Header
    down_header_res = client.get(
        f"/api/v1/documents/download/{doc_id}",
        headers=headers
    )
    assert down_header_res.status_code == 200
    assert down_header_res.headers["content-type"] == "application/pdf"
    assert len(down_header_res.content) > 1000

    # 6. Download with Query Token (Direct URL fallback)
    down_query_res = client.get(
        f"/api/v1/documents/download/{doc_id}?token={token}"
    )
    assert down_query_res.status_code == 200
    assert down_query_res.headers["content-type"] == "application/pdf"
    assert len(down_query_res.content) > 1000

    # 7. Unauthenticated download fails safely with 401
    down_unauth_res = client.get(f"/api/v1/documents/download/{doc_id}")
    assert down_unauth_res.status_code == 401
