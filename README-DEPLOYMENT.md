# VentureBlueprint: Production Deployment & Containerization Guide

This guide describes how to deploy VentureBlueprint to production using Docker, Docker Compose, PostgreSQL, and Nginx.

---

## 1. Production Architecture Topology

```mermaid
flowchart TD
    Client["Client Browser (HTTPS :443)"]
    
    subgraph Host["Production Host / Cloud VM"]
        Nginx["Nginx Reverse Proxy & Static Web Server (:80 / :443)"]
        
        subgraph DockerCompose["Docker Compose Network ('venture-network')"]
            FrontendBuild["Static React 19 SPA (Nginx Alpine)"]
            BackendApp["FastAPI Uvicorn Cluster (:8000)"]
            Database[(PostgreSQL 15 Database Container :5432)]
            DocVolume[("Persistent Storage Volume: /app/storage")]
            DBVolume[("Persistent DB Volume: pgdata")]
        end
    end

    Client -->|HTTPS Traffic| Nginx
    Nginx -->|Route '/' & Static Assets| FrontendBuild
    Nginx -->|Proxy '/api/v1/*'| BackendApp
    BackendApp -->|SQL Queries via Port 5432| Database
    BackendApp -->|Read / Write Generated Documents| DocVolume
    Database --> DBVolume
```

---

## 2. Prerequisites

- **Host System:** Linux (Ubuntu 22.04 LTS recommended), macOS, or Windows Server.
- **Docker:** Docker Engine 24.0 or higher.
- **Docker Compose:** Docker Compose v2.20 or higher.
- **Hardware Minimums:** 2 vCPUs, 4 GB RAM, 20 GB SSD storage.

---

## 3. Environment Variables Configuration

Create a `.env` file in the project root directory:

```env
# Application Settings
ENVIRONMENT=production
DEBUG=false
APP_NAME=VentureBlueprint
SECRET_KEY=generate_a_cryptographically_secure_64_character_hex_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# PostgreSQL Production Database
DATABASE_URL=postgresql://venture_user:ProductionSecurePass2026!@postgres:5432/ventureblueprint_db
POSTGRES_USER=venture_user
POSTGRES_PASSWORD=ProductionSecurePass2026!
POSTGRES_DB=ventureblueprint_db

# Sandboxed Document Storage
STORAGE_DIR=/app/storage
MAX_UPLOAD_SIZE_MB=25

# CORS Allowed Origins
CORS_ORIGINS=["https://ventureblueprint.yourdomain.com"]
```

---

## 4. One-Command Production Launch

To build, initialize, and run all services in detached mode:

```bash
docker compose up --build -d
```

### What this command executes:
1. Provisions the `postgres` container and initializes the `ventureblueprint_db` database on a private Docker bridge network.
2. Builds the `backend` Docker image from `deployment/Dockerfile.backend`, runs database migrations, seeds regulatory rules, and starts the FastAPI Uvicorn ASGI cluster.
3. Builds the `frontend` production bundle via multi-stage Vite build and boots Nginx Alpine to serve static assets and proxy API traffic.
4. Mounts persistent volumes for both PostgreSQL data and generated documents.

---

## 5. Verifying the Deployment

### 5.1 Service Status
```bash
docker compose ps
```
All containers (`ventureblueprint-frontend`, `ventureblueprint-backend`, `ventureblueprint-postgres`) should report status `Up`.

### 5.2 Health Check Endpoint
Query the automated system health check endpoint:
```bash
curl -X GET http://localhost/api/v1/admin/health
```
Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "storage": "writable",
  "disk_free_gb": 42.5
}
```

### 5.3 Inspecting Logs
```bash
# View all combined logs
docker compose logs -f

# View backend logs specifically
docker compose logs -f backend
```

---

## 6. SSL / TLS Certificate Setup (HTTPS)

For production deployment with a custom domain (e.g., `ventureblueprint.yourdomain.com`), configure Let's Encrypt using Certbot on the host:

1. Install Certbot:
   ```bash
   sudo apt update && sudo apt install certbot python3-certbot-nginx -y
   ```

2. Generate certificates:
   ```bash
   sudo certbot --nginx -d ventureblueprint.yourdomain.com
   ```

3. Ensure Nginx configuration redirects all HTTP port 80 traffic to HTTPS port 443 with strong ciphers (`TLSv1.2 TLSv1.3`).

---

## 7. Database Backup & Disaster Recovery

### 7.1 Automated Database Backup (pg_dump)
Execute a full logical backup of the PostgreSQL database:
```bash
docker compose exec postgres pg_dump -U venture_user -d ventureblueprint_db -F c -b -v -f /tmp/venture_backup_$(date +%Y%m%d_%H%M%S).dump
docker cp $(docker compose ps -q postgres):/tmp/. ./backups/
```

### 7.2 Document Storage Backup
Backup the persistent document storage directory:
```bash
tar -czvf ./backups/documents_backup_$(date +%Y%m%d_%H%M%S).tar.gz ./storage/
```

### 7.3 Restoring from Backup
```bash
# Stop backend
docker compose stop backend

# Restore database
docker compose exec -T postgres pg_restore -U venture_user -d ventureblueprint_db --clean /tmp/backup_file.dump

# Restart backend
docker compose start backend
```

---

## 8. Production Security Hardening Checklist

- [x] **Zero Cloud AI Leakage:** No external LLM endpoints or third-party AI APIs configured.
- [x] **Argon2id Hashing:** Password hashing with memory-hard parameters.
- [x] **Sandboxed Storage:** File manager restricts reads/writes strictly within `storage/users/{id}/projects/{id}/`.
- [x] **SHA-256 Checksums:** Cryptographic integrity verified on all generated PDF and DOCX reports.
- [x] **Database Isolation:** PostgreSQL is not exposed on host public ports; accessible only across internal Docker network.
- [x] **Container Security:** Backend container executes under a dedicated non-root application user (`appuser`).
