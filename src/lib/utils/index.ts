import { clsx, type ClassValue } from 'clsx'
import { format, formatDistanceToNow, isPast, isFuture, differenceInDays } from 'date-fns'
import type { SupportedLang, UpdateStatus, TranslationStatus, DeadlineStatus } from '@/types'

// ─── Class name utility ──────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// ─── Date utilities ──────────────────────────────────────────
export function formatDate(date: string | null | undefined, pattern = 'dd MMM yyyy'): string {
  if (!date) return '—'
  try {
    return format(new Date(date), pattern)
  } catch {
    return '—'
  }
}

export function timeAgo(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return '—'
  }
}

export function deadlineDaysRemaining(date: string | null): number | null {
  if (!date) return null
  try {
    const d = new Date(date)
    return differenceInDays(d, new Date())
  } catch {
    return null
  }
}

export function isDeadlinePast(date: string | null): boolean {
  if (!date) return false
  try {
    return isPast(new Date(date))
  } catch {
    return false
  }
}

export function isDeadlineFuture(date: string | null): boolean {
  if (!date) return false
  try {
    return isFuture(new Date(date))
  } catch {
    return false
  }
}

// ─── Status label helpers ────────────────────────────────────

export function statusLabel(status: UpdateStatus): string {
  const labels: Record<UpdateStatus, string> = {
    draft: 'Draft',
    in_review: 'In Review',
    approved: 'Approved',
    scheduled: 'Scheduled',
    published: 'Published',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
    superseded: 'Superseded',
  }
  return labels[status] ?? status
}

export function translationStatusLabel(status: TranslationStatus): string {
  const labels: Record<TranslationStatus, string> = {
    pending: 'Translation Pending',
    machine_draft: 'Machine Draft — Not Verified',
    human_reviewed: 'Human Reviewed',
    verified: 'Verified',
  }
  return labels[status] ?? status
}

export function deadlineStatusLabel(status: DeadlineStatus): string {
  const labels: Record<DeadlineStatus, string> = {
    confirmed: 'Confirmed',
    unconfirmed: 'Unconfirmed',
    extended: 'Extended',
    passed: 'Passed',
    unknown: 'Date Unknown',
  }
  return labels[status] ?? status
}

// ─── Slug generator ──────────────────────────────────────────

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)
}

// ─── Language helpers ────────────────────────────────────────

export function getTranslation(
  translations: Array<{ lang: string; [key: string]: unknown }> | undefined,
  lang: SupportedLang,
  field: string,
  fallback = ''
): string {
  if (!translations) return fallback
  const t = translations.find((t) => t.lang === lang) ?? translations[0]
  return (t?.[field] as string) ?? fallback
}

// ─── URL validators ──────────────────────────────────────────

export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

// ─── Truncate text ───────────────────────────────────────────

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 1) + '…'
}

// ─── Pagination helpers ──────────────────────────────────────

export function getPageRange(page: number, pageSize: number): { from: number; to: number } {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  return { from, to }
}

// ─── API error helper ────────────────────────────────────────

export function createApiError(message: string, statusCode: number) {
  return Response.json({ error: 'Error', message, statusCode }, { status: statusCode })
}
