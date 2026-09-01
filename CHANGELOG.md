# GigTim — Changelog

> This file tracks **every change** made to the project so that any developer
> or AI model can quickly understand the current state of the codebase.

---

## [0.5.0] — 2026-09-01 — Landing redesign: "Orașul lucrează" (Living Map)

### 🎬 Landing page (branch `redesign/identity`)
- **New hero:** pinned GSAP scroll story in four acts over a stylized night map
  of the city — pins ignite on load, camera zooms to a shift pin (bottom-sheet
  card), a worker dot travels the route to the match, then the ember→saffron
  dawn sweeps the map and the ITM register appears stamped. Storyboard:
  `docs/LANDING_STORYBOARD.md`. Direction chosen from three moodboards
  (Living Map / Espresso / Departure Board).
- **New deps:** `gsap` 3.15 + `@gsap/react` (ScrollTrigger, MotionPathPlugin).
  Reduced motion renders a static composed hero via `gsap.matchMedia`.
- **Zori everywhere:** removed all leftover indigo/blue values from
  `web/src/app/page.tsx` (`to-blue-500`, `#eff6ff` chips, teal/cyan tiles);
  step tiles now ember / saffron / sage; solid CTAs use `primary-strong`
  (AA-safe). Landing navbar and footer now use the real `LogoMark`/`LogoTile`
  instead of the "G" letter tile.
- New components: `web/src/components/landing/LivingMapHero.tsx`,
  `web/src/components/landing/Reveal.tsx` (scroll reveals for sections).
- Dropped the fabricated hero social-proof numbers; `#stats` claims unchanged
  for now (flagged as placeholders in the storyboard doc).

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

## [Unreleased] — Map marketplace + sidebar + logo + data-layer bug fixes

### 🎨 Design — full Zori sweep on web

- **Logo**: new sunrise-clock mark (Zori = Romanian for "dawn"),
  combining a rising sun with clock hands. Two-piece system:
  `web/src/components/brand/Logo.tsx` (`<LogoMark />` monochrome, `<LogoTile />`
  brand lockup) + `web/src/app/icon.svg` (favicon) with ember-orange gradient tile.
  Used in sidebar brand, mobile header, and the browser favicon.
- **Sidebar** (`web/src/app/(dashboard)/DashboardSidebar.tsx`):
  - Removed the hardcoded cold `bg-[#eff4ff]` periwinkle that made the
    sidebar look gray in light mode. Now uses the warm `--sidebar` token.
  - Brand block replaces the "G" with `<LogoTile />`.
  - Added lucide icons per nav item (Map, CalendarClock, ClipboardList,
    MessageCircle, MessagesSquare) — mobile-tab parity.
  - Active pill refined: solid ember fill with AA-compliant `--primary`
    background and a soft ember shadow.
  - Removed dead localStorage chat-unread polling (key was never written).
- **TopHeader** (`web/src/components/layout/TopHeader.tsx`):
  - Replaced the hardcoded `bg-white` + sharp `rounded` (4px) corners
    with Zori tokens (`bg-card`, `bg-background`, `rounded-xl`,
    `border-border/60`). Cold-slate shadow swapped for warm shadow.
- **Profile page** (`web/src/app/(dashboard)/profile/page.tsx`):
  - Stat-value text gradients swapped from raw `from-amber-500`,
    `from-emerald-500 to-teal-600` to the Zori `text-accent` and
    `text-secondary` tokens. Banner amber→primary ends now use
    `from-accent/10 via-primary/5 to-primary/5`. Stops the warm/cool palette clash.

### 🗺️ Map marketplace on web (mobile parity)

Brought the mobile tab "Marketplace" (Timișoara map of open shifts) to web
at `/jobs`. New files:
- `web/src/components/map/LeafletMap.tsx` — client-only Leaflet map
  (no react-leaflet dependency, avoids React 19 compat risk):
  - Carto Positron (light) / Dark Matter (dark) tile base, intentionally
    desaturated so the ember/sage pins carry the chromatic weight
    (matches mobile's custom map styles per `docs/ZORI_DESIGN_SYSTEM.md`).
  - Custom div-icon markers (ember for open shifts, sage for already-applied).
  - Auto fit-bounds to markers; click pin opens detail sheet;
    click map closes selection.
  - Theme-aware: tiles swap on `next-themes` resolvedTheme change.
- Rewrote `web/src/app/(dashboard)/jobs/JobsClient.tsx`:
  - Header tabs "Hartă" / "Listă" with easter-egg segmented control.
  - Filter chips derived from actually-posted shifts' `role_needed`
    (mobile parity — no preset categories).
  - Map view = full-height Leaflet with empty-state overlay.
  - List view = Zori cards with role badge, company, mono pay
    (JetBrains Mono, paid-amount rule), date/time, city/county.
  - Bottom Sheet (side="bottom", base-ui) with role title, company,
    saffron rating stars (only if employer_rating present), details row,
    accent-coloured pay + apply CTA in applied/disabled variants.
  - Apply contract mirrors mobile: CNP + Serie CI gate, OPEN check,
    Romanian toast copy via `sonner`.
- `web/src/app/(dashboard)/jobs/page.tsx`: passes worker's
  `initialAppliedShiftIds` so pins paint sage after a successful apply.

### 🐛 Data-layer bug fixes (silent-empty pages)

While wiring the marketplace, every fixed query was **validated against
the live ROMARG MySQL** with a small SQL harness — the same class of
"Unknown column" error that caused the login bounce. Four functions in
`romarg-data.ts` were broken and silently returning `[]`:
- `getOpenShifts` selected `e.avatar_url as employer_avatar`
  from `employer_profiles` — that table doesn't have `avatar_url`.
  Now joins `users eu` and selects `eu.avatar_url`. Also added
  `e.lat`, `e.lng`, `e.employer_rating` so the map has coords.
- `getMyApplications` (employer branch) selected `w.avatar_url`
  from `worker_profiles` — same bug. Fixed with `users wu` join.
- `getChatRooms` selected `w.avatar_url, e.avatar_url` (double bug).
  Fixed and added `last_message`, `last_message_at`, `last_sender_id`
  subqueries so chat rooms can show last-message previews.
- `getPotentialConnections` selected `w.avatar_url, e.avatar_url`.
  Fixed; added `COALESCE(w.city, e.city) as city`.

Other schema alignment:
- `getMyShifts` is now role-aware: workers see shifts they applied to
  (joins `applications`), employers see their own shifts with
  `application_count` subquery. Returns `my_application_status`
  for workers so /shifts can show "În așteptare" / "Acceptat" / etc.
- `createShift` was inserting columns that **don't exist on the live
  MySQL** (`title`, `category`, `description`, `address`, `city`,
  `county`, `required_workers`). Replaced with the real Supabase-derived
  schema (`role_needed` enum, `start_time`, `end_time`, `hourly_pay_ron`,
  `status`). Now also validates `end_time > start_time` per AGENTS.md
  invariant and `hourly_pay_ron > 0`.
- `applyToShift` now enforces AGENTS.md security invariants:
  worker must have `cnp` AND `id_card_series` on file, and the
  shift must still be `status='OPEN'`. Returns Romanian error
  messages matching the mobile copy.

Validates clean against ROMARG MySQL `REMOVED`.

### 🐛 UI field mismatch + threading fixes

- **Chat** (`web/src/app/(dashboard)/chat/ChatClient.tsx`):
  - Rooms query returned `room_id / other_name / other_avatar`
    but the client was reading `id / name / last_sender_is_me`,
    causing rooms to render nameless + `?room=` deep-linking to never match.
    All references aligned; `last_sender_is_me` now computed from
    `last_sender_id === userId`.
  - Messages no longer require server-set `is_mine`; computed client-side
    from `sender_id === userId`.
  - Connections list: `c.user_id` → `c.id`; `c.city` now provided
    by `getPotentialConnections`.
- **Shifts** (`web/src/app/(dashboard)/shifts/ShiftsClient.tsx`):
  - Replace `shift.applications?.[0]?.count` (always `0`, Supabase ghost)
    with `shift.application_count` from the subquery.
  - "＋" full-width glyph → lucide `<Plus />` icon.
  - Cold-slate shadow RGBA → warm shadow.
  - Pay rendered in `font-mono` per Zori token rule (JetBrains Mono).
  - Worker view now shows the employer column (only `getMyShifts`
    returned their own shifts before); company name appears in
    mobile cards too.

### ✅ Verified end-to-end

Built clean (`npm run build` succeeds, all 20 routes generated including
`/api/auth/login` and `/icon.svg`). tsc + lint on changed files clean.
End-to-end live MySQL test seeded two employers + two shifts in Timișoara
(coords 45.7572, 21.2291), logged in via `/api/auth/login`, hit `/jobs`
→ HTTP 200, both filter chips (Barista, Ospătar) render, both shifts
visible. Test data cleaned up after.

### 📱 Mobile

One-line mobile fix: `forum.tsx handleAddComment()` now `.trim()`s the
comment before the `if (!new)` check, so whitespace-only comments
are rejected (mobile bug found during research). Mobile is otherwise
untouched.

---

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

