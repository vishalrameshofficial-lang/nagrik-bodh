import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Calendar, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Upcoming Deadlines',
  description: 'Government compliance deadlines, tax filing dates and civic action deadlines for Indian citizens.',
}

export default async function DeadlinesPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from('deadlines')
      .select('*, category:categories(name_en, name_ta), department:departments(name_en)')
      .gte('deadline_date', today)
      .order('deadline_date', { ascending: true }),
    supabase
      .from('deadlines')
      .select('*, category:categories(name_en, name_ta), department:departments(name_en)')
      .lt('deadline_date', today)
      .order('deadline_date', { ascending: false })
      .limit(10),
  ])

  const statusColor: Record<string, string> = {
    confirmed: 'badge-green',
    unconfirmed: 'badge-yellow',
    extended: 'badge-blue',
    passed: 'badge-grey',
    unknown: 'badge-grey',
  }

  return (
    <div style={{ padding: '2rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: 860 }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Deadlines</h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>
          Government compliance deadlines and civic action dates. Always verify with the official source before acting.
        </p>

        <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          Deadlines marked <strong>Unconfirmed</strong> or <strong>Unknown</strong> have not been independently verified from official sources.
          Do not rely on them for compliance decisions.
        </div>

        {/* Upcoming */}
        <div className="section-header">
          <h2 className="section-title">Upcoming Deadlines</h2>
        </div>
        {!upcoming || upcoming.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <Calendar size={32} style={{ marginBottom: '0.75rem', color: 'var(--color-text-disabled)' }} />
            <p>No upcoming deadlines recorded.</p>
          </div>
        ) : (
          <div className="gap-stack" style={{ gap: '0.625rem', marginBottom: '2.5rem' }}>
            {upcoming.map((d: any) => (
              <div key={d.id} className="card card-sm" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div
                  style={{
                    background: 'var(--color-bg-muted)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.625rem',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Calendar size={16} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{d.title_en}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {d.deadline_date ? (
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        {formatDate(d.deadline_date)}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-warning)' }}>Date not confirmed</span>
                    )}
                    <span className={`badge ${statusColor[d.status] ?? 'badge-grey'}`}>{d.status}</span>
                    {d.category && <span className="badge badge-grey">{d.category.name_en}</span>}
                  </div>
                  {d.description_en && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.375rem', marginBottom: 0 }}>
                      {d.description_en}
                    </p>
                  )}
                  {d.source_url && (
                    <a
                      href={d.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.8125rem', color: 'var(--color-accent)', marginTop: '0.375rem', display: 'inline-block' }}
                    >
                      Official Source ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past */}
        {past && past.length > 0 && (
          <>
            <div className="section-header">
              <h2 className="section-title" style={{ color: 'var(--color-text-muted)' }}>Past Deadlines</h2>
            </div>
            <div className="gap-stack" style={{ gap: '0.5rem' }}>
              {past.map((d: any) => (
                <div key={d.id} className="card card-sm" style={{ opacity: 0.7, display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span className="badge badge-grey">{d.status === 'passed' ? 'Passed' : d.status}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.title_en}</span>
                  {d.deadline_date && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                      {formatDate(d.deadline_date)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
