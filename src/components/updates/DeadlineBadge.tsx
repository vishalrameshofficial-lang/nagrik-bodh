'use client'

import type { DeadlineStatus } from '@/types'
import { useI18n } from '@/i18n'

const statusStyles: Record<DeadlineStatus, { className: string; label: string }> = {
  confirmed: { className: 'badge badge-green', label: 'status.deadline_confirmed' },
  unconfirmed: { className: 'badge badge-yellow', label: 'status.deadline_unconfirmed' },
  extended: { className: 'badge badge-blue', label: 'status.deadline_extended' },
  passed: { className: 'badge badge-grey', label: 'status.deadline_passed' },
  unknown: { className: 'badge badge-grey', label: 'status.deadline_unknown' },
}

export function DeadlineBadge({ status }: { status: DeadlineStatus }) {
  const { t } = useI18n()
  const { className, label } = statusStyles[status] ?? statusStyles.unknown
  return <span className={className}>{t(label)}</span>
}

export function UpdateStatusBadge({ status }: { status: string }) {
  const { t } = useI18n()
  const styles: Record<string, string> = {
    draft: 'badge badge-grey',
    in_review: 'badge badge-yellow',
    approved: 'badge badge-blue',
    scheduled: 'badge badge-navy',
    published: 'badge badge-green',
    rejected: 'badge badge-red',
    withdrawn: 'badge badge-orange',
    superseded: 'badge badge-grey',
  }
  return <span className={styles[status] ?? 'badge badge-grey'}>{t(`status.${status}`)}</span>
}

export function TranslationStatusBadge({ status }: { status: string }) {
  const { t } = useI18n()
  const styles: Record<string, string> = {
    pending: 'badge badge-grey',
    machine_draft: 'badge badge-orange',
    human_reviewed: 'badge badge-blue',
    verified: 'badge badge-green',
  }
  return (
    <span className={styles[status] ?? 'badge badge-grey'}>
      {t(`status.translation_${status}`) || status}
    </span>
  )
}
