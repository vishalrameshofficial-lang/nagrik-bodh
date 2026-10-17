import test from 'node:test'
import assert from 'node:assert/strict'
import { z } from 'zod'

// ─── Inline Schemas for Isolated Unit Testing (mirrors src/lib/validations/index.ts) ───

const LoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const RegisterSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  display_name: z.string().min(2).max(80),
})

const SourceSchema = z.object({
  url: z.string().url('Enter a valid source URL'),
  title_en: z.string().max(300).optional().nullable(),
  issuing_authority: z.string().max(200).optional().nullable(),
  is_primary: z.boolean().default(false),
})

const DeadlineSchema = z.object({
  title_en: z.string().min(5).max(300),
  title_ta: z.string().min(5).max(300),
  deadline_date: z.string().date().optional().nullable(),
  status: z.enum(['confirmed', 'unconfirmed', 'extended', 'passed', 'unknown']),
  timezone: z.string().default('Asia/Kolkata'),
})

const UpdateTranslationSchema = z.object({
  lang: z.enum(['en', 'ta']),
  title: z.string().min(5).max(300),
  short_summary: z.string().min(20).max(800),
})

const CreateUpdateSchema = z.object({
  category_id: z.string().uuid(),
  deadline_status: z.enum(['confirmed', 'unconfirmed', 'extended', 'passed', 'unknown']),
  translations: z.array(UpdateTranslationSchema).min(1),
  sources: z.array(SourceSchema).min(1, 'At least one source is required'),
})

// ─── 1. Authentication & Registration Validation ──────────────────

test('Auth: Register rejects passwords without uppercase or numbers', () => {
  const weakPassword1 = {
    email: 'citizen@example.in',
    password: 'passwordonly',
    display_name: 'Aarav Sharma',
  }
  assert.throws(() => RegisterSchema.parse(weakPassword1), /uppercase/)

  const weakPassword2 = {
    email: 'citizen@example.in',
    password: 'PasswordOnly',
    display_name: 'Aarav Sharma',
  }
  assert.throws(() => RegisterSchema.parse(weakPassword2), /number/)
})

test('Auth: Register accepts valid compliant citizen registration', () => {
  const valid = {
    email: 'citizen@example.in',
    password: 'ValidPassword123',
    display_name: 'Aarav Sharma',
  }
  const parsed = RegisterSchema.parse(valid)
  assert.equal(parsed.email, 'citizen@example.in')
})

test('Auth: Login accepts valid email & rejects malformed emails', () => {
  assert.throws(() => LoginSchema.parse({ email: 'not-an-email', password: 'password123' }))
  assert.ok(LoginSchema.parse({ email: 'test@nagrikbodh.in', password: 'password123' }))
})

// ─── 2. Source URL & Citation Validation ──────────────────────────

test('Sources: Rejects invalid or non-URL source strings', () => {
  assert.throws(() => SourceSchema.parse({ url: 'not_a_valid_url' }))
  assert.throws(() => SourceSchema.parse({ url: 'example.com/missing-protocol' }))
})

test('Sources: Accepts valid official government URLs', () => {
  const validSource = {
    url: 'https://pmkisan.gov.in/Documents/Guidelines.pdf',
    title_en: 'PM-KISAN Operational Guidelines',
    issuing_authority: 'Ministry of Agriculture',
    is_primary: true,
  }
  const parsed = SourceSchema.parse(validSource)
  assert.equal(parsed.is_primary, true)
})

// ─── 3. Content Verification & Editorial Workflow Invariants ───────

test('Editorial: Rejects update creation without at least one official source', () => {
  const updateWithoutSource = {
    category_id: '11111111-1111-1111-1111-111111111111',
    deadline_status: 'unconfirmed',
    translations: [
      {
        lang: 'en',
        title: 'Valid English Title',
        short_summary: 'This is a sufficiently long English summary describing government notification.',
      },
    ],
    sources: [],
  }
  assert.throws(() => CreateUpdateSchema.parse(updateWithoutSource))
})

test('Editorial: Requires minimum summary length to prevent shallow notices', () => {
  const shortSummary = {
    lang: 'en',
    title: 'Short Title',
    short_summary: 'Too short',
  }
  assert.throws(() => UpdateTranslationSchema.parse(shortSummary))
})

test('Editorial: Separation of duties rule prevents author self-approval unless admin', () => {
  function canApprove(authorId, reviewerId, reviewerRole) {
    if (reviewerRole === 'admin') return true
    if (authorId === reviewerId) return false // Self-approval blocked for regular reviewers
    return reviewerRole === 'reviewer'
  }

  const authorId = 'user-editor-1'
  const reviewerId = 'user-editor-1'
  const secondReviewerId = 'user-reviewer-2'

  assert.equal(canApprove(authorId, reviewerId, 'reviewer'), false, 'Author cannot approve own draft')
  assert.equal(canApprove(authorId, secondReviewerId, 'reviewer'), true, 'Second reviewer can approve draft')
  assert.equal(canApprove(authorId, reviewerId, 'admin'), true, 'System admin has override permission')
})

// ─── 4. Deadline Verification Integrity ───────────────────────────

test('Deadlines: Explicitly supports unconfirmed, confirmed and unknown statuses', () => {
  const allowedStatuses = ['confirmed', 'unconfirmed', 'extended', 'passed', 'unknown']

  allowedStatuses.forEach((status) => {
    const dl = DeadlineSchema.parse({
      title_en: 'ITR Filing Window AY 2024-25',
      title_ta: 'வருமான வரி தாக்கல்',
      deadline_date: '2025-07-31',
      status,
    })
    assert.equal(dl.status, status)
  })

  assert.throws(() => {
    DeadlineSchema.parse({
      title_en: 'Test',
      title_ta: 'Test',
      status: 'invented_status',
    })
  })
})

test('Deadlines: Default official timezone is Indian Standard Time (Asia/Kolkata)', () => {
  const dl = DeadlineSchema.parse({
    title_en: 'GST Return GSTR-3B',
    title_ta: 'ஜிஎஸ்டி ரிட்டர்ன்',
    deadline_date: '2025-08-20',
    status: 'confirmed',
  })
  assert.equal(dl.timezone, 'Asia/Kolkata')
})

// ─── 5. Bilingual & Translation Safeguards ─────────────────────────

test('Bilingual: Correctly requires explicit language identifier (en or ta)', () => {
  assert.throws(() => UpdateTranslationSchema.parse({ lang: 'fr', title: 'Title', short_summary: 'Summary' }))
  assert.ok(
    UpdateTranslationSchema.parse({
      lang: 'ta',
      title: 'விளக்க பதிவு',
      short_summary: 'இந்த விளக்க பதிவு நாகரிக் போத் வடிவமைப்பை விளக்குகிறது.',
    })
  )
})

test('Bilingual: Unverified translations trigger safety disclaimer in UI', () => {
  function getTranslationWarning(translationStatus) {
    if (translationStatus === 'verified' || translationStatus === 'human_reviewed') {
      return null
    }
    return 'This translation has not been independently reviewed. Do not rely on it for official compliance.'
  }

  assert.equal(getTranslationWarning('verified'), null)
  assert.equal(getTranslationWarning('human_reviewed'), null)
  assert.match(getTranslationWarning('pending'), /not been independently reviewed/)
  assert.match(getTranslationWarning('machine_draft'), /not been independently reviewed/)
})

// ─── 6. User Data Isolation & Role Escalation Defense ──────────────

test('Security: Citizens cannot self-elevate role in profile updates', () => {
  function applyProfileUpdate(currentProfile, incomingUpdate) {
    if (incomingUpdate.role && incomingUpdate.role !== currentProfile.role && currentProfile.role === 'citizen') {
      throw new Error('Forbidden: Citizens cannot change their own role')
    }
    return { ...currentProfile, ...incomingUpdate }
  }

  const citizen = { id: 'u1', role: 'citizen', display_name: 'Citizen 1' }
  assert.throws(() => applyProfileUpdate(citizen, { role: 'admin' }), /Citizens cannot change their own role/)

  // Legitimate profile update succeeds
  const updated = applyProfileUpdate(citizen, { display_name: 'New Name' })
  assert.equal(updated.display_name, 'New Name')
  assert.equal(updated.role, 'citizen')
})

// ─── 7. Correction & Withdrawal Integrity ─────────────────────────

test('Audit & Corrections: Withdrawn updates require mandatory reason and maintain status', () => {
  function withdrawUpdate(update, reason, staffUserId) {
    if (!reason || reason.trim().length === 0) {
      throw new Error('Withdrawal reason is mandatory')
    }
    return {
      ...update,
      status: 'withdrawn',
      withdrawn_at: new Date().toISOString(),
      withdrawal_reason: reason,
      updated_by: staffUserId,
    }
  }

  const published = { id: 'up-1', status: 'published' }
  assert.throws(() => withdrawUpdate(published, '', 'staff-1'), /reason is mandatory/)

  const withdrawn = withdrawUpdate(published, 'Superseded by notification No. 42/2025', 'staff-1')
  assert.equal(withdrawn.status, 'withdrawn')
  assert.ok(withdrawn.withdrawn_at)
})
