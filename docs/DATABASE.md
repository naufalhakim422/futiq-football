# PostgreSQL Relational Data Model — Football Media Platform

> **VERSION**: 1.0.0  
> **STATUS**: Database Specification & Schema Architecture  
> **ENGINE**: PostgreSQL 16+

---

## 1. Overview & ER Design Principles

The database model is structured around five core domain pillars:
1. **User Identity & Access Control (RBAC)**
2. **Editorial Content & Publishing**
3. **Football Data Engine (Opta / API Data Compatibility)**
4. **Contributor Monitization, Rewards & Payouts**
5. **System Security, Audit & Advertising**

---

## 2. Table Schemas Specification

### Core Pillar 1: User Identity & RBAC

#### `users`
Primary user identity store for readers, writers, editors, and platform administrators.
- `id` (UUID, Primary Key)
- `email` (VarChar 255, Unique, Indexed)
- `password_hash` (Text, Nullable for OAuth users)
- `full_name` (VarChar 100)
- `avatar_url` (Text, Nullable)
- `is_active` (Boolean, Default True)
- `is_verified` (Boolean, Default False)
- `created_at` (TimestampTZ)
- `updated_at` (TimestampTZ)

#### `roles`
System roles for fine-grained permissions.
- `id` (UUID, Primary Key)
- `name` (VarChar 50, Unique) — `SUPER_ADMIN`, `EDITOR_IN_CHIEF`, `SENIOR_EDITOR`, `CONTRIBUTOR`, `READER`
- `description` (Text)

#### `permissions`
Individual atomic permissions.
- `id` (UUID, Primary Key)
- `code` (VarChar 100, Unique) — e.g., `article:create`, `article:publish`, `payout:approve`
- `description` (Text)

#### `user_roles` (Junction)
- `user_id` (UUID, Foreign Key -> `users.id`)
- `role_id` (UUID, Foreign Key -> `roles.id`)

#### `role_permissions` (Junction)
- `role_id` (UUID, Foreign Key -> `roles.id`)
- `permission_id` (UUID, Foreign Key -> `permissions.id`)

---

### Core Pillar 2: Editorial & Content

#### `contributors`
Profile and metrics for content creators.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `users.id`, Unique)
- `bio` (Text)
- `tier` (Enum: `JUNIOR`, `REGULAR`, `SENIOR`, `EXPERT`)
- `reputation_score` (Integer, Default 100)
- `total_articles_published` (Integer, Default 0)
- `is_approved` (Boolean, Default False)
- `created_at` (TimestampTZ)

#### `categories`
Hierarchical taxonomy for articles (e.g., Premier League, Champions League, Transfer News, Analysis).
- `id` (UUID, Primary Key)
- `name` (VarChar 100)
- `slug` (VarChar 120, Unique, Indexed)
- `parent_id` (UUID, Foreign Key -> `categories.id`, Nullable)

#### `tags`
Keywords for cross-category content discovery.
- `id` (UUID, Primary Key)
- `name` (VarChar 50, Unique)
- `slug` (VarChar 60, Unique, Indexed)

#### `articles`
Primary entity for written sports news and editorial analysis.
- `id` (UUID, Primary Key)
- `title` (VarChar 255)
- `slug` (VarChar 280, Unique, Indexed)
- `excerpt` (Text)
- `content_json` (JSONB) — Structured Editor AST format
- `cover_image_url` (Text)
- `cover_image_caption` (Text, Nullable)
- `status` (Enum: `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `PUBLISHED`, `REJECTED`, `ARCHIVED`)
- `author_id` (UUID, Foreign Key -> `contributors.id`)
- `editor_id` (UUID, Foreign Key -> `users.id`, Nullable)
- `category_id` (UUID, Foreign Key -> `categories.id`)
- `primary_team_id` (UUID, Foreign Key -> `teams.id`, Nullable)
- `primary_competition_id` (UUID, Foreign Key -> `competitions.id`, Nullable)
- `is_featured` (Boolean, Default False)
- `published_at` (TimestampTZ, Nullable, Indexed)
- `created_at` (TimestampTZ)
- `updated_at` (TimestampTZ)

#### `article_revisions`
Version history for editorial changes.
- `id` (UUID, Primary Key)
- `article_id` (UUID, Foreign Key -> `articles.id`)
- `revision_number` (Integer)
- `title` (VarChar 255)
- `content_json` (JSONB)
- `edited_by` (UUID, Foreign Key -> `users.id`)
- `change_summary` (Text, Nullable)
- `created_at` (TimestampTZ)

#### `article_sources`
Attribution links and reference verification.
- `id` (UUID, Primary Key)
- `article_id` (UUID, Foreign Key -> `articles.id`)
- `source_name` (VarChar 150)
- `source_url` (Text)
- `verification_status` (Enum: `UNVERIFIED`, `VERIFIED`, `FLAGGED`)

#### `article_tags` (Junction)
- `article_id` (UUID, Foreign Key -> `articles.id`)
- `tag_id` (UUID, Foreign Key -> `tags.id`)

---

### Core Pillar 3: Football Data Engine

#### `competitions`
Leagues and tournaments (e.g., English Premier League, UEFA Champions League, FIFA World Cup).
- `id` (UUID, Primary Key)
- `external_id` (VarChar 100, Unique, Indexed)
- `name` (VarChar 150)
- `code` (VarChar 20)
- `type` (Enum: `LEAGUE`, `CUP`, `INTERNATIONAL`)
- `logo_url` (Text)
- `country` (VarChar 100)

#### `stadiums`
- `id` (UUID, Primary Key)
- `name` (VarChar 150)
- `city` (VarChar 100)
- `capacity` (Integer)
- `image_url` (Text, Nullable)

#### `teams`
Football clubs and national teams.
- `id` (UUID, Primary Key)
- `external_id` (VarChar 100, Unique, Indexed)
- `name` (VarChar 150)
- `short_name` (VarChar 50)
- `tla` (VarChar 5) — Three-Letter Abbreviation (e.g., ARS, MCI)
- `logo_url` (Text)
- `stadium_id` (UUID, Foreign Key -> `stadiums.id`, Nullable)

#### `managers`
Head coaches and managers.
- `id` (UUID, Primary Key)
- `external_id` (VarChar 100, Unique)
- `name` (VarChar 150)
- `nationality` (VarChar 100)
- `current_team_id` (UUID, Foreign Key -> `teams.id`, Nullable)

#### `players`
Football players database.
- `id` (UUID, Primary Key)
- `external_id` (VarChar 100, Unique, Indexed)
- `name` (VarChar 150)
- `position` (Enum: `GOALKEEPER`, `DEFENDER`, `MIDFIELDER`, `ATTACKER`)
- `shirt_number` (Integer, Nullable)
- `nationality` (VarChar 100)
- `photo_url` (Text, Nullable)
- `current_team_id` (UUID, Foreign Key -> `teams.id`, Nullable)

#### `transfers`
Transfer center transactions and rumors.
- `id` (UUID, Primary Key)
- `player_id` (UUID, Foreign Key -> `players.id`)
- `from_team_id` (UUID, Foreign Key -> `teams.id`, Nullable)
- `to_team_id` (UUID, Foreign Key -> `teams.id`, Nullable)
- `transfer_fee_eur` (Decimal 14, 2, Nullable)
- `transfer_type` (Enum: `PERMANENT`, `LOAN`, `FREE_AGENT`)
- `status` (Enum: `RUMOR`, `ADVANCED`, `COMPLETED`)
- `announcement_date` (Date, Nullable)

#### `fixtures` / `matches`
Match schedule, live scores, and status.
- `id` (UUID, Primary Key)
- `external_id` (VarChar 100, Unique, Indexed)
- `competition_id` (UUID, Foreign Key -> `competitions.id`)
- `home_team_id` (UUID, Foreign Key -> `teams.id`)
- `away_team_id` (UUID, Foreign Key -> `teams.id`)
- `home_score` (Integer, Default 0)
- `away_score` (Integer, Default 0)
- `status` (Enum: `SCHEDULED`, `LIVE_1H`, `HT`, `LIVE_2H`, `ET`, `PENALTY`, `FINISHED`, `POSTPONED`)
- `match_date` (TimestampTZ, Indexed)
- `venue_id` (UUID, Foreign Key -> `stadiums.id`, Nullable)

#### `standings`
League table standings.
- `id` (UUID, Primary Key)
- `competition_id` (UUID, Foreign Key -> `competitions.id`)
- `season` (VarChar 20)
- `team_id` (UUID, Foreign Key -> `teams.id`)
- `position` (Integer)
- `played` (Integer)
- `won` (Integer)
- `drawn` (Integer)
- `lost` (Integer)
- `goals_for` (Integer)
- `goals_against` (Integer)
- `points` (Integer)

#### `player_statistics`
Per-match player performance stats.
- `id` (UUID, Primary Key)
- `match_id` (UUID, Foreign Key -> `matches.id`)
- `player_id` (UUID, Foreign Key -> `players.id`)
- `minutes_played` (Integer)
- `goals` (Integer, Default 0)
- `assists` (Integer, Default 0)
- `shots_on_target` (Integer, Default 0)
- `passes_completed` (Integer, Default 0)
- `rating` (Decimal 3, 1)

---

### Core Pillar 4: Analytics, Rewards & Payouts

#### `article_views`
Raw aggregated view logging.
- `id` (UUID, Primary Key)
- `article_id` (UUID, Foreign Key -> `articles.id`, Indexed)
- `ip_hash` (VarChar 64)
- `user_agent_hash` (VarChar 64)
- `read_duration_seconds` (Integer)
- `is_validated_view` (Boolean, Default False)
- `viewed_at` (TimestampTZ, Indexed)

#### `article_performance`
Daily consolidated article performance metrics.
- `id` (UUID, Primary Key)
- `article_id` (UUID, Foreign Key -> `articles.id`)
- `metric_date` (Date)
- `total_views` (Integer)
- `validated_views` (Integer)
- `avg_read_time_seconds` (Integer)

#### `contributor_rewards`
Earnings entries per article.
- `id` (UUID, Primary Key)
- `contributor_id` (UUID, Foreign Key -> `contributors.id`)
- `article_id` (UUID, Foreign Key -> `articles.id`)
- `period_start` (Date)
- `period_end` (Date)
- `validated_views` (Integer)
- `cpm_rate` (Decimal 8, 4)
- `earned_amount` (Decimal 10, 2)
- `created_at` (TimestampTZ)

#### `contributor_wallets`
Financial ledger balance for writers.
- `id` (UUID, Primary Key)
- `contributor_id` (UUID, Foreign Key -> `contributors.id`, Unique)
- `balance` (Decimal 12, 2, Default 0.00)
- `total_withdrawn` (Decimal 12, 2, Default 0.00)
- `updated_at` (TimestampTZ)

#### `payouts`
Withdrawal requests and payment execution records.
- `id` (UUID, Primary Key)
- `contributor_id` (UUID, Foreign Key -> `contributors.id`)
- `amount` (Decimal 10, 2)
- `payment_method` (VarChar 50) — Bank Transfer, PayPal, etc.
- `payment_details_encrypted` (Text)
- `status` (Enum: `REQUESTED`, `PROCESSING`, `COMPLETED`, `REJECTED`)
- `transaction_reference` (VarChar 100, Nullable)
- `requested_at` (TimestampTZ)
- `processed_at` (TimestampTZ, Nullable)

---

### Core Pillar 5: Quality Inspection, Ads & Security

#### `editorial_checks`
- `id` (UUID, Primary Key)
- `article_id` (UUID, Foreign Key -> `articles.id`)
- `word_count` (Integer)
- `source_links_count` (Integer)
- `has_cover_image` (Boolean)
- `quality_score` (Integer)

#### `plagiarism_checks`
Automated AI plagiarism scan results.
- `id` (UUID, Primary Key)
- `article_id` (UUID, Foreign Key -> `articles.id`)
- `similarity_percentage` (Decimal 5, 2)
- `matched_sources_json` (JSONB)
- `passed` (Boolean)
- `scanned_at` (TimestampTZ)

#### `image_checks`
License & aspect ratio validation records.
- `id` (UUID, Primary Key)
- `article_id` (UUID, Foreign Key -> `articles.id`)
- `image_url` (Text)
- `license_type` (VarChar 50)
- `is_compliant` (Boolean)

#### `ad_units` & `ad_placements`
Monetization ad slot configurations and impression logs.
- `id` (UUID, Primary Key)
- `name` (VarChar 100)
- `placement_code` (VarChar 50, Unique) — `header_leaderboard`, `article_mid_1`, `sidebar_top`
- `ad_type` (Enum: `DISPLAY`, `NATIVE`, `SPONSOR_BADGE`)
- `is_active` (Boolean, Default True)

#### `notifications`
User alert and system message queue.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `users.id`)
- `title` (VarChar 150)
- `message` (Text)
- `is_read` (Boolean, Default False)
- `created_at` (TimestampTZ)

#### `reports`
Reader flag/report entity for inappropriate content.
- `id` (UUID, Primary Key)
- `reporter_id` (UUID, Foreign Key -> `users.id`, Nullable)
- `target_type` (Enum: `ARTICLE`, `COMMENT`, `CONTRIBUTOR`)
- `target_id` (UUID)
- `reason` (Text)
- `status` (Enum: `OPEN`, `RESOLVED`, `DISMISSED`)

#### `audit_logs`
Immutable record of sensitive platform actions.
- `id` (UUID, Primary Key)
- `actor_id` (UUID, Foreign Key -> `users.id`, Nullable)
- `action` (VarChar 100) — `ROLE_ASSIGNED`, `ARTICLE_PUBLISHED`, `PAYOUT_APPROVED`
- `target_resource` (VarChar 100)
- `ip_address` (VarChar 45)
- `metadata` (JSONB)
- `created_at` (TimestampTZ, Indexed)
