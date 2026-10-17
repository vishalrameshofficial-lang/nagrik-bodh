// ============================================================
// Nagrik Bodh — Core TypeScript Types
// ============================================================

export type UserRole = 'citizen' | 'editor' | 'reviewer' | 'admin'
export type UpdateStatus = 'draft' | 'in_review' | 'approved' | 'scheduled' | 'published' | 'rejected' | 'withdrawn' | 'superseded'
export type TranslationStatus = 'pending' | 'machine_draft' | 'human_reviewed' | 'verified'
export type DeadlineStatus = 'confirmed' | 'unconfirmed' | 'extended' | 'passed' | 'unknown'
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'cancelled'
export type AuditAction = 'created' | 'updated' | 'submitted_for_review' | 'approved' | 'rejected' | 'scheduled' | 'published' | 'withdrawn' | 'superseded' | 'corrected' | 'deleted'
export type SupportedLang = 'en' | 'ta'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  role: UserRole
  language_pref: SupportedLang
  email_notifications: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Category {
  id: string
  slug: string
  name_en: string
  name_ta: string
  description_en: string | null
  description_ta: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  slug: string
  name_en: string
  name_ta: string
  ministry_en: string | null
  ministry_ta: string | null
  website_url: string | null
  is_central: boolean
  state_code: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Jurisdiction {
  id: string
  slug: string
  name_en: string
  name_ta: string
  type: 'central' | 'state' | 'union_territory' | 'local'
  state_code: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CivicUpdate {
  id: string
  slug: string
  status: UpdateStatus
  category_id: string
  department_id: string | null
  jurisdiction_id: string | null
  effective_date: string | null
  official_deadline: string | null
  deadline_status: DeadlineStatus
  deadline_timezone: string
  is_demo: boolean
  created_by: string
  updated_by: string | null
  submitted_by: string | null
  submitted_at: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  scheduled_at: string | null
  published_at: string | null
  superseded_by: string | null
  withdrawn_at: string | null
  withdrawal_reason: string | null
  source_doc_date: string | null
  source_retrieved_at: string | null
  last_verified_at: string | null
  created_at: string
  updated_at: string
  // Joined fields
  category?: Category
  department?: Department
  jurisdiction?: Jurisdiction
  translations?: UpdateTranslation[]
  sources?: Source[]
}

export interface UpdateTranslation {
  id: string
  update_id: string
  lang: SupportedLang
  translation_status: TranslationStatus
  reviewed_by: string | null
  reviewed_at: string | null
  title: string
  short_summary: string
  who_is_affected: string | null
  what_changed: string | null
  required_actions: string | null
  eligibility: string | null
  benefits: string | null
  required_documents: string | null
  created_by: string
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface Source {
  id: string
  update_id: string
  url: string
  title_en: string | null
  title_ta: string | null
  issuing_authority: string | null
  document_date: string | null
  retrieved_at: string | null
  is_primary: boolean
  is_verified: boolean
  verified_by: string | null
  verified_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Deadline {
  id: string
  update_id: string | null
  title_en: string
  title_ta: string
  description_en: string | null
  description_ta: string | null
  deadline_date: string | null
  deadline_time: string | null
  timezone: string
  status: DeadlineStatus
  category_id: string | null
  department_id: string | null
  jurisdiction_id: string | null
  source_url: string | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
  // Joined
  category?: Category
  department?: Department
  jurisdiction?: Jurisdiction
}

export interface SavedUpdate {
  id: string
  user_id: string
  update_id: string
  saved_at: string
  update?: CivicUpdate
}

export interface UserPreferences {
  id: string
  user_id: string
  language: SupportedLang
  email_reminders: boolean
  reminder_days_before: number[]
  preferred_categories: string[] | null
  preferred_jurisdictions: string[] | null
  updated_at: string
}

export interface ContentReview {
  id: string
  update_id: string
  reviewer_id: string
  action: AuditAction
  notes: string | null
  created_at: string
  reviewer?: Profile
}

export interface AuditLog {
  id: string
  table_name: string
  record_id: string
  action: AuditAction
  performed_by: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  performer?: Profile
}

export interface NotificationJob {
  id: string
  user_id: string
  update_id: string | null
  deadline_id: string | null
  type: 'deadline_reminder' | 'new_update' | 'correction_notice'
  status: NotificationStatus
  scheduled_for: string
  sent_at: string | null
  failed_at: string | null
  failure_reason: string | null
  retry_count: number
  created_at: string
  updated_at: string
}

// ─── API Response Types ─────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

// ─── Content display helpers ────────────────────────────────

export interface UpdateCardData {
  id: string
  slug: string
  status: UpdateStatus
  is_demo: boolean
  effective_date: string | null
  official_deadline: string | null
  deadline_status: DeadlineStatus
  published_at: string | null
  last_verified_at: string | null
  category: Category
  department: Department | null
  jurisdiction: Jurisdiction | null
  translation: UpdateTranslation
}

// ─── Search / filter params ─────────────────────────────────

export interface UpdateSearchParams {
  q?: string
  category?: string
  department?: string
  jurisdiction?: string
  status?: UpdateStatus
  lang?: SupportedLang
  page?: number
  pageSize?: number
  deadlineStatus?: DeadlineStatus
  from?: string
  to?: string
}
