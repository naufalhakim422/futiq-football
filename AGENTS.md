# AI Agent Operating Guidelines — Football Media Platform

> **CRITICAL DIRECTIVE**: This repository represents the completely independent **Football Media Platform** project. Legacy or external projects such as "FBS", "FBS Bakery", "FBS Back Reward", or "FBS E-commerce" are strictly unrelated. Under no circumstances should any AI agent inspect, read, copy, modify, or reference any files, schemas, dependencies, or code from the FBS project.

---

## Core Mandates for AI Agents

1. **Source of Truth**
   - The primary source of product specification and business logic is `docs/Football_Media_Platform_Master_PRD_v1.0.pdf` alongside the documentation in `docs/`.
   - Always refer to `PROJECT_RULES.md`, `ARCHITECTURE.md`, and `SECURITY.md` for technical decisions.

2. **Codebase Inspection Before Modification**
   - Always search and view existing files before creating or modifying code.
   - Prevent duplicate components, functions, or utility methods.

3. **Minimal, Focused Changes**
   - Prefer surgical, well-defined edits over full file rewrites.
   - Do not touch or modify unrelated modules or formatting outside your assigned task.

4. **Dependency Management**
   - Do not introduce new npm packages or external libraries without explicit necessity and justification.
   - Stick to standard project dependencies (Next.js, React, Tailwind CSS, Prisma, Redis, TypeScript).

5. **Security & Secrets Safeguards**
   - **NEVER** expose secrets, private keys, API keys, credentials, or tokens in client code, commits, or logs.
   - Maintain strict server-side authentication and authorization.
   - Never trust client-side payload metadata or `localStorage` for role or permission decisions.

6. **Database Integrity**
   - All database schema modifications **MUST** use formal Prisma migrations (`prisma migrate dev`).
   - `prisma db push` is strictly forbidden in production workflows.
   - PostgreSQL is the sole source of truth; Redis is used strictly for transient caching and session store.

7. **Design System Adherence**
   - Follow the design parameters defined in `DESIGN_SYSTEM.md`.
   - Maintain an **Editorial Sports Media × Modern Sports Broadcast × Premium Football Data** visual identity.
   - Build reusable, fluidly responsive components with explicit loading, empty, and error states.

8. **Verification & Quality Assurance**
   - Always execute linting, type-checking (`tsc --noEmit`), and relevant tests before marking work complete.
   - Never declare success without verifying execution results.
