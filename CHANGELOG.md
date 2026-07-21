# GigTim — Changelog

> This file tracks **every change** made to the project so that any developer
> or AI model can quickly understand the current state of the codebase.

---

## [0.4.0] — 2026-06-21 — Zori design system + security hardening + agent swarm

### 🎨 Design system — Zori v1.0 (ratified)
A brand-new, original, Romanian-inspired design system unifying web + mobile.
See `docs/ZORI_DESIGN_SYSTEM.md` for the full spec.

- **Concept:** warm linen (light) + espresso charcoal (warm dark, NOT cold
  blue-black), ember primary, sage secondary, saffron accent, signature dawn
  gradient (ember → saffron → sage).
- **Typography:** Sora (Romanian-designed, headings) + Inter (body) +
  JetBrains Mono (mono). Web via `next/font/google`; mobile via
  `@expo-google-fonts/*`.
- **Web:** `web/src/app/globals.css` rewritten with OKLCH tokens; `--primary-
  strong`/`--secondary-strong` AA-compliant fill variants; `@utility bg-dawn`;
  `prefers-reduced-motion` honored; `.scrollbar-thin` utility; `--text-2xs`
  token (fixes no-op class).
- **Mobile:** new `mobile/src/design/` token module (verified sRGB hex) +
  `useZoriTheme()` hook + `useZoriFonts()`. New `mobile/src/ui/` primitives:
  Button, Card, Badge, Input, Textarea, Skeleton, Toast (provider + imperative
  `toast` API), Avatar, RatingStars, EmptyState, SectionHeader, ShiftCard — all
  with ≥44dp tap targets and ARIA.
- **Fixed broken CSS:** `text-primary-fixed-dim` → `text-primary-strong`;
  `text-amber-400` rating → `text-accent` (saffron); ad-hoc status colors →
  Zori token-based; `scrollbar-thin` now a real utility; `text-2xs` defined.

### 🔒 Security hardening (web)
- **`updateApplicationStatus`:** now requires EMPLOYER role + verifies the
  caller owns the shift for that application (joins `applications →
  job_shifts!inner → employer_id`). Runtime `status` validation.
- **`sendChatMessage` / `getChatMessages`:** verify caller is a member of the
  chat room before write/read. Message body validated (non-empty, ≤2000 chars).
- **`applyToShift`:** verifies the shift is still `OPEN` (defense-in-depth).
- **`createShift`:** validates `role_needed`, `end_time > start_time`,
  `hourly_pay_ron > 0`.
- **`updateWorkerProfile` / `updateEmployerProfile`:** verify caller role;
  removed dummy-PII fallbacks (`'0000000000000'`, `'XX000000'`, `'RO000000'`);
  CNP (13-digit) + CUI validation; `.single()` → `.maybeSingle()`.
- **`getAdminAuditLog` / `getAdminVerifications` / `getAdminUsers`:** now
  require `dbUser.role === 'ADMIN'` (defense-in-depth, not just layout guard).
- **Persona webhook:** HMAC-SHA256 signature verification of
  `persona-signature` header (correct `t=<ts>,v1=<sig>` scheme, signed
  `${timestamp}.${body}`), fail-closed, 5-min replay window. Fixed event field
  (`data.attributes.name`), added `inquiry.approved`.
- **Atomic registration:** new `register_user` Postgres RPC (migration `009`)
  inserts `users` + profile in one transaction; **blocks ADMIN escalation**
  (role restricted to WORKER/EMPLOYER) + `auth.uid()` check; `anon` revoked.
  `register` validates role + CNP/CUI before signUp; on RPC failure only
  deletes the auth user if no `users` row was committed (no destroying legit
  registrations).
- New `web/src/lib/validation.ts` (pure, tested helpers): `isValidCNP`,
  `isValidCUI`, `isValidRole`, `isValidMessageBody`.

### 🐛 Bug fixes (web)
- **Created shift now appears immediately:** `ShiftsClient` calls
  `router.refresh()` after `createShift` (was invisible until manual reload).
- **Worker filter-tab semantics:** filter by `shift.status` only (previously
  conflated shift-status tabs with application-status, breaking filtering).
- **Jobs sort label:** "Dată (Cele mai apropiate)" (was "Cele mai recente" but
  sorted ascending = soonest first — label lied).
- **Forum per-post comment state:** each post now has its own comment draft
  (previously a single shared string leaked text between posts).
- **`window.location.reload()` → `router.refresh()`:** ForumClient +
  ProfileEditForm (no more full-page reloads).
- **Toast feedback:** ShiftsClient + ProfileEditForm use `sonner` toasts
  instead of fragile inline message banners.

### 🐛 Bug fixes (mobile)
- **Random-coordinate map fallback removed:** shifts whose employer has no
  `lat`/`lng` are now excluded from the map (previously scattered randomly
  around Timișoara, lying about job locations). They still appear in the list.

### 📱 Mobile — foundation + env
- **Env system:** Supabase creds moved out of source into `expo-constants`
  `appConfig.expo.extra` via `app.config.js` + `EXPO_PUBLIC_*` env vars
  (`.env` + `.env.example`, gitignored).
- **App identity:** `ios.bundleIdentifier: com.gigtim.app`,
  `android.package: com.gigtim.app`, slug/scheme `gigtim`, linen splash
  colors.
- **EAS Build:** `mobile/eas.json` with development/preview/production
  profiles (ready for TestFlight IPA + sideloadable APK once an Apple
  Developer account + `eas login` are set up).
- **Fonts installed:** `@expo-google-fonts/sora/inter/jetbrains-mono` +
  `expo-linear-gradient` + `react-native-svg` (for lucide rendering/types).

### 🧪 Testing — frameworks + first suites
- **Web:** Vitest + @testing-library/react + jsdom + @vitest/coverage-v8.
  Config: `web/vitest.config.ts`. **51 tests passing** (validation 48 +
  rating 3). Supabase/next-font/next-themes mocked in `src/test/setup.ts`.
- **Mobile:** Jest (jest-expo preset) + @testing-library/react-native.
  Config: `mobile/jest.config.js`. **11 tests passing** (Zori tokens 8 +
  Button 3). Expo winter runtime neutralized via `moduleNameMapper` +
  pre-seeded Node globals.
- **Agent swarm:** `architect` ratified Zori spec; `code-reviewer` found &
  I fixed critical admin-escalation + Persona-webhook issues; `test-writer`
  added the 48 validation tests.

### 📦 Tooling
- Root `AGENTS.md` runbook (project layout, Zori, conventions, swarm pipeline,
  security invariants, testing strategy, Expo Go instructions).
- `web/.env.example`: added `PERSONA_WEBHOOK_SECRET` + `NEXT_PUBLIC_SITE_URL`.
- Web scripts: `test`, `test:watch`, `test:coverage`, `typecheck`.
- Mobile scripts: `test`, `typecheck`.

---

## [0.3.0] — 2026-04-28

### 👷 Registration & Onboarding — Wizard Overhaul
- **Removed `/onboarding`**: Integrated profile completion directly into the `register` flow to prevent empty profile errors.
- **Worker Verification Fields**: Added mandatory `CNP` and `ID Card Series` fields to the registration step for workers (ITM compliance).
- **Employer Verification Fields**: Added `CUI` and `Address` fields to the registration step for employers.
- **Auth Actions Update**: Modified `register` server action to perform a single-pass creation of Auth User + DB User + Profile row.

### ⭐ Ratings & Reviews — Score Logic
- **Migration 007**: Updated database constraints to allow `0.0` as a starting rating (previously defaulted to `5.0`).
- **Reviews List UI**: Added a "Recenzii și Feedback" section to the profile page that lists every review received, including reviewer names and comments.
- **Rating Counts**: Displayed the number of reviews next to the star rating on the profile.

### 🎨 UI & UX — Polish
- **Filter Labels**: Fixed the database keys (`ALL`, `DATE_ASC`, `PAY_DESC`) showing up in dropdown menus. They now display user-friendly Romanian labels.
- **Profile Upsert**: Updated profile saving to use `UPSERT` with fallbacks, ensuring legacy users can still save their profiles even if they are missing mandatory ITM fields.

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

---

## [Unreleased] — Web login cookie persistence fix

### 🐛 Bug fix — login bounce on Vercel

Web login on `https://gigtim.arhebis.ro/login` was succeeding server-side but
the user was bounced back to `/login` within milliseconds of pressing
"Conectează-te".

**Root cause (two-layer):**

1. **Primary cause — `getCurrentProfile()` SQL error.** Even when the cookie was
   set correctly, the dashboard layout's `getCurrentProfile()` in
   `web/src/lib/romarg-auth.ts` queried non-existent columns:
   `avatar_url` does NOT exist on `worker_profiles` or `employer_profiles`
   (it lives on `users`), and `bio` does NOT exist on `employer_profiles`. The
   thrown `Unknown column 'avatar_url' in 'field list'` was caught and silently
   returned `null`, which made `(dashboard)/layout.tsx` call `redirect('/login')`
   — that was the "bounce" the user saw. This was the cause all along.

2. **Secondary cause — cookie persistence on Vercel Serverless.** The prior
   Server Action `romargLogin` was setting the cookie via `cookies().set()` and
   the client immediately did `router.refresh() + router.push('/shifts')`,
   racing the cookie commit. Replaced with a Route Handler that explicitly
   writes `Set-Cookie` on the HTTP response. (Even though Cause #1 alone was
   enough to bounce, this hardening is still correct.)

**Fix:**
- `web/src/lib/romarg-auth.ts` `getCurrentProfile()`: select `avatar_url` (and
  `email_verified`) from `users` (where it actually lives), drop `avatar_url`
  from both profile-table queries, and drop `bio` from the employer query
  (column does not exist).
- New Route Handler `web/src/app/api/auth/login/route.ts` — POST endpoint that
  validates credentials against MySQL and writes the `gigtim_session` cookie via
  `NextResponse` headers. Also supports `?redirect=true` (or form POST) to
  return 303 → `/shifts` with the cookie attached, the canonical Vercel-safe
  pattern.
- `web/src/app/(auth)/login/page.tsx` — `fetch()`es `/api/auth/login` and on
  success does a hard navigation `window.location.assign('/shifts')`, so the
  browser stores the cookie before `/shifts` is requested.

**Verified locally** against the real ROMARG MySQL with a throwaway user:
login → 200 + Set-Cookie; `/shifts` with cookie → 200 (no redirect to /login);
no `getCurrentProfile` errors in the dev log. The DashboardLayout renders.

Mobile is untouched. `romargLogin` Server Action remains in
`lib/romarg-auth.ts` for backwards compatibility but is no longer called.

---

## 🚀 Planned / Next Steps (Handoff)

1. **Migration Execution**: The user needs to manually run `007_rating_defaults.sql` in the Supabase SQL Editor.
2. **Profile Edit Expansion**: The `ProfileEditForm` should be expanded to allow editing the new ITM fields (CNP, CUI, Address) if a user needs to change them later.
3. **Rating Trigger**: Currently, ratings are stored in the `reviews` table and displayed on the profile. A database trigger should be added (Migration 008) to automatically recalculate the `reliability_score` / `employer_rating` whenever a new review is inserted.
4. **SMS Verification**: Implement the actual SMS API integration (e.g., Twilio) for the phone verification step of registration.

