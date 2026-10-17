import { z } from 'zod'

// ─── Auth schemas ────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const RegisterSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  display_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name is too long'),
})

// ─── Update schemas ──────────────────────────────────────────

export const UpdateTranslationSchema = z.object({
  lang: z.enum(['en', 'ta']),
  title: z.string().min(5, 'Title is required').max(300),
  short_summary: z.string().min(20, 'Summary is required').max(800),
  who_is_affected: z.string().max(1000).optional().nullable(),
  what_changed: z.string().max(2000).optional().nullable(),
  required_actions: z.string().max(2000).optional().nullable(),
  eligibility: z.string().max(1000).optional().nullable(),
  benefits: z.string().max(1000).optional().nullable(),
  required_documents: z.string().max(1000).optional().nullable(),
})

export const CreateUpdateSchema = z.object({
  category_id: z.string().uuid('Select a valid category'),
  department_id: z.string().uuid().optional().nullable(),
  jurisdiction_id: z.string().uuid().optional().nullable(),
  effective_date: z.string().date().optional().nullable(),
  official_deadline: z.string().date().optional().nullable(),
  deadline_status: z.enum([
    'confirmed',
    'unconfirmed',
    'extended',
    'passed',
    'unknown',
  ]),
  source_doc_date: z.string().date().optional().nullable(),
  translations: z.array(UpdateTranslationSchema).min(1),
  sources: z
    .array(
      z.object({
        url: z.string().url('Enter a valid URL'),
        title_en: z.string().max(300).optional().nullable(),
        issuing_authority: z.string().max(200).optional().nullable(),
        document_date: z.string().date().optional().nullable(),
        is_primary: z.boolean().default(false),
      })
    )
    .min(1, 'At least one source is required'),
})

export const UpdateStatusSchema = z.object({
  status: z.enum([
    'draft',
    'in_review',
    'approved',
    'scheduled',
    'published',
    'rejected',
    'withdrawn',
    'superseded',
  ]),
  notes: z.string().max(1000).optional(),
  scheduled_at: z.string().datetime().optional().nullable(),
  withdrawal_reason: z.string().max(500).optional().nullable(),
})

// ─── Search schemas ──────────────────────────────────────────

export const SearchParamsSchema = z.object({
  q: z.string().max(200).optional(),
  category: z.string().optional(),
  department: z.string().optional(),
  jurisdiction: z.string().optional(),
  status: z
    .enum([
      'draft',
      'in_review',
      'approved',
      'scheduled',
      'published',
      'rejected',
      'withdrawn',
      'superseded',
    ])
    .optional(),
  lang: z.enum(['en', 'ta']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  deadlineStatus: z
    .enum(['confirmed', 'unconfirmed', 'extended', 'passed', 'unknown'])
    .optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
})

// ─── Reminder / preference schemas ───────────────────────────

export const UserPreferencesSchema = z.object({
  language: z.enum(['en', 'ta']),
  email_reminders: z.boolean(),
  reminder_days_before: z.array(z.number().int().min(0).max(90)),
  preferred_categories: z.array(z.string().uuid()).optional().nullable(),
  preferred_jurisdictions: z.array(z.string().uuid()).optional().nullable(),
})

export const CreateReminderSchema = z.object({
  update_id: z.string().uuid().optional().nullable(),
  deadline_id: z.string().uuid().optional().nullable(),
  scheduled_for: z.string().datetime(),
})

// ─── Source schema ────────────────────────────────────────────

export const SourceSchema = z.object({
  url: z.string().url('Enter a valid source URL'),
  title_en: z.string().max(300).optional().nullable(),
  title_ta: z.string().max(300).optional().nullable(),
  issuing_authority: z.string().max(200).optional().nullable(),
  document_date: z.string().date().optional().nullable(),
  is_primary: z.boolean().default(false),
})

// ─── Deadline schema ─────────────────────────────────────────

export const DeadlineSchema = z.object({
  title_en: z.string().min(5).max(300),
  title_ta: z.string().min(5).max(300),
  description_en: z.string().max(1000).optional().nullable(),
  description_ta: z.string().max(1000).optional().nullable(),
  deadline_date: z.string().date().optional().nullable(),
  deadline_time: z.string().optional().nullable(),
  timezone: z.string().default('Asia/Kolkata'),
  status: z.enum(['confirmed', 'unconfirmed', 'extended', 'passed', 'unknown']),
  category_id: z.string().uuid().optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  jurisdiction_id: z.string().uuid().optional().nullable(),
  source_url: z.string().url().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type CreateUpdateInput = z.infer<typeof CreateUpdateSchema>
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>
export type SearchParamsInput = z.infer<typeof SearchParamsSchema>
export type UserPreferencesInput = z.infer<typeof UserPreferencesSchema>
export type DeadlineInput = z.infer<typeof DeadlineSchema>
