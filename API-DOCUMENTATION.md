# VentureBlueprint: REST API Specification
**Base URL:** `http://localhost:8000/api/v1`  
**Authentication Scheme:** Bearer Token (Stateless JSON Web Token / HMAC-SHA256)  
**Standard Content-Type:** `application/json` (except document download endpoints which return `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`)

---

## 1. Authentication & Identity Router (`/auth`)

### `POST /auth/register`
Creates a new entrepreneur or professional user account.

- **Request Body:**
  ```json
  {
    "email": "entrepreneur@ventureblueprint.in",
    "password": "SecurePassword123!",
    "full_name": "Rohan Deshmukh",
    "phone_number": "+91 9876543210"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "id": "usr_9b1deb4d3b7d4ebbb",
    "email": "entrepreneur@ventureblueprint.in",
    "full_name": "Rohan Deshmukh",
    "phone_number": "+91 9876543210",
    "is_active": true,
    "role": "Founder",
    "created_at": "2026-11-17T12:00:00Z"
  }
  ```

---

### `POST /auth/login`
Authenticates user credentials using Argon2id and generates a JWT bearer token.

- **Request Body:**
  ```json
  {
    "email": "entrepreneur@ventureblueprint.in",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in_minutes": 1440,
    "user": {
      "id": "usr_9b1deb4d3b7d4ebbb",
      "email": "entrepreneur@ventureblueprint.in",
      "full_name": "Rohan Deshmukh",
      "role": "Founder"
    }
  }
  ```

---

### `GET /auth/me`
Retrieves profile information for the currently authenticated user.
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response `200 OK`:** User object matching register response.

---

## 2. Project Lifecycle Management Router (`/projects`)

### `GET /projects`
Lists all startup projects owned by the authenticated user.
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response `200 OK`:** Array of project summary objects.

---

### `POST /projects`
Initializes a new company formation project.
- **Request Body:**
  ```json
  {
    "name": "Kaveri Logistics",
    "domain": "Logistics & Supply Chain",
    "preferred_structure": "Private Limited Company",
    "accent_color": "emerald"
  }
  ```
- **Response `201 Created`:** Project object with unique UUID, zero completion percentage, and active state.

---

### `GET /projects/{project_id}`
Returns the comprehensive project record, including associated `business_profile`, `founders`, `structure_assessment`, and `compliance_tasks`.

---

### `PUT /projects/{project_id}`
Updates top-level project metadata (name, domain, preferred structure).

---

### `DELETE /projects/{project_id}`
Soft or hard deletes a project and cascading child records (questionnaires, generated documents, tasks).

---

### `POST /projects/{project_id}/duplicate`
Clones an existing project configuration into a new draft project.

---

## 3. Multi-Step Questionnaire Router (`/questionnaires`)

### `GET /questionnaires/projects/{project_id}`
Retrieves all persisted answers categorized by section ID (`section_1_company` through `section_7_review`).

---

### `POST /questionnaires/projects/{project_id}`
Saves or updates answers for a specific step in the 7-section questionnaire wizard.

- **Request Body:**
  ```json
  {
    "step_id": "section_3_location",
    "answers": {
      "state": "Karnataka",
      "city": "Bengaluru",
      "registered_office_address": "Indiranagar 100ft Road, Bengaluru, 560038",
      "postal_code": "560038",
      "premise_type": "Commercial Leased",
      "expected_employee_count": "6-15 people"
    }
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "status": "success",
    "step_id": "section_3_location",
    "completion_percentage": 50,
    "message": "Section answers saved successfully"
  }
  ```

---

## 4. Statutory Validation & Name Pre-screening Router (`/validation`)

### `POST /validation/name-prescreen`
Executes real-time pre-screening of a proposed corporate name under MCA Rule 8 and 8A/8B.

- **Request Body:**
  ```json
  {
    "name": "Kaveri Cold Brew Private Limited",
    "legal_structure": "Private Limited Company"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "is_valid": true,
    "score": 92,
    "normalized_name": "KAVERI COLD BREW PRIVATE LIMITED",
    "errors": [],
    "warnings": [],
    "recommendations": [
      "Ensure trademark search is conducted on Class 30 and 43 prior to SPICe+ Part A submission."
    ],
    "prohibited_matches": [],
    "financial_regulatory_keywords": [],
    "suffix_check": {
      "valid": true,
      "detected_suffix": "Private Limited",
      "required_suffix": "Private Limited Company"
    }
  }
  ```

---

### `POST /validation/structure-recommendation`
Evaluates legal structures based on founder count, investor intent, liability requirements, and authorized capital.

- **Request Body:**
  ```json
  {
    "founder_count": 2,
    "has_investor_participation": true,
    "proposed_authorized_capital": 500000.0,
    "preferred_structure": "Private Limited Company",
    "business_domain": "SaaS & Cloud Services"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "recommended_structure": "Private Limited Company",
    "suitability_score": 95,
    "rationale": "Recommended due to equity investor participation and multi-founder composition.",
    "advantages": [
      "Separate legal entity status protecting personal founder assets",
      "Capacity to issue equity shares, ESOPs, and convertible notes",
      "Preferred vehicle for venture capital and angel investment in India"
    ],
    "disadvantages_and_limitations": [
      "Higher statutory annual filing compliance compared to LLP",
      "Mandatory statutory audit by an independent CA regardless of turnover"
    ],
    "statutory_requirements_summary": "Minimum 2 directors, 2 shareholders, registered office in India, resident director.",
    "estimated_incorporation_timeline": "7 to 14 business days via SPICe+ portal",
    "estimated_government_fee_range": "₹2,000 to ₹8,000 (excluding professional drafting fees)"
  }
  ```

---

### `POST /validation/project/{project_id}/run`
Executes the cross-field statutory validation engine against the complete project model.

- **Checks Executed:**
  - MCA Rule 8 name compatibility.
  - Founder count vs. legal structure statutory minimums.
  - Ownership percentage summation (must equal 100%).
  - Registered office address completeness under Section 12 of Companies Act, 2013.
  - Authorized capital requirements.

---

## 5. Regulatory Knowledge Base Router (`/regulations`)

### `GET /regulations/domains`
Returns the 17 standardized business domains and illustrative activities (E-commerce, FinTech, SaaS, Healthcare, Logistics, CleanTech, Food & Beverage, etc.).

---

### `GET /regulations/sources`
Returns official regulatory sources, governing ministries, and web links (MCA, CBIC, DPIIT, MSME, MeitY, RBI, SEBI).

---

### `GET /regulations/rules`
Queries published regulatory rules with optional filtering:
- Query parameters: `?category=corporate_law&structure=Private%20Limited%20Company`

---

### `GET /regulations/rules/{rule_code}`
Retrieves a specific rule (e.g., `RULE-MCA-001`, `RULE-GST-001`, `RULE-MSME-001`).

---

## 6. Compliance Evaluation & Task Manager Router (`/compliance`)

### `POST /compliance/projects/{project_id}/assess`
Evaluates the project against all published statutory rules and generates interactive `ComplianceTask` records.

---

### `GET /compliance/projects/{project_id}/assessment`
Returns the breakdown of compliance findings (`Passed`, `Warning`, `Failed`, `Needs Additional Information`).

---

### `GET /compliance/projects/{project_id}/tasks`
Lists all actionable compliance tasks for the project.

---

### `PUT /compliance/tasks/{task_id}`
Updates task execution state.
- **Request Body:**
  ```json
  {
    "status": "Completed",
    "notes": "DSC obtained from eMudhra on 17 Nov 2026",
    "due_date": "2026-11-30"
  }
  ```

---

### `GET /compliance/projects/{project_id}/roles`
Generates statutory, management, operational, and external professional role recommendations.

---

## 7. Professional Document Generation Router (`/documents`)

### `POST /documents/projects/{project_id}/generate`
Compiles and generates a professional document locally using ReportLab or python-docx.

- **Supported Document Types:**
  - `formation_blueprint`: Complete Company Formation Blueprint
  - `mca_compliance`: MCA Compliance & Filing Strategy Report
  - `pre_incorporation_checklist`: Pre-Incorporation Checklist & Evidence Guide
  - `legal_structure_report`: Legal Structure Evaluation Report
  - `governance_advisory`: Founder & Governance Advisory Report
  - `operational_plan`: Operational Setup & Infrastructure Plan
  - `statutory_calendar`: Statutory Compliance Calendar
  - `executive_summary`: Executive Formation Summary
- **Request Body:**
  ```json
  {
    "document_type": "formation_blueprint",
    "file_format": "pdf"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "id": "doc_a7c3e129b0f44",
    "document_type": "formation_blueprint",
    "file_format": "pdf",
    "version": 1,
    "file_size_bytes": 48120,
    "checksum_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "download_url": "/api/v1/documents/download/doc_a7c3e129b0f44"
  }
  ```

---

### `GET /documents/download/{document_id}`
Streams the binary document directly to the client browser with content disposition attachment.

---

### `GET /documents/{document_id}/verify`
Recalculates the SHA-256 hash of the on-disk file and verifies it against the recorded checksum in the database to detect tampering.

---

## 8. Administrative Portal Router (`/admin`)

*All administrative endpoints require an account with `Admin` role.*

- `GET /admin/stats`: Aggregate platform counts (users, projects, documents, tasks).
- `GET /admin/users`: User management list.
- `PUT /admin/users/{user_id}/status`: Activate/Deactivate user access.
- `GET /admin/rules`: List all regulatory rules (including Draft status).
- `POST /admin/rules`: Create new statutory rule draft.
- `PUT /admin/rules/{rule_id}/status`: Approve and transition rule to `Published`.
- `GET /admin/audit-logs`: Query chronological audit trail entries.
- `GET /admin/health`: Real-time system diagnostics (database connection, storage read/write status, available disk space).
