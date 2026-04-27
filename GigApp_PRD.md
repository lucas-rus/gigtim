# Product Requirements Document (PRD): Romanian Gig Economy App

## 1. Role & Objective
You are an expert Full-Stack Architect and Lead Developer. Your goal is to build a modern, high-performance gig-economy marketplace app (Platform model) specifically designed for the Romanian HoReCa market (focusing initially on Timișoara). The app connects short-term workers (students) with local businesses (cafes, restaurants, events) for day-labor shifts.

## 2. Tech Stack
* **Mobile Frontend (Workers):** React Native, Expo, TypeScript, Tailwind CSS (NativeWind).
* **Web Frontend (Employers):** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui.
* **Backend/Database:** Supabase (PostgreSQL, Auth, Real-time WebSockets, Edge Functions).
* **Payments:** Stripe Connect.
* **Mapping:** React Native Maps (Google Maps API).

## 3. Core Business Logic & Compliance (Romanian Market)
* The platform acts as a matchmaker, NOT the legal employer.
* **ITM Compliance:** To legally use day laborers (*zilieri*), employers must register them in the Romanian ITM portal (Legea 52/2011). The app must collect the worker's full name, CNP (Romanian ID number), and CI series/number. Upon a successful match, the app must auto-generate a data export (XML/CSV formatted for the Romanian *Registrul zilierilor*) for the employer to easily download.

## 4. Database Schema (Core Entities)

### 1. Users Table (Base)
* `id` (UUID)
* `role` (Enum: WORKER, EMPLOYER)
* `auth_id` (Foreign Key to Supabase Auth)
* `created_at` (Timestamp)

### 2. WorkerProfiles Table
* `user_id` (Foreign Key -> Users)
* `full_name` (String)
* `cnp` (String, unique, 13 digits)
* `id_card_series` (String)
* `reliability_score` (Float, 1.0 to 5.0, default 5.0)
* `total_shifts_completed` (Int)
* `skills` (Array of Enums: BARISTA, WAITER, DISHWASHER, STAGEHAND)

### 3. EmployerProfiles Table
* `user_id` (Foreign Key -> Users)
* `company_name` (String)
* `cui` (String - Romanian Tax ID)
* `address` (String)
* `lat`, `lng` (Coordinates)
* `employer_rating` (Float)

### 4. JobShifts Table
* `id` (UUID)
* `employer_id` (Foreign Key -> EmployerProfiles)
* `role_needed` (Enum)
* `start_time` (Timestamp)
* `end_time` (Timestamp)
* `hourly_pay_ron` (Float)
* `status` (Enum: OPEN, FILLED, IN_PROGRESS, COMPLETED, CANCELLED)

### 5. Applications Table
* `id` (UUID)
* `shift_id` (Foreign Key -> JobShifts)
* `worker_id` (Foreign Key -> WorkerProfiles)
* `status` (Enum: PENDING, ACCEPTED, REJECTED, NO_SHOW)

## 5. Key User Flows to Implement

### Flow 1: The "Tinder meets Maps" Worker Discovery
1. Worker opens the mobile app.
2. Sees a Map View centered on Timișoara with pins representing `OPEN` JobShifts for today/tomorrow.
3. Tapping a pin opens a sleek bottom-sheet modal with shift details.
4. 1-click "Apply" button inserts a record into the `Applications` table.

### Flow 2: The Employer "Speed Match"
1. Employer posts a shift on the web dashboard.
2. Supabase Real-time triggers a push notification to Workers within a 5km radius with matching `skills`.
3. Employer dashboard updates in real-time as `Applications` come in.
4. Employer sees applicants ordered by `reliability_score`.
5. Employer clicks "Accept". Shift status changes to `FILLED`. Other applicants are notified they weren't selected.
6. *CRITICAL:* The dashboard instantly provides a "Download ITM Data" button containing the accepted worker's CNP and details.

### Flow 3: AI-Driven Reliability & Post-Shift
1. When `end_time` passes, both parties are prompted to review each other (1 to 5 stars).
2. If an employer marks a worker as `NO_SHOW`, their `reliability_score` takes a massive penalty via a Supabase Edge Function database trigger.
3. Stripe API is called to capture the platform matching fee from the Employer's saved card.

## 6. Initial Instructions for AI
Acknowledge you have read and understood this architecture. Do not write the full application at once. Start by providing the exact SQL commands to create the Supabase tables, enums, and Row Level Security (RLS) policies based on the schema above. Wait for my confirmation before moving to the Next.js web dashboard initialization.
