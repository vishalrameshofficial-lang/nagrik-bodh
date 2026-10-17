'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ExternalLink, Bookmark, BookmarkCheck, Share2, AlertTriangle,
  Info, CheckCircle2, Calendar, Building2, MapPin, Clock, ArrowLeft
} from 'lucide-react'
import { useI18n } from '@/i18n'
import { formatDate, timeAgo } from '@/lib/utils'
import { UpdateCard } from './UpdateCard'
import { DeadlineBadge, UpdateStatusBadge, TranslationStatusBadge } from './DeadlineBadge'
import { createClient } from '@/lib/supabase/client'
import type { CivicUpdate } from '@/types'

interface UpdateDetailPageProps {
  update: CivicUpdate
  related: CivicUpdate[]
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3
        style={{
          fontSize: '0.8125rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-text-muted)',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>
      <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{children}</div>
    </div>
  )
}

export function UpdateDetailPage({ update, related }: UpdateDetailPageProps) {
  const { t, lang } = useI18n()
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const translations = (update as any).translations as Array<Record<string, string>>
  const sources = (update as any).sources as Array<Record<string, string>>
  const category = (update as any).category
  const department = (update as any).department
  const jurisdiction = (update as any).jurisdiction

  const translation = translations?.find((t) => t.lang === lang) ?? translations?.find((t) => t.lang === 'en') ?? translations?.[0]
  const enTranslation = translations?.find((t) => t.lang === 'en')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        supabase
          .from('saved_updates')
          .select('id')
          .eq('user_id', data.user.id)
          .eq('update_id', update.id)
          .single()
          .then(({ data: s }) => setSaved(!!s))
      }
    })
  }, [update.id])

  const handleSave = async () => {
    if (!userId) { window.location.href = '/login'; return }
    setSaving(true)
    if (saved) {
      await supabase.from('saved_updates').delete().eq('user_id', userId).eq('update_id', update.id)
      setSaved(false)
    } else {
      await supabase.from('saved_updates').insert({ user_id: userId, update_id: update.id })
      setSaved(true)
    }
    setSaving(false)
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: translation?.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link copied to clipboard')
    }
  }

  const isUnverifiedTranslation =
    lang === 'ta' &&
    translation?.translation_status !== 'verified' &&
    translation?.translation_status !== 'human_reviewed'

  return (
    <div style={{ padding: '2rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Back */}
        <Link
          href="/updates"
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '1.25rem', gap: '0.375rem' }}
        >
          <ArrowLeft size={14} /> {t('common.back')} to Updates
        </Link>

        {/* Notices */}
        {update.is_demo && (
          <div className="demo-notice" style={{ marginBottom: '1rem' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            <span>{t('update.demo_notice')}</span>
          </div>
        )}
        {update.status === 'superseded' && (
          <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} aria-hidden="true" />
            <span>{t('update.superseded_notice')}</span>
          </div>
        )}
        {update.status === 'withdrawn' && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} aria-hidden="true" />
            <div>
              <strong>{t('update.withdrawn_notice')}</strong>
              {update.withdrawal_reason && <div style={{ marginTop: '0.25rem' }}>{update.withdrawal_reason}</div>}
            </div>
          </div>
        )}
        {isUnverifiedTranslation && (
          <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
            <Info size={16} style={{ flexShrink: 0 }} aria-hidden="true" />
            <span>{t('update.not_verified_translation')}</span>
          </div>
        )}
        {update.deadline_status === 'unknown' && (
          <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
            <Info size={16} style={{ flexShrink: 0 }} aria-hidden="true" />
            <span>{t('update.deadline_unknown')}</span>
          </div>
        )}

        {/* Main content */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2rem',
          }}
        >
          <article>
            {/* Meta badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {category && (
                <Link href={`/categories/${category.slug}`} className="badge badge-green">
                  {lang === 'ta' ? category.name_ta : category.name_en}
                </Link>
              )}
              {jurisdiction && (
                <span className="badge badge-grey">
                  <MapPin size={11} aria-hidden="true" />
                  {lang === 'ta' ? jurisdiction.name_ta : jurisdiction.name_en}
                </span>
              )}
              {department && (
                <span className="badge badge-blue">
                  <Building2 size={11} aria-hidden="true" />
                  {lang === 'ta' ? department.name_ta : department.name_en}
                </span>
              )}
              <UpdateStatusBadge status={update.status} />
              {lang === 'ta' && <TranslationStatusBadge status={translation?.translation_status ?? 'pending'} />}
            </div>

            {/* Title */}
            <h1 lang={lang} style={{ marginBottom: '1rem' }}>{translation?.title}</h1>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-${saved ? 'primary' : 'secondary'} btn-sm`}
                onClick={handleSave}
                disabled={saving}
                id="save-update-btn"
                aria-label={saved ? t('update.unsave') : t('update.save')}
              >
                {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                {saved ? t('update.saved') : t('update.save')}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleShare} id="share-update-btn">
                <Share2 size={15} /> {t('update.share')}
              </button>
            </div>

            <hr className="divider" />

            {/* Summary */}
            <Section title={t('update.summary')}>
              <p style={{ fontSize: '1.0625rem', lineHeight: 1.75, marginTop: 0 }} lang={lang}>
                {translation?.short_summary}
              </p>
            </Section>

            {/* Who is affected */}
            {translation?.who_is_affected && (
              <Section title={t('update.who_affected')}>
                <p style={{ whiteSpace: 'pre-wrap', marginTop: 0 }} lang={lang}>{translation.who_is_affected}</p>
              </Section>
            )}

            {/* What changed */}
            {translation?.what_changed && (
              <Section title={t('update.what_changed')}>
                <p style={{ whiteSpace: 'pre-wrap', marginTop: 0 }} lang={lang}>{translation.what_changed}</p>
              </Section>
            )}

            {/* Required actions */}
            {translation?.required_actions && (
              <div
                style={{
                  background: 'var(--color-accent-subtle)',
                  border: '1px solid #A7F3D0',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#065F46',
                    marginBottom: '0.5rem',
                  }}
                >
                  {t('update.required_actions')}
                </h3>
                <p style={{ color: '#065F46', whiteSpace: 'pre-wrap', marginTop: 0 }} lang={lang}>
                  {translation.required_actions}
                </p>
              </div>
            )}

            {/* Eligibility */}
            {translation?.eligibility && (
              <Section title={t('update.eligibility')}>
                <p style={{ whiteSpace: 'pre-wrap', marginTop: 0 }} lang={lang}>{translation.eligibility}</p>
              </Section>
            )}

            {/* Benefits */}
            {translation?.benefits && (
              <Section title={t('update.benefits')}>
                <p style={{ whiteSpace: 'pre-wrap', marginTop: 0 }} lang={lang}>{translation.benefits}</p>
              </Section>
            )}

            {/* Required documents */}
            {translation?.required_documents && (
              <Section title={t('update.required_documents')}>
                <p style={{ whiteSpace: 'pre-wrap', marginTop: 0 }} lang={lang}>{translation.required_documents}</p>
              </Section>
            )}

            <hr className="divider" />

            {/* Dates sidebar-style info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              {update.effective_date && (
                <div className="card card-sm">
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
                    <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} aria-hidden="true" />
                    {t('update.effective_date')}
                  </div>
                  <div style={{ fontWeight: 600 }}>{formatDate(update.effective_date)}</div>
                </div>
              )}
              {(update.official_deadline || update.deadline_status !== 'unknown') && (
                <div className="card card-sm">
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
                    <Clock size={11} style={{ display: 'inline', marginRight: 4 }} aria-hidden="true" />
                    {t('update.official_deadline')}
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {update.official_deadline ? formatDate(update.official_deadline) : t('update.deadline_unknown')}
                  </div>
                  <div style={{ marginTop: '0.375rem' }}>
                    <DeadlineBadge status={update.deadline_status} />
                  </div>
                </div>
              )}
            </div>

            {/* Sources */}
            {sources && sources.length > 0 && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-text-muted)',
                    marginBottom: '0.875rem',
                  }}
                >
                  {t('update.source')}
                </h3>
                <div className="gap-stack-sm">
                  {sources.map((source, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: 'var(--color-bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {source.title_en && (
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                            {source.title_en}
                          </div>
                        )}
                        {source.issuing_authority && (
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                            {source.issuing_authority}
                          </div>
                        )}
                        {source.document_date && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Published: {formatDate(source.document_date)}
                          </div>
                        )}
                        {source.is_primary && (
                          <span className="badge badge-green" style={{ marginTop: '0.375rem' }}>
                            <CheckCircle2 size={10} /> Primary source
                          </span>
                        )}
                      </div>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ flexShrink: 0 }}
                        aria-label={`Open official source: ${source.title_en || 'source'}`}
                      >
                        <ExternalLink size={13} /> {t('common.open_source')}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification metadata */}
            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
                fontSize: '0.8125rem',
                color: 'var(--color-text-muted)',
                padding: '0.875rem 0',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              {update.published_at && (
                <span>Published {timeAgo(update.published_at)}</span>
              )}
              {update.last_verified_at && (
                <span>
                  <CheckCircle2 size={11} style={{ display: 'inline', color: 'var(--color-accent)' }} aria-hidden="true" />{' '}
                  Verified {timeAgo(update.last_verified_at)}
                </span>
              )}
              {update.source_doc_date && (
                <span>Source dated: {formatDate(update.source_doc_date)}</span>
              )}
            </div>
          </article>
        </div>

        {/* Related updates */}
        {related.length > 0 && (
          <section style={{ marginTop: '3rem' }}>
            <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>
              {t('update.related')}
            </h2>
            <div className="gap-stack" style={{ gap: '0.75rem' }}>
              {related.map((r) => (
                <UpdateCard key={r.id} update={r} lang={lang} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
