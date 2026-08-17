# Security Architecture & Risk Policy — Football Media Platform

> **VERSION**: 1.0.0  
> **STATUS**: Security Policy & Protection Architecture  
> **GOAL**: Defense-in-depth protection for user data, financial payouts, and platform content.

---

## 1. Authentication Security

- **Session Standard**: Cryptographically signed JSON Web Tokens (JWT) or session IDs stored in **HTTP-only, Secure, SameSite=Lax** cookies.
- **Password Policy**: Passwords hashed using `bcrypt` (work factor 12) or `argon2id`. Minimum length 12 characters with complexity validation.
- **Multi-Factor Authentication (MFA)**: Mandatory TOTP (Time-based One-Time Password) MFA for `SUPER_ADMIN` and `EDITOR_IN_CHIEF` roles.
- **Session Termination**: Remote session invalidation capability on password reset or suspicious activity detection.

---

## 2. Authorization & RBAC

- **Server-Side Enforcement**: Permissions evaluated exclusively inside Next.js Server Components, Server Actions, and Route Handlers.
- **Resource Ownership Validation**: Authors cannot edit articles owned by other writers. Contributors cannot access administrative queues.
- **Role Hierarchy**:
  - `SUPER_ADMIN`: Full infrastructure, RBAC, financial payout approval.
  - `EDITOR_IN_CHIEF`: Article publication, assignment, editorial queue, contributor management.
  - `SENIOR_EDITOR`: Article review, content approval.
  - `CONTRIBUTOR`: Article drafting, submission, personal earnings tracking.
  - `READER`: Read-only public access, bookmarks, user settings.

---

## 3. Admin & Contributor Security

- **Admin Isolation**: Admin portal routes (`/admin/*`) protected by IP restriction checks via Cloudflare headers and mandatory MFA re-authentication.
- **No In-Browser Script Injection**: Admin control panel lacks dynamic HTML/JS execution panels.
- **Contributor Sandbox**: Contributor article content is sanitized before storing and rendering.

---

## 4. API & Boundary Security

- **Input Validation**: All external inputs, body payloads, and params parsed via strict `Zod` schemas before execution.
- **Rate Limiting**: Sliding window rate limiting powered by Redis:
  - Public Auth API (`/api/auth/*`): 5 requests / minute per IP.
  - Content Creation API (`/api/articles`): 10 requests / minute per user.
  - Financial Payout API (`/api/payouts/*`): 3 requests / minute per user.
  - Public Read API: 100 requests / minute per IP.

---

## 5. Network & Infrastructure Defense

```
[ Internet Traffic ]
        │
        ▼
┌───────────────────────────────┐
│ Cloudflare WAF & Edge CDN     │ <-- DDoS Protection, Bot Management, SSL/TLS
└───────────────┬───────────────┘
                │
                ▼ (Authenticated VPC Tunnel)
┌───────────────────────────────┐
│ Linux VPS App Server (Docker) │ <-- Next.js Reverse Proxied by Nginx
└───────┬───────────────┬───────┘
        │               │ (Internal Isolated Network Only)
        ▼               ▼
┌──────────────┐ ┌──────────────┐
│ PostgreSQL 16│ │ Redis Cache  │
└──────────────┘ └──────────────┘
```

- **Cloudflare WAF**: Managed rules for OWASP Top 10 mitigation, automatic bot score evaluation, rate limiting at edge.
- **DDoS Mitigation**: Edge absorbing Layer 3/4 and Layer 7 volumetric attacks.
- **PostgreSQL & Redis Isolation**: DB listening strictly on `127.0.0.1` or internal Docker container networks with no public IP binding.

---

## 6. Web Vulnerability Countermeasures

- **CSRF (Cross-Site Request Forgery)**: Mitigated by `SameSite=Lax/Strict` cookies and custom header validation (`X-Requested-With`) on state-changing API requests.
- **XSS (Cross-Site Scripting)**: Strict Content Security Policy (CSP) header, automatic React JSX escaping, sanitization of HTML using `DOMPurify` / `sanitize-html`.
- **SQL Injection**: Prevented via Prisma ORM parameterized SQL queries. Raw SQL strictly prohibited without security audit.
- **Secure Uploads**:
  - Validated MIME type against binary magic numbers.
  - File name replaced with secure random UUID.
  - Maximum upload size constrained (5MB for images).
  - Stored outside web execution root in object storage / S3 bucket with public read-only static URLs.

---

## 7. Secrets & Financial Security

- **Environment Secrets**: Zero hardcoded keys. Secrets provided via system environment variables.
- **Financial Payout Guard**: Double-checking withdrawal request balances against database transactional ledgers before dispatching payments.
- **Audit Logging**: Immutable, write-only database log entries recorded for every role assignment, article publication, content deletion, and payout request.
