# Engineering Rulebook & Technical Standards — Football Media Platform

> **VERSION**: 1.0.0  
> **PROJECT**: Football Media Platform  
> **STATUS**: Mandatory for all contributors and automated agents.

---

## 1. Technology Stack Specification

| Layer | Standard Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js (App Router, Server Components) |
| **Language** | TypeScript (Strict Mode enabled) |
| **Styling** | Tailwind CSS (Design Tokens, Custom Theme Palette) |
| **Backend Architecture** | Next.js Route Handlers / Server Actions (Modular Monolith) |
| **Database ORM** | Prisma |
| **Primary Database** | PostgreSQL (Relational Source of Truth) |
| **Caching & In-Memory Store**| Redis |
| **Containerization** | Docker / Docker Compose |
| **Edge & Security** | Cloudflare WAF, DNS, SSL/TLS |
| **Hosting & Deployment** | Linux VPS (Ubuntu LTS) via GitHub Actions CI/CD |

---

## 2. Core Engineering Rules

1. **Strict TypeScript Enforcement**: `tsconfig.json` must enforce `"strict": true`. `any` types are prohibited unless explicitly documented with a bypass review.
2. **Server-First Architecture**: Default to Next.js Server Components. Keep client bundle minimal. Fetch and filter sensitive data exclusively on the server.
3. **Strict Input Validation**: Validate all incoming HTTP payloads, query strings, and parameters using Zod schemas at API boundary layers.
4. **Server-Side Authentication**: Use cryptographically signed, HTTP-only, `SameSite=Lax` cookie tokens. Never rely on client-side session representations.
5. **Server-Side Authorization**: Perform explicit permission and RBAC checks on every API route handler and server action.
6. **Role-Based Access Control (RBAC)**: Enforce coarse and fine-grained permissions (`SUPER_ADMIN`, `EDITOR_IN_CHIEF`, `SENIOR_EDITOR`, `CONTRIBUTOR`, `READER`).
7. **Resource Ownership Validation**: Verify user or contributor ownership before executing any data update or delete operation (`where: { id, authorId }`).
8. **No LocalStorage Auth Authority**: `localStorage` and `sessionStorage` must never store auth tokens, permissions, or session validity status.
9. **Zero Client Secret Exposure**: Environment variables starting with `NEXT_PUBLIC_` must never hold API secret keys, database URIs, or tokens.
10. **Strict Environment Protection**: Never commit `.env` or credential files to Git. All secrets are managed in deployment secret stores.
11. **Migration-Based Database Changes**: All schema edits must produce explicit SQL migration files in `prisma/migrations/`.
12. **No `prisma db push` in Production**: Deployments must execute `prisma migrate deploy` to ensure deterministic database state.
13. **PostgreSQL as Primary Source of Truth**: All transactional state, financial balances, articles, and user accounts reside permanently in PostgreSQL.
14. **Redis Transient Boundary**: Redis serves strictly as a volatile cache, rate-limit tracker, and session index. It is never used as primary persistence.
15. **Isolated Database Binding**: PostgreSQL must listen exclusively on internal private networks (Docker internal bridge / loopback).
16. **Isolated Redis Binding**: Redis must require authentication and listen exclusively on private internal loops.
17. **No Arbitrary Admin Code Execution**: Admin tools must never evaluate dynamic string scripts (`eval`, unsafe script tags).
18. **No Unsafe HTML Injection**: Content rendering must use sanitized AST representations. Avoid `dangerouslySetInnerHTML` without strict HTML sanitization.
19. **Secure File Upload Pipeline**: Validate file MIME types, sanitize file names, generate unique UUID storage paths, scan uploads, and enforce maximum file size constraints.
20. **Rate Limiting**: Apply sliding-window Redis rate-limiters on sensitive endpoints (authentication, content creation, payouts, contact forms).
21. **Audit Logging**: Write immutable audit log entries in PostgreSQL for all administrative and financial actions (role updates, payouts, suspensions).
22. **Fluid Responsive Layouts**: Interfaces must render cleanly across mobile (320px+), tablet (768px+), desktop (1024px+), and ultrawide viewports.
23. **Mandatory UI States**: Every component handling dynamic data must implement explicit **Loading**, **Empty**, and **Error** states.
24. **DRY & Component Reusability**: Prevent component duplication. Abstract shared UI components into modular UI libraries.
25. **Non-AI Aesthetic Standard**: Interfaces must look like a high-end, human-crafted sports broadcast media outlet.

---

## 3. Design System & Visual Direction

### Core Aesthetics Definition
**Editorial Sports Media × Modern Sports Broadcast × Premium Football Data**

The visual identity combines the typographic gravitas of top-tier football magazines (e.g., *The Athletic*, *L'Équipe*) with the real-time statistical crispness of modern live broadcast graphics (e.g., *Champions League TV overlays*, *Opta analytics*).

### Forbidden Design Tropes 🚫
- NO generic pastel SaaS dashboard layouts.
- NO bright neon purple/violet fonts on dark backgrounds.
- NO arbitrary CSS text gradient fills on standard body headings.
- NO floating glassmorphic cards with excessive blur overlays.
- NO giant headlines missing tracking/letter-spacing adjustments.
- NO emoji navigation icons in primary top bars or sidebars.
- NO decorative grid mesh background patterns that impair content legibility.
- NO multi-nested cards (cards inside cards inside cards).

### Mandatory Design Standards ✅
- **Strong Editorial Hierarchy**: High-contrast typographic scale with distinct serif or modern grotesque headlines.
- **Broadcast-Grade Data Density**: Compact, high-legibility match tables, standings, player heatmaps, and stats.
- **Deep Slate & Pitch Contrast**: Deep midnight tones (`hsl(222, 47%, 11%)`) paired with crisp stadium white and pitch-green accents.
- **Purposeful Micro-Interactions**: Hover indicators on match scores, live ticker indicators, functional state transitions.
