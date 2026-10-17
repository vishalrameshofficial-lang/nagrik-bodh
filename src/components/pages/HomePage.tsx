'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, ArrowRight, Calendar, AlertCircle, CheckCircle2,
  FileText, Landmark, Clock, Shield, ChevronRight
} from 'lucide-react'
import { useI18n } from '@/i18n'
import { UpdateCard } from '@/components/updates/UpdateCard'
import { DeadlineBadge } from '@/components/updates/DeadlineBadge'
import { formatDate, deadlineDaysRemaining } from '@/lib/utils'
import type { CivicUpdate, Deadline, Category } from '@/types'

interface HomePageProps {
  updates: CivicUpdate[]
  deadlines: Deadline[]
  categories: Category[]
}

export function HomePage({ updates, deadlines, categories }: HomePageProps) {
  const { t, lang } = useI18n()
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/updates?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const categoryIcons: Record<string, React.ReactNode> = {
    'government-schemes': <Landmark size={22} />,
    'rules-regulations': <FileText size={22} />,
    'tax-compliance': <Shield size={22} />,
    'public-services': <CheckCircle2 size={22} />,
  }

  return (
    <>
      {/* ── Hero Section ────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(180deg, var(--color-bg-subtle) 0%, var(--color-bg) 100%)',
          padding: '4rem 0 3rem',
          borderBottom: '1px solid var(--color-border)',
        }}
        aria-labelledby="hero-heading"
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: 720 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              background: 'var(--color-accent-light)',
              color: 'var(--color-accent)',
              padding: '0.3rem 0.875rem',
              borderRadius: 9999,
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              letterSpacing: '0.01em',
            }}
          >
            <CheckCircle2 size={13} />
            Verified Civic Information Platform
          </div>

          <h1
            id="hero-heading"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              color: 'var(--color-text-primary)',
              marginBottom: '1.25rem',
            }}
          >
            {lang === 'ta' ? (
              <>
                அரசாங்க புதுப்பிப்புகள்,<br />
                <span style={{ color: 'var(--color-accent)' }}>தெளிவாக விளக்கப்பட்டன</span>
              </>
            ) : (
              <>
                Government Updates,<br />
                <span style={{ color: 'var(--color-accent)' }}>Clearly Explained</span>
              </>
            )}
          </h1>

          <p
            style={{
              fontSize: '1.0625rem',
              color: 'var(--color-text-muted)',
              maxWidth: 560,
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            {t('home.hero_subtitle')}
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} role="search" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="search-bar">
              <Search size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} aria-hidden="true" />
              <input
                id="hero-search"
                type="search"
                placeholder={t('home.search_placeholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t('home.search_placeholder')}
                autoComplete="off"
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                aria-label={t('home.search_button')}
              >
                {t('home.search_button')}
              </button>
            </div>
          </form>

          {/* Quick stats */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              marginTop: '2rem',
              flexWrap: 'wrap',
            }}
          >
            {[
              { icon: <CheckCircle2 size={14} />, label: 'Source-verified updates' },
              { icon: <Shield size={14} />, label: 'English & Tamil' },
              { icon: <Clock size={14} />, label: 'Regularly reviewed' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span style={{ color: 'var(--color-accent)' }}>{stat.icon}</span>
                {stat.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      {categories.length > 0 && (
        <section style={{ padding: '2.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
          <div className="container">
            <h2 className="section-title" style={{ marginBottom: '1.25rem' }}>
              {t('home.browse_categories')}
            </h2>
            <div className="grid-cards">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    padding: '1.125rem 1.25rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-bg)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'border-color 150ms ease, box-shadow 150ms ease',
                  }}
                  className="card-hover"
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      background: 'var(--color-accent-subtle)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-accent)',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    {categoryIcons[cat.slug] ?? <FileText size={22} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                      {lang === 'ta' ? cat.name_ta : cat.name_en}
                    </div>
                    {(lang === 'ta' ? cat.description_ta : cat.description_en) && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                        {lang === 'ta' ? cat.description_ta : cat.description_en}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--color-text-disabled)', flexShrink: 0 }} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Latest Updates + Deadlines ────────────────── */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '3rem',
            }}
          >
            {/* Latest Updates */}
            <div>
              <div className="section-header">
                <h2 className="section-title">{t('home.latest_updates')}</h2>
                <Link href="/updates" className="btn btn-secondary btn-sm">
                  {t('home.view_all')} <ArrowRight size={14} />
                </Link>
              </div>

              {updates.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FileText size={24} />
                  </div>
                  <p style={{ fontSize: '0.9rem', marginTop: 0 }}>
                    {t('home.no_updates')}
                  </p>
                </div>
              ) : (
                <div className="gap-stack" style={{ gap: '0.75rem' }}>
                  {updates.map((update) => (
                    <UpdateCard key={update.id} update={update} lang={lang} />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Deadlines */}
            {deadlines.length > 0 && (
              <div>
                <div className="section-header">
                  <h2 className="section-title">{t('home.upcoming_deadlines')}</h2>
                  <Link href="/deadlines" className="btn btn-secondary btn-sm">
                    {t('home.view_all')} <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="gap-stack" style={{ gap: '0.625rem' }}>
                  {deadlines.map((deadline) => {
                    const daysLeft = deadlineDaysRemaining(deadline.deadline_date)
                    const isUrgent = daysLeft !== null && daysLeft <= 7

                    return (
                      <div
                        key={deadline.id}
                        className="card card-sm"
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.875rem',
                          padding: '1rem 1.25rem',
                          borderLeft: isUrgent ? '3px solid var(--color-error)' : '3px solid var(--color-border)',
                        }}
                      >
                        <div
                          style={{
                            background: isUrgent ? 'var(--color-error-bg)' : 'var(--color-bg-muted)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                          aria-hidden="true"
                        >
                          <Calendar
                            size={16}
                            style={{ color: isUrgent ? 'var(--color-error)' : 'var(--color-text-muted)' }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                            {lang === 'ta' ? deadline.title_ta : deadline.title_en}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                            {deadline.deadline_date ? (
                              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                {formatDate(deadline.deadline_date)}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.8125rem', color: 'var(--color-warning)' }}>
                                {t('deadlines.unknown_date')}
                              </span>
                            )}
                            <DeadlineBadge status={deadline.status} />
                            {daysLeft !== null && daysLeft >= 0 && (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: isUrgent ? 'var(--color-error)' : 'var(--color-text-muted)',
                                }}
                              >
                                {isUrgent && <AlertCircle size={11} style={{ display: 'inline', marginRight: 3 }} />}
                                {t('deadlines.days_remaining', { n: daysLeft })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
