// ============================================================
// GigTim — Database TypeScript Types
// Mirrors the Supabase schema from migrations 001 + 002
// ============================================================

// ── Enums ────────────────────────────────────────────────────

export type UserRole = 'WORKER' | 'EMPLOYER' | 'ADMIN'

export type WorkerSkill =
  | 'BARISTA'
  | 'WAITER'
  | 'DISHWASHER'
  | 'STAGEHAND'
  | 'KITCHEN_HELP'
  | 'EVENT_CREW'
  | 'GARDENER'
  | 'CLEANER'
  | 'PET_SITTER'
  | 'PROMOTER'

export type ShiftStatus = 'OPEN' | 'FILLED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NO_SHOW'

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'NEEDS_REVIEW'

export type ChatRoomType = 'SHIFT' | 'DIRECT'

export type ForumCategory = 'GENERAL' | 'TIPS' | 'JOBS' | 'LEGAL'

export type NotificationType =
  | 'SHIFT_APPLICATION' | 'APPLICATION_ACCEPTED' | 'APPLICATION_REJECTED'
  | 'SHIFT_REMINDER' | 'REVIEW_REQUEST' | 'CHAT_MESSAGE'
  | 'ID_VERIFIED' | 'ID_REJECTED' | 'ADMIN_NOTICE'

// ── Table Row Types ──────────────────────────────────────────

export interface User {
  id: string
  role: UserRole
  auth_id: string
  created_at: string
}

export interface WorkerProfile {
  user_id: string
  full_name: string
  cnp: string
  id_card_series: string
  phone_number: string
  city: string
  county: string
  bio: string
  profile_picture_url: string | null
  reliability_score: number
  total_shifts_completed: number
  skills: WorkerSkill[]
}

export interface EmployerProfile {
  user_id: string
  company_name: string
  cui: string
  address: string
  city: string
  county: string
  lat: number | null
  lng: number | null
  employer_rating: number | null
}

export interface JobShift {
  id: string
  employer_id: string
  role_needed: WorkerSkill
  start_time: string
  end_time: string
  hourly_pay_ron: number
  status: ShiftStatus
  created_at: string
}

export interface Application {
  id: string
  shift_id: string
  worker_id: string
  status: ApplicationStatus
  created_at: string
}

export interface IdVerification {
  id: string
  worker_id: string
  persona_inquiry_id: string | null
  status: VerificationStatus
  persona_status: string | null
  rejection_reasons: string[]
  verified_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface ChatRoom {
  id: string
  type: ChatRoomType
  shift_id: string | null
  name: string | null
  created_at: string
}

export interface ChatRoomMember {
  room_id: string
  user_id: string
  joined_at: string
}

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  content: string
  created_at: string
  edited_at: string | null
}

export interface ForumPost {
  id: string
  author_id: string
  title: string
  content: string
  category: ForumCategory
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface ForumComment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown>
  read: boolean
  created_at: string
}

export interface Review {
  id: string
  shift_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string
  created_at: string
}

export interface AdminAuditLog {
  id: string
  admin_id: string
  action: string
  target_table: string | null
  target_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// ── Extended types (with JOINs) ──────────────────────────────

export interface ApplicationWithWorker extends Application {
  worker_profiles: WorkerProfile
}

export interface JobShiftWithEmployer extends JobShift {
  employer_profiles: EmployerProfile
}

export interface ChatMessageWithSender extends ChatMessage {
  users: Pick<User, 'id' | 'role'>
  sender_name?: string
}

export interface ForumPostWithAuthor extends ForumPost {
  users: Pick<User, 'id' | 'role'>
  author_name?: string
  comment_count?: number
}
