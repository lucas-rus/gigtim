# GigTim — Changelog

> This file tracks **every change** made to the project so that any developer
> or AI model can quickly understand the current state of the codebase.

---

## [0.2.0] — 2026-04-27

### 🗄️ Database — Schema Expansion (`supabase/migrations/002_expanded_schema.sql`)

#### Modified existing objects
| Object | Change |
|--------|--------|
| `user_role` enum | Added `ADMIN` value |
| `worker_profiles` | Added `phone_number`, `city`, `county`, `bio`, `profile_picture_url` |
| `employer_profiles` | Added `city`, `county` |

#### New enums
| Enum | Values |
|------|--------|
| `verification_status` | `PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`, `NEEDS_REVIEW` |
| `chat_room_type` | `SHIFT`, `DIRECT` |
| `forum_category` | `GENERAL`, `TIPS`, `JOBS`, `LEGAL` |
| `notification_type` | `SHIFT_APPLICATION`, `APPLICATION_ACCEPTED`, `APPLICATION_REJECTED`, `SHIFT_REMINDER`, `REVIEW_REQUEST`, `CHAT_MESSAGE`, `ID_VERIFIED`, `ID_REJECTED`, `ADMIN_NOTICE` |

#### New tables (9)
| Table | Purpose |
|-------|---------|
| `id_verifications` | Persona-based automated ID verification. Stores `persona_inquiry_id`, status updated via webhooks. |
| `chat_rooms` | Chat room metadata (SHIFT or DIRECT type) |
| `chat_room_members` | N:N mapping of users to chat rooms |
| `chat_messages` | Individual messages with room FK |
| `forum_posts` | Community posts with categories (GENERAL/TIPS/JOBS/LEGAL) |
| `forum_comments` | Threaded comments on forum posts |
| `notifications` | In-app notification feed (typed, with JSONB payload) |
| `reviews` | Mutual post-shift reviews (1-5 stars, unique per reviewer/reviewee/shift) |
| `admin_audit_log` | Immutable log of all admin actions |

#### Helper function
- `is_admin()` — SQL function (SECURITY DEFINER) returns true if the current auth user has ADMIN role.

#### RLS policies
- **Admin overrides** on all 5 existing tables (SELECT + UPDATE)
- **13 new policies** across 9 new tables covering worker, employer, and admin access patterns
- Chat access scoped to room members only
- Forum readable by all authenticated users, writable by authors, fully managed by admins
- Notifications readable/updatable by owner only; admins can broadcast

### 🌐 Web Dashboard — Next.js 14 Init (`web/`)

#### Tech stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- Supabase SSR client (`@supabase/ssr`)
- Middleware for auth token refresh

#### Route structure (11 pages)
| Route | Purpose |
|-------|---------|
| `/login` | Auth — login |
| `/register` | Auth — registration |
| `/shifts` | Dashboard — manage shifts |
| `/applications` | Dashboard — view applications |
| `/chat` | Dashboard — messaging |
| `/forum` | Dashboard — community forum |
| `/settings` | Dashboard — account settings |
| `/admin/users` | Admin — user management |
| `/admin/verifications` | Admin — Persona ID verification status |
| `/admin/audit-log` | Admin — action audit log |

#### Key files
| File | Purpose |
|------|---------|
| `src/lib/supabase/client.ts` | Browser-side Supabase client |
| `src/lib/supabase/server.ts` | Server-side Supabase client (RSC/API) |
| `src/lib/supabase/middleware.ts` | Auth session refresh helper |
| `src/middleware.ts` | Next.js middleware entry point |
| `.env.example` | Template for env vars (Supabase, Persona, Stripe) |

### 📁 Project Structure
```
Gigtim/
├── GigApp_PRD.md
├── CHANGELOG.md              ← this file
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql    (5 tables, 4 enums, 13 RLS policies)
│       └── 002_expanded_schema.sql   (9 new tables, 4 new enums, 25+ RLS policies)
└── web/                              (Next.js 14 App Router)
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/login, register
    │   │   ├── (dashboard)/shifts, applications, chat, forum, settings
    │   │   └── (admin)/admin/users, verifications, audit-log
    │   ├── components/ui/           (shadcn/ui components)
    │   ├── lib/supabase/            (client, server, middleware)
    │   └── middleware.ts
    ├── .env.example
    ├── tailwind.config.ts
    └── package.json
```

---

## [0.0.1] — 2026-04-27

### 📄 PRD
- **`GigApp_PRD.md`** — Product Requirements Document created. Defines the
  Romanian gig-economy marketplace (HoReCa / Timișoara), tech stack
  (React Native + Next.js 14 + Supabase + Stripe Connect), business logic,
  ITM / Legea 52/2011 compliance requirements, and core user flows.

### 🗄️ Database — Initial Schema (`supabase/migrations/001_initial_schema.sql`)
Created the complete Supabase (PostgreSQL) schema:

#### Enums
| Enum | Values |
|------|--------|
| `user_role` | `WORKER`, `EMPLOYER` |
| `worker_skill` | `BARISTA`, `WAITER`, `DISHWASHER`, `STAGEHAND` |
| `shift_status` | `OPEN`, `FILLED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `application_status` | `PENDING`, `ACCEPTED`, `REJECTED`, `NO_SHOW` |

#### Tables
| Table | Purpose | Key Constraints |
|-------|---------|-----------------|
| `users` | Base user record linked to `auth.users` | `auth_id` UNIQUE, FK → `auth.users` with CASCADE |
| `worker_profiles` | Worker PII (CNP, CI) + reliability score + skills | PK = `user_id` FK → `users`, CNP is `CHAR(13)` with regex check, `reliability_score` 1.0–5.0 |
| `employer_profiles` | Company details + geo coordinates | PK = `user_id` FK → `users`, CUI stored as text |
| `job_shifts` | Bookable shifts posted by employers | FK → `employer_profiles`, `end_time > start_time` constraint, `hourly_pay_ron > 0` |
| `applications` | Worker applications to shifts | FK → `job_shifts` + `worker_profiles`, UNIQUE on `(shift_id, worker_id)` |

#### Indexes
- `idx_job_shifts_status_start` — fast filtering of open shifts by time window
- `idx_employer_profiles_location` — bounding-box geo queries on `(lat, lng)`
- `idx_applications_shift` / `idx_applications_worker` — fast join paths

#### Row Level Security (RLS)
All five tables have RLS **enabled**. Policy summary:

| Table | SELECT | INSERT | UPDATE |
|-------|--------|--------|--------|
| `users` | Own row only | Own row (sign-up) | Own row |
| `worker_profiles` | Own profile + employers can view | Workers insert own | Workers update own |
| `employer_profiles` | Own profile + workers can view | Employers insert own | Employers update own |
| `job_shifts` | OPEN shifts visible to all auth'd; employers see all own; workers see applied | Employers insert own | Employers update own |
| `applications` | Workers see own; employers see apps for their shifts | Workers insert (apply) | Employers update (accept/reject) |

---

*End of changelog — append new sections below as work progresses.*
