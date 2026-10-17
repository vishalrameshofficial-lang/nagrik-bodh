'use client'

import Link from 'next/link'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { useI18n } from '@/i18n'
import { formatDate, timeAgo, cn } from '@/lib/utils'
import type { CivicUpdate, SupportedLang } from '@/types'

interface UpdateCardProps {
  update: CivicUpdate
  lang?: SupportedLang
  compact?: boolean
}

export function UpdateCard({ update, lang: propLang, compact }: UpdateCardProps) {
  const { lang: ctxLang } = useI18n()
  const lang = propLang ?? ctxLang

  const translations = (update as any).translations as Array<{
    lang: string
    title: string
    short_summary: string
    translation_status: string
  }> | undefined

  const translation =
    translations?.find((t) => t.lang === lang) ??
    translations?.find((t) => t.lang === 'en') ??
    translations?.[0]

  if (!translation) return null

  const category = (update as any).category
  const jurisdiction = (update as any).jurisdiction
  const isUnverifiedTranslation =
    lang === 'ta' &&
    translation.translation_status !== 'verified' &&
    translation.translation_status !== 'human_reviewed'

  return (
    <Link
      href={`/updates/${update.slug}`}
      className="update-card"
      aria-label={translation.title}
      lang={lang}
    >
      {/* Demo notice */}
      {update.is_demo && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.75rem',
            color: '#9A3412',
            background: '#FFF7ED',
            border: '1px solid #FED7AA',
            borderRadius: '6px',
            padding: '0.25rem 0.625rem',
            marginBottom: '0.75rem',
          }}
        >
          <AlertTriangle size={12} aria-hidden="true" />
          Demonstration record — not an official government notification
        </div>
      )}

      {/* Meta */}
      <div className="update-card-meta">
        {category && (
          <span className="badge badge-green">
            {lang === 'ta' ? category.name_ta : category.name_en}
          </span>
        )}
        {jurisdiction && (
          <span className="badge badge-grey">
            {lang === 'ta' ? jurisdiction.name_ta : jurisdiction.name_en}
          </span>
        )}
        {!update.is_demo && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.7rem',
              color: 'var(--color-accent)',
            }}
          >
            <CheckCircle2 size={11} aria-hidden="true" />
            Verified
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="update-card-title">{translation.title}</h3>

      {/* Summary */}
      {!compact && (
        <p className="update-card-summary">{translation.short_summary}</p>
      )}

      {/* Unverified translation notice */}
      {isUnverifiedTranslation && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.375rem',
            fontSize: '0.75rem',
            color: '#92400E',
            background: '#FFFBEB',
            borderRadius: '4px',
            padding: '0.25rem 0.5rem',
            marginTop: '0.5rem',
          }}
        >
          <Info size={11} style={{ marginTop: 1, flexShrink: 0 }} aria-hidden="true" />
          Tamil translation not independently reviewed
        </div>
      )}

      {/* Footer */}
      <div className="update-card-footer">
        {update.effective_date && (
          <span>Effective: {formatDate(update.effective_date)}</span>
        )}
        {update.official_deadline && (
          <span style={{ color: 'var(--color-warning)' }}>
            Deadline: {formatDate(update.official_deadline)}
          </span>
        )}
        <span style={{ marginLeft: 'auto' }}>
          {update.published_at ? timeAgo(update.published_at) : ''}
        </span>
      </div>
    </Link>
  )
}
