# REST & Server Action API Specification — Football Media Platform

> **VERSION**: 1.0.0  
> **STATUS**: API Architecture Specification  
> **BASE URL**: `/api/v1`

---

## 1. Authentication & User API

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/login` | `POST` | Public | Authenticate user with credentials, set HTTP-only cookie. |
| `/api/v1/auth/register` | `POST` | Public | Register new reader or contributor candidate. |
| `/api/v1/auth/logout` | `POST` | User | Clear session token cookie. |
| `/api/v1/auth/me` | `GET` | User | Get current authenticated user profile and permissions. |
| `/api/v1/users/profile` | `PATCH` | User | Update user profile details. |

---

## 2. Article & Editorial API

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/articles` | `GET` | Public | List published articles with pagination, category & tag filters. |
| `/api/v1/articles/:slug` | `GET` | Public | Fetch article detail by slug. |
| `/api/v1/articles` | `POST` | Contributor | Draft new article submission. |
| `/api/v1/articles/:id` | `PUT` | Contributor/Editor | Update draft or existing article revision. |
| `/api/v1/articles/:id/submit` | `POST` | Contributor | Submit draft article to editorial review queue. |
| `/api/v1/editorial/queue` | `GET` | Editor | Fetch pending editorial submissions. |
| `/api/v1/editorial/:id/approve` | `POST` | Senior Editor | Approve and publish article. |
| `/api/v1/editorial/:id/reject` | `POST` | Senior Editor | Reject article with editorial notes. |

---

## 3. Football Data API

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/football/competitions` | `GET` | Public | List active leagues and cup competitions. |
| `/api/v1/football/matches/live` | `GET` | Public | Fetch current live matches and scores for top ticker. |
| `/api/v1/football/fixtures` | `GET` | Public | Get fixture schedule by date and competition. |
| `/api/v1/football/matches/:id` | `GET` | Public | Match detail (lineups, events, stats, heatmaps). |
| `/api/v1/football/standings/:competitionId`| `GET` | Public | Fetch competition league table standings. |
| `/api/v1/football/teams/:id` | `GET` | Public | Team profile, squad list, recent form. |
| `/api/v1/football/players/:id` | `GET` | Public | Player statistics and career overview. |
| `/api/v1/football/transfers` | `GET` | Public | Recent transfers and transfer center rumors. |

---

## 4. Contributor, Rewards & Payouts API

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/contributor/dashboard` | `GET` | Contributor | Fetch article performance metrics & accrued rewards. |
| `/api/v1/rewards/wallet` | `GET` | Contributor | Get wallet balance and transaction ledger. |
| `/api/v1/payouts/request` | `POST` | Contributor | Submit withdrawal request for accrued earnings. |
| `/api/v1/payouts/queue` | `GET` | Admin | Fetch pending payout withdrawal requests. |
| `/api/v1/payouts/:id/approve` | `POST` | Super Admin | Process and approve payout request. |

---

## 5. Advertising & Analytics API

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/analytics/view` | `POST` | Public | Log article view (validated via IP/Session rate tracking). |
| `/api/v1/ads/placements` | `GET` | Public | Fetch active ad unit placements for layout rendering. |

---

## 6. Admin & Security Audit API

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/admin/users` | `GET` | Super Admin | Manage platform users and assign RBAC roles. |
| `/api/v1/admin/audit-logs` | `GET` | Super Admin | Inspect system security audit logs. |
