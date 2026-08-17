# Football Media Platform

> **Editorial Sports Media × Modern Sports Broadcast × Premium Football Data**

The **Football Media Platform** is a digital publication and data platform designed for modern football coverage, live match statistics, tactical analysis, and fair contributor revenue distribution.

---

## ⚠️ Current Development Status

**Status**: **Initialization Phase Complete (Sprint 1 Ready)**  
The project baseline documentation, system architecture specifications, security guidelines, and design rules have been initialized. Full application code implementation has not yet begun.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js (App Router, Server Components), TypeScript (Strict Mode), Tailwind CSS
- **Backend**: Next.js Server Architecture / API Route Handlers (Modular Monolith)
- **Database**: PostgreSQL with Prisma ORM
- **Cache & Session Store**: Redis
- **Security & CDN**: Cloudflare WAF, Edge CDN, Custom Rate Limiting
- **Deployment**: Docker, Linux VPS, GitHub Actions CI/CD

---

## 📚 Project Documentation

Detailed architecture specifications are located in the [`docs/`](docs/) directory:

- [**System Architecture**](docs/ARCHITECTURE.md): System design, frontend/backend architecture, editorial, AI inspection, and data flows.
- [**Database Schema**](docs/DATABASE.md): PostgreSQL relational entities, RBAC models, football data tables, and contributor ledger.
- [**Security Guidelines**](docs/SECURITY.md): Authentication, RBAC, WAF, rate-limiting, upload security, and threat mitigation.
- [**Design System**](docs/DESIGN_SYSTEM.md): Typography, color token strategy, spatial layout grid, components, and non-AI design principles.
- [**API Specification**](docs/API_SPEC.md): REST and Server Action route definitions.
- [**Deployment Plan**](docs/DEPLOYMENT.md): Docker configuration, VPS hosting, Cloudflare setup, and CI/CD pipeline.
- [**Agent Guidelines**](AGENTS.md): Operating rules for AI coding assistants.
- [**Engineering Rules**](PROJECT_RULES.md): Strict engineering standards and coding rulebook.

---

## 🛡️ Repository & Security Isolation Mandates

- **Absolute Project Isolation**: This repository is strictly isolated. It has zero dependencies or connections to any legacy or external projects (e.g., "FBS").
- **Secrets & Credentials**: Never commit `.env`, API keys, tokens, or credentials.
- **Database Changes**: Database updates require formal Prisma migrations (`prisma migrate dev`). `prisma db push` is strictly prohibited in production.

---

## 🚀 Local Development Setup (Future Phase)

*Instructions will be activated during Sprint 1 implementation:*

```bash
# 1. Clone repository
git clone https://github.com/<username>/football-media-platform.git
cd football-media-platform

# 2. Install dependencies
npm install

# 3. Environment configuration
cp .env.example .env.local

# 4. Run local development server
npm run dev
```
