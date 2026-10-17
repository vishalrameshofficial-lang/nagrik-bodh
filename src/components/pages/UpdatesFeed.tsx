'use client'

import React, { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'
import { useI18n } from '@/i18n'
import { UpdateCard } from '@/components/updates/UpdateCard'
import type { CivicUpdate, Category, Jurisdiction } from '@/types'
import type { SearchParamsInput } from '@/lib/validations'

interface UpdatesFeedProps {
  updates: CivicUpdate[]
  total: number
  params: SearchParamsInput
  categories: Category[]
  jurisdictions: Jurisdiction[]
}

export function UpdatesFeed({ updates, total, params, categories, jurisdictions }: UpdatesFeedProps) {
  const { t, lang } = useI18n()
  const router = useRouter()
  const searchParamsHook = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showFilters, setShowFilters] = useState(false)
  const [query, setQuery] = useState(params.q ?? '')

  const updateParam = (key: string, value: string | undefined) => {
    const current = new URLSearchParams(searchParamsHook.toString())
    if (value) {
      current.set(key, value)
    } else {
      current.delete(key)
    }
    current.set('page', '1')
    startTransition(() => {
      router.push(`/updates?${current.toString()}`)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam('q', query.trim() || undefined)
  }

  const clearFilters = () => {
    startTransition(() => {
      router.push('/updates')
    })
  }

  const hasFilters = !!(params.q || params.category || params.jurisdiction || params.deadlineStatus)
  const totalPages = Math.ceil(total / params.pageSize)

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Page header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ marginBottom: '0.25rem' }}>{t('nav.updates')}</h1>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            Verified government notifications, schemes and rule changes.
          </p>
        </div>

        {/* Search + filter row */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 240 }} role="search">
            <div className="search-bar" style={{ borderRadius: 'var(--radius-md)' }}>
              <Search size={16} style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
              <input
                id="updates-search"
                type="search"
                placeholder={t('home.search_placeholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t('home.search_placeholder')}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); updateParam('q', undefined) }}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0.25rem' }}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
              <button type="submit" className="btn btn-primary btn-sm">
                {t('home.search_button')}
              </button>
            </div>
          </form>

          <button
            className={`btn btn-secondary btn-sm`}
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="filters-panel"
          >
            <Filter size={14} /> {t('search.filters')}
            {hasFilters && (
              <span
                style={{
                  background: 'var(--color-accent)',
                  color: 'white',
                  borderRadius: 9999,
                  padding: '0 5px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                •
              </span>
            )}
          </button>

          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <X size={14} /> {t('search.clear_filters')}
            </button>
          )}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div
            id="filters-panel"
            className="card"
            style={{ marginBottom: '1.25rem', padding: '1.25rem' }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              {/* Category */}
              <div>
                <label className="label" htmlFor="filter-category">
                  {t('search.category_filter')}
                </label>
                <select
                  id="filter-category"
                  className="input"
                  value={params.category ?? ''}
                  onChange={(e) => updateParam('category', e.target.value || undefined)}
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {lang === 'ta' ? c.name_ta : c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jurisdiction */}
              <div>
                <label className="label" htmlFor="filter-jurisdiction">
                  {t('search.jurisdiction_filter')}
                </label>
                <select
                  id="filter-jurisdiction"
                  className="input"
                  value={params.jurisdiction ?? ''}
                  onChange={(e) => updateParam('jurisdiction', e.target.value || undefined)}
                >
                  <option value="">All jurisdictions</option>
                  {jurisdictions.map((j) => (
                    <option key={j.id} value={j.slug}>
                      {lang === 'ta' ? j.name_ta : j.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deadline status */}
              <div>
                <label className="label" htmlFor="filter-deadline-status">
                  Deadline Status
                </label>
                <select
                  id="filter-deadline-status"
                  className="input"
                  value={params.deadlineStatus ?? ''}
                  onChange={(e) => updateParam('deadlineStatus', e.target.value || undefined)}
                >
                  <option value="">Any</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="unconfirmed">Unconfirmed</option>
                  <option value="extended">Extended</option>
                  <option value="passed">Passed</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results summary */}
        {params.q && (
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            {t('search.results_for')} <strong>"{params.q}"</strong> —{' '}
            {total} result{total !== 1 ? 's' : ''}
          </div>
        )}

        {/* Loading indicator */}
        {isPending && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        )}

        {/* Updates list */}
        {!isPending && updates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={24} />
            </div>
            <p style={{ marginTop: 0 }}>{t('search.no_results')}</p>
            {hasFilters && (
              <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
                {t('search.clear_filters')}
              </button>
            )}
          </div>
        ) : (
          <div className="gap-stack" style={{ gap: '0.75rem' }}>
            {updates.map((update) => (
              <UpdateCard key={update.id} update={update} lang={lang} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="pagination" aria-label="Updates pagination">
            <button
              className="btn btn-secondary btn-sm"
              disabled={params.page <= 1}
              onClick={() => updateParam('page', String(params.page - 1))}
              aria-label="Previous page"
            >
              ← Previous
            </button>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', padding: '0 0.75rem' }}>
              Page {params.page} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={params.page >= totalPages}
              onClick={() => updateParam('page', String(params.page + 1))}
              aria-label="Next page"
            >
              Next →
            </button>
          </nav>
        )}
      </div>
    </div>
  )
}
