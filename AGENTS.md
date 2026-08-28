# GigTim — Agent Swarm Runbook

This is the canonical runbook for working on GigTim with opencode's multi-agent
pipeline. It is read by every agent invocation so the swarm stays coordinated.

## Project

GigTim is a Romanian HoReCa day-laborer (*zilieri*) gig-economy marketplace
connecting workers with local businesses for short-term shifts. Target city:
Timișoara. Legal basis: Legea 52/2011 (ITM *Registrul zilierilor*).

## Repo layout

```
Gigtim/
├── AGENTS.md                 ← this runbook
├── DESIGN.md                 ← legacy design notes (superseded by Zori)
├── GigApp_PRD.md             ← product requirements
├── app_architecture_and_design_spec.md
├── CHANGELOG.md              ← append every notable change here
├── docs/ZORI_DESIGN_SYSTEM.md ← ratified Zori spec
├── supabase/
│   ├── migrations/           ← SQL migrations (schema, RLS, triggers)
│   ├── setup_full.sql        ← full DB setup from scratch (all tables + policies + triggers)
│   ├── chunk1_tables.sql     ← types + tables only
│   ├── chunk2_indexes_rls.sql ← indexes + RLS enable + is_admin()
│   ├── chunk3_policies.sql   ← all RLS policies
│   ├── chunk4_rpc_triggers.sql ← register_user RPC + triggers + storage
│   └── reset_database.sql    ← truncates all user data (preserves schema)
├── web/                      ← Next.js 16.2.4 + React 19 + Tailwind v4 + shadcn/base-ui
│   ├── AGENTS.md             ← Next.js 16 warning (READ before web work)
│   └── src/{app,components,lib}
└── mobile/                   ← Expo SDK 54 + RN 0.81.5 + Expo Router + Supabase
    ├── AGENTS.md             ← Expo SDK warning (READ before mobile work)
    ├── app/                  ← Expo Router screens
    │   ├── (auth)/           ← landing, login, register
    │   └── (tabs)/           ← index (map/jobs), applications, forum, chat, profile
    ├── src/
    │   ├── design/           ← tokens.ts, useTheme.ts, fonts.ts
    │   ├── ui/               ← Button, Input, Card, Badge, RatingStars, EmptyState, etc.
    │   └── screens/          ← EmployerHome, EmployerApplications
    └── lib/supabase.ts       ← Supabase client (expo-secure-store + expo-constants)
```

## Current state (as of June 2026)

### What works
- **Auth flow:** Registration via Supabase `signUp` with `raw_user_meta_data` →
  `on_auth_user_created` trigger on `auth.users` auto-creates `users` +
  `worker_profiles`/`employer_profiles` rows. Email confirmation via Gmail SMTP.
- **Landing page:** Clean Zori gradient hero with CTAs (Conectează-te / Creează
  cont nou) visible without scrolling.
- **Login/Register:** Zori-styled with gradient headers, password confirmation
  on register, role selection (Lucrător / Angajator).
- **CNP/Serie CI deferred:** Workers register without identity documents. They
  add CNP + Serie CI later in the profile screen ("Verificare identitate")
  before they can apply to shifts. This is the GDPR data-minimization best
  practice.
- **Map screen:** Zori-themed map with custom map styles (light/dark), filter
  chips, map/list toggle, shift detail bottom sheet with apply button. Empty
  state overlay when no shifts posted.
- **Profile screen:** Zori tokens, avatar upload (expo-image-picker → Supabase
  storage), identity verification section (CNP/Serie CI entry), reviews from
  `reviews` table (not `user_reviews`), "Fără recenzii" when no reviews, stats
  widgets with matching heights.
- **Chat screen:** Zori tokens, real-time messages, message bubbles, empty
  state. Chat rooms auto-created by `create_chat_on_accept` trigger when
  application accepted.
- **Forum screen:** Zori tokens, thread list, thread detail, create post, comments.
- **Employer screens:** EmployerHome (shift management), EmployerApplications
  (accept/reject workers, ITM export, start chat).
- **Chat creation fixed:** `handleStartChat` no longer uses `.insert().select()`
  (RLS chicken-and-egg). Inserts room, then queries for it separately. Also
  `chat_rooms_select_authenticated` policy allows any authenticated user to
  SELECT chat_rooms (metadata only — messages still protected).
- **Button bug fixed:** `square: 0` in Button.tsx caused `fullWidth` buttons to
  render as tiny rectangles. Changed to `square: undefined`.
- **Tests:** Mobile 11/11 Jest tests pass. TypeScript clean on both web + mobile.

### Known issues / TODO
- **Gmail SMTP:** Must configure a valid Google App Password (not regular
  password). Google blocks regular passwords for SMTP. Create one at
  https://myaccount.google.com/apppasswords. Remove spaces from the 16-char
  password. Supabase Dashboard → Authentication → Email Templates → SMTP Settings.
- **Stale sessions:** If the DB is reset but the auth session is cached in
  SecureStore, the user may see "Profilul nu a fost găsit." Fix: Profil →
  Deconectare, or delete + reinstall Expo Go.
- **`register_user` RPC:** The old RPC approach was replaced with the
  `on_auth_user_created` trigger. The RPC function may still exist in the DB
  but is no longer called by the app. It can be safely dropped.
- **Web register page:** Still has CNP/Serie CI fields in the UI (server action
  ignores them). Should be removed from the web UI to match mobile.

## Design system: Zori (ratified v1.0)

The single canonical design system for **both** web and mobile. See
`docs/ZORI_DESIGN_SYSTEM.md` for the full ratified spec.

- **Concept:** warm linen (light) + espresso charcoal (warm dark, NOT cold
  blue-black) surfaces, ember primary, sage secondary, saffron accent.
- **Typography:** Sora (headings, Romanian-designed) + Inter (body) +
  JetBrains Mono (mono).
- **Tokens:** OKLCH on web (`web/src/app/globals.css`); verified sRGB hex on
  mobile (`mobile/src/design/tokens.ts`).
- **Accessibility:** AA contrast, visible focus rings (2px offset), ARIA on
  all interactive elements, `prefers-reduced-motion` respected, semantic
  heading order, keyboard nav, mobile tap targets ≥ 44dp.
- **`*-strong` tokens:** `--primary-strong` / `--secondary-strong` are the AA-
  compliant fill variants used **only** for solid buttons/CTAs.
- **Landing page gradient:** Clean two-tone (espresso dark / linen light).
  Do NOT use the old three-color ember→saffron→sage gradient — it looks muddy.
  Saffron is used only as a text/border accent, not as a background fill.

## Critical conventions (READ before editing)

### Web (`web/AGENTS.md`)
- **Next.js 16.2.4** has breaking changes vs. older versions. Consult
  `web/node_modules/next/dist/docs/` before touching routing/server actions.
- **Tailwind v4** is CSS-first — no `tailwind.config.*`; tokens live in
  `web/src/app/globals.css` `@theme inline`.
- **shadcn/base-nova** on `@base-ui/react` (NOT Radix) — uses `render` prop,
  not `asChild`. See `web/components.json`.
- Server actions live in `web/src/lib/supabase/data-actions.ts` and
  `web/src/lib/supabase/auth-actions.ts`.
- Run lint + typecheck after every web change:
  `npm run lint` and `npx tsc --noEmit` (in `web/`).

### Mobile (`mobile/AGENTS.md`)
- **Expo SDK 54** (downgraded from 56 for Expo Go v54.0.2 compatibility on
  iPhone 11 Pro). All expo-* packages use pre-unified version numbering
  (e.g., `expo-constants@18.x`, `expo-font@14.x`, `expo-router@5.x`).
- **Expo Router** file-based routing with `typedRoutes: true`. Route groups
  `(auth)`, `(tabs)`.
- Supabase creds come from `expo-constants` `appConfig.expo.extra` — NOT
  hardcoded. See `mobile/lib/supabase.ts`.
- Style with Zori primitives (`mobile/src/ui/*`) + `useZoriTheme()` — NOT
  inline hex `StyleSheet`.
- Test on Expo Go: `npx expo start --clear` (from `mobile/`), scan QR with
  iPhone. Use `--clear` after dependency changes.
- **Jest patches:** `jest-expo` setup, `TurboModuleRegistry`, and
  `StyleSheetExports` are patched in `node_modules` to work with RN 0.81.
  These patches are lost on `npm install`. Re-apply if tests fail after
  reinstalling: see `jest.native-mock.js` and the node-patching script.
- Run typecheck + tests after every mobile change:
  `npx tsc --noEmit` and `npm test` (in `mobile/`).

### Backend (`supabase/`)
- **Auth trigger:** `on_auth_user_created` on `auth.users` AFTER INSERT calls
  `handle_new_user()` which reads `raw_user_meta_data` (role, full_name, phone,
  company_name, cui, address, city, county) and creates `users` +
  `worker_profiles`/`employer_profiles` rows. Runs as `SECURITY DEFINER`.
- **CNP/Serie CI nullable:** `worker_profiles.cnp` and `id_card_series` are
  `TEXT DEFAULT NULL` (no NOT NULL UNIQUE CHECK). Workers add them later.
- **Apply gate:** Both mobile `handleApply` and web `applyToShift` check
  `workerProfile.cnp && id_card_series` before allowing application.
- RLS is enabled on every table.
- New schema changes = new numbered migration file (`010_*.sql`, `011_*.sql`).
- **Database setup from scratch:** Run `supabase/setup_full.sql` or the 4
  chunk files in order. To reset all user data: run `supabase/reset_database.sql`.
- **Gmail SMTP required for email confirmation.** Configure in Supabase
  Dashboard → Authentication → Email Templates → SMTP Settings.

## Auth flow (current)

1. User taps "Creează cont nou" → register screen calls
   `supabase.auth.signOut()` on mount (clears any stale session).
2. User fills form → `supabase.auth.signUp({ email, password, options: { data: { role, full_name, phone, ... } } })`.
3. Supabase creates `auth.users` row → `on_auth_user_created` trigger fires →
   `handle_new_user()` creates `users` + profile rows.
4. Supabase sends confirmation email via Gmail SMTP.
5. User clicks email link → email confirmed → user can log in.
6. On login → `supabase.auth.signInWithPassword()` → session stored in
   SecureStore → app redirects to `(tabs)`.
7. Worker can add CNP/Serie CI in profile → then can apply to shifts.

## Agent swarm pipeline

opencode subagent types available: `architect`, `code-reviewer`, `doc-generator`,
`explore`, `git-expert`, `test-writer`, `general`.

### Per-task workflow
1. **explore** (if needed) — map the affected files before editing.
2. **architect** (for non-trivial features) — ratify the approach first.
3. **implement** — the lead (this agent) makes the edits, OR delegates to
   `general` for parallelizable units.
4. **code-reviewer** — reviews every diff for bugs, security, style, a11y.
5. **test-writer** — adds/updates tests for the change.
6. **verify** — run `npx tsc --noEmit` + `npm test` (mobile) / `npm run lint` +
   `tsc --noEmit` (web). Fix until green.
7. **doc-generator** (if API/feature is user-facing) — update CHANGELOG + docs.

### Running the swarm
- Launch independent agents **in parallel** (multiple Task calls in one
  message) to maximize throughput.
- Track every agent in the live todo list (`todowrite`).
- Surface each agent's result inline; act on findings before the next phase.
- After every phase: commit nothing unless the user explicitly asks.

## Testing strategy

### Web (`web/`)
- **Unit/component:** Vitest + @testing-library/react + jsdom.
  Config: `web/vitest.config.ts`. Tests: `web/src/**/*.test.{ts,tsx}`.
- **E2E:** Playwright. Config: `web/playwright.config.ts`.
  Tests: `web/e2e/*.spec.ts`.
- Supabase is **mocked** in tests (never hit the real backend).

### Mobile (`mobile/`)
- **Unit/component:** Jest (expo preset) + @testing-library/react-native.
  Config: `mobile/jest.config.js`. Tests: `mobile/**/*.test.{ts,tsx}`.
- **E2E:** Maestro flows. `mobile/.maestro/*.yaml`.
- Supabase is **mocked** in tests.
- **Jest patches:** `jest-expo` setup.js, `TurboModuleRegistry.js`, and
  `StyleSheetExports.js` are patched in `node_modules` after `npm install`.
  If tests fail with "Object.defineProperty called on non-object" or
  "TurboModuleRegistry.getEnforcing", re-apply patches:
  ```js
  node -e "
  const fs = require('fs');
  // Patch jest-expo setup
  const f1 = 'node_modules/jest-expo/src/preset/setup.js';
  let c1 = fs.readFileSync(f1, 'utf8');
  c1 = c1.replace(\"const mockNativeModules = require('react-native/Libraries/BatchedBridge/NativeModules').default;\", \"const mockNativeModules = { default: {}, ImageLoader: {}, Linking: {}, LinkingManager: {}, NativeUnimoduleProxy: { viewManagersMetadata: {} }, UIManager: {} };\");
  fs.writeFileSync(f1, c1);
  // Patch TurboModuleRegistry
  const f2 = 'node_modules/react-native/Libraries/TurboModule/TurboModuleRegistry.js';
  let c2 = fs.readFileSync(f2, 'utf8');
  c2 = c2.replace(/export function getEnforcing[\s\S]*?return module;\n\}/, \"export function getEnforcing<T>(name: string): T { const module = requireModule<T>(name); if (module == null) { return { getConstants: () => ({}), getTheme: () => null } as any; } return module; }\");
  fs.writeFileSync(f2, c2);
  // Patch StyleSheetExports
  const f3 = 'node_modules/react-native/Libraries/StyleSheet/StyleSheetExports.js';
  let c3 = fs.readFileSync(f3, 'utf8');
  c3 = c3.replace(/PixelRatio\.roundToNearestPixel/g, '(PixelRatio && PixelRatio.roundToNearestPixel ? PixelRatio.roundToNearestPixel : (n) => n)');
  fs.writeFileSync(f3, c3);
  console.log('Patches applied');
  "
  ```

## Testing the app yourself (user)

### iPhone 11 Pro (fastest, today)
1. Install **Expo Go** from the App Store on the iPhone.
2. From `mobile/`: `npx expo start --clear`.
3. Scan the QR with the iPhone Camera → app opens in Expo Go.
4. iPhone + Mac on same Wi-Fi, or press `s` for Tunnel mode.
5. Register a WORKER and an EMPLOYER (two accounts) to exercise the full loop:
   post shift → apply → accept → chat → ITM export → review.
6. **Gmail SMTP must be configured** for email confirmation to work.

### Optional: iOS Simulator
- Requires Xcode.app (only Command Line Tools are installed now).
- After installing Xcode: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`,
  then `npx expo start --ios`.

### Optional: Android emulator
- Requires Android Studio → create an AVD → `npx expo start --android`.

### Standalone builds (later)
- `eas.json` + `ios.bundleIdentifier: com.gigtim.app` +
  `android.package: com.gigtim.app` are configured.
- `npm i -g eas-cli && eas login && eas build --platform ios --profile preview`
  → TestFlight IPA (needs $99/yr Apple Developer account).
- `eas build --platform android --profile preview` → sideloadable APK.

## Security invariants (never violate)

- Every server action that mutates data MUST verify the caller is authorized
  (owns the resource, is the room member, is ADMIN, etc.). Do not rely solely
  on layout guards.
- `applyToShift` MUST verify the shift is still `OPEN` AND the worker has
  CNP + Serie CI on file.
- `createShift` MUST validate `end_time > start_time` and `hourly_pay_ron > 0`.
- CNP (13 digits) and CUI MUST be validated server-side when provided.
- CNP/Serie CI are NOT required at registration — only before applying to shifts.
- The Persona webhook MUST verify the `Persona-Signature` header (not
  `X-Persona-Signature`).
- Never commit secrets. Supabase anon key is public-by-design (RLS protects
  data) but should be injected via env, not literals.

## Legal compliance status

**See the full legal review in the conversation history.** Key findings:

### Compliant ✅
- CNP collection deferred to post-registration (GDPR Art. 5(1)(c) data minimization).
- Marketplace model (not temp agency) — no employment license needed today.
- No payment processing — no BNR license needed.
- Persona webhook HMAC verification correctly implemented.
- RLS enabled on all tables.

### Non-compliant / must fix before launch ❌
1. **No Privacy Policy / Terms / Cookie banner** — Art. 13 GDPR violation.
2. **CNP stored in plaintext** in `worker_profiles` — no encryption at rest.
3. **Employer RLS too broad** — any employer can read any worker's CNP, not
   just accepted applicants. Tighten `worker_profiles_select_employers` policy.
4. **No minimum-wage floor** — DB allows 1 ban/oră. Add a
   `regulatory_thresholds` table + DB CHECK + server validation.
5. **ITM export incomplete** — missing data, durata, remunerație, CAEN fields.
6. **Persona not enforced** — marketing says "verificată automat" but
   `applyToShift` doesn't check Persona status.
7. **No 90-day/year cap** — Legea 52/2011 limits zilieri to 90 days/employer/year.
8. **Landing page claims overstated** — "Export ITM automat" is misleading.
9. **No DPO appointed / no RoPA / no DPIA** — Art. 30, 35, 37 obligations.
10. **No breach-notification process** — Art. 33 (72h to ANSPDCP).
11. **CUI validation is format-only** — not verified against ONRC / mfinante.
12. **EU Directive 2024/2831 (platform work)** transposition due 2 Dec 2026 —
    prepare algorithmic-transparency notice + human-review channel.

### Priority remediation order
1. Publish Romanian Privacy Policy + Terms + Cookie banner + Art. 13 notice.
2. Encrypt CNP + id_card_series at rest (pgcrypto); switch UNIQUE to HMAC index.
3. Tighten `worker_profiles_select_employers` RLS (CNP only after acceptance).
4. Enforce minimum-wage floor via `regulatory_thresholds` table.
5. Complete ITM export with all 7 mandatory fields.
6. Enforce or honestly describe Persona verification.
7. Validate employer CUI against ONRC.
8. Add 90-day/year cap + CAEN whitelist enforcement.
9. Appoint DPO, draft RoPA, run DPIA, set up breach-notification runbook.
10. Prepare for Directive 2024/2831 (Dec 2026).

## Future nice-to-have improvements

- **Push notifications:** `expo-notifications` for shift reminders, chat
  messages, application status updates.
- **Saved jobs:** Let workers bookmark shifts for later.
- **Reviews UI:** Post-shift review flow (both worker → employer and employer
  → worker) with star rating + comment.
- **Dark mode toggle:** Manual toggle in settings (currently follows system).
- **Profile completion bar:** Show % complete (photo, identity, skills, etc.).
- **Shift calendar:** Calendar view for upcoming/past shifts.
- **In-app notifications panel:** Bell icon with unread count.
- **Admin dashboard:** User management, shift moderation, analytics.
- **Worker skills selection:** Let workers pick their skills (BARISTA, WAITER,
  etc.) in profile → better matching.
- **Employer verification:** Validate CUI against ONRC API at registration.
- **Rating-based ranking:** Sort workers by reliability_score on employer's
  applicant list.
- **Multi-city expansion:** Add Cluj-Napoca, Bucharest (currently Timișoara only).
- **EAS Build standalone:** TestFlight + APK for production distribution.
- **Playwright E2E tests (web):** Full registration → login → post shift →
  apply → accept → chat → review flow.
- **Maestro E2E flows (mobile):** Same flow on Expo Go / standalone build.

## Empty-state policy

The app ships **empty** — no fake/seed data. Every screen MUST have a polished,
accessible empty state (icon + title + description + optional CTA) using the
`EmptyState` primitive. The user registers their own accounts and posts their
own shifts to test.

## CHANGELOG

Append notable changes here in chronological order. Most recent first.

### June 2026
- Expo SDK downgraded 56 → 54 for Expo Go v54.0.2 compatibility.
- Auth flow replaced: `register_user` RPC → `on_auth_user_created` trigger on
  `auth.users` (simpler, works with email confirmation).
- CNP/Serie CI removed from registration; added as deferred identity
  verification step in profile screen.
- Landing page created with Zori gradient hero, CTAs in hero (no scroll).
- Login/Register screens redesigned with clean gradient headers.
- Chat creation bug fixed (RLS chicken-and-egg on `chat_rooms` SELECT).
- Button bug fixed (`square: 0` → `square: undefined` for `fullWidth`).
- Profile screen: fixed `user_reviews` → `reviews` table query.
- Profile screen: "Fără recenzii" instead of 0/5 when no reviews.
- Profile screen: avatar upload via `expo-image-picker` + Supabase storage.
- Profile screen: identity verification section (CNP/Serie CI entry).
- Map screen: Zori tokens, custom map styles, empty state overlay.
- Chat/Forum screens: fully redesigned with Zori tokens (no more hardcoded hex).
- Legal compliance review completed (see "Legal compliance status" above).
- Gmail SMTP configured for email confirmation.
