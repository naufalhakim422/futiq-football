# Deployment & Infrastructure Strategy — Football Media Platform

> **VERSION**: 1.0.0  
> **STATUS**: Infrastructure & Deployment Specification

---

## 1. Deployment Pipeline Architecture

```
Developer Laptop
      │
      ▼ (git push main)
GitHub Repository
      │
      ▼ (GitHub Actions Workflow)
CI/CD Pipeline (Lint, Typecheck, Test, Docker Build)
      │
      ▼ (Docker Registry Container Push)
Linux VPS (Docker Compose Orchestration)
      │
      ▼ (Proxied via Internal VPC Bridge)
Cloudflare Edge WAF / CDN / SSL/TLS
      │
      ▼
Public Production Domain
```

---

## 2. Infrastructure Components

### Virtual Private Server (VPS)
- **OS**: Ubuntu 22.04 LTS 64-bit
- **Specs**: Minimum 4 vCPU, 8GB RAM, 100GB NVMe SSD
- **Runtime**: Docker Engine 24+ & Docker Compose v2

### Database & Cache (Docker Containers)
- **PostgreSQL 16**: Containerized with volume persistence (`/var/lib/postgresql/data`). Port `5432` bound strictly to local container bridge (`127.0.0.1:5432`).
- **Redis 7**: Containerized with AOF persistence. Bound strictly to internal loopback (`127.0.0.1:6379`) with mandatory authentication.

### Cloudflare Edge Infrastructure
- **DNS**: Proxied CNAME / A records (`Orange Cloud` enabled).
- **SSL/TLS Mode**: Full (Strict) using Cloudflare Origin CA certificates installed on VPS Nginx.
- **WAF Rules**: OWASP Core Ruleset, Bot Management, Rate Limiting Rules.

---

## 3. Environment Variables & Secrets Management

Production `.env` file template on VPS (never committed to repository):

```env
# Application Settings
NODE_ENV=production
NEXTAUTH_URL=https://footballmediaplatform.com
NEXTAUTH_SECRET=secure_random_64_byte_string

# PostgreSQL Database
DATABASE_URL=postgresql://fmp_user:super_secret_password@postgres:5432/fmp_db?schema=public&connection_limit=20

# Redis Cache
REDIS_URL=redis://:redis_secret_password@redis:6379/0

# Football Data API Secrets
FOOTBALL_DATA_API_KEY=key_live_xyz123
FOOTBALL_DATA_PROVIDER=opta

# AI Inspection API
OPENAI_API_KEY=sk-proj-securekey

# S3 Compatible Object Storage
STORAGE_ENDPOINT=https://s3.region.amazonaws.com
STORAGE_BUCKET=fmp-media-assets
STORAGE_ACCESS_KEY=AKIA...
STORAGE_SECRET_KEY=secret...
```

---

## 4. Continuous Integration & Deployment (CI/CD)

GitHub Actions Workflow (`.github/workflows/deploy.yml`):

1. **Lint & Typecheck**: Run `npm run lint` and `npx tsc --noEmit`.
2. **Build Test**: Verify Next.js build succeeds cleanly (`npm run build`).
3. **Docker Packaging**: Multi-stage Docker build producing lightweight Alpine container image.
4. **VPS Zero-Downtime Swap**:
   - SSH to VPS via deployment key.
   - Pull new image.
   - Run `prisma migrate deploy`.
   - Perform rolling container restart (`docker compose up -d --no-deps --build app`).
   - Health check ping to verify service availability before completing release.

---

## 5. Automated Backups & Rollback Strategy

- **Database Backup**: Daily automated `pg_dump` snapshot encrypted and backed up to remote S3 bucket, retained for 30 days.
- **Rollback Protocol**: If new container fails health checks, GitHub Actions triggers immediate fallback to previous container image tag (`docker compose up -d app:previous`).
