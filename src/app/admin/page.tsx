import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Admin — Overview',
  robots: { index: false, follow: false },
}

export default async function AdminOverview() {
  const supabase = await createClient()

  // Counts for overview
  const [
    { count: drafts },
    { count: inReview },
    { count: published },
    { count: totalDeadlines },
  ] = await Promise.all([
    supabase.from('civic_updates').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('civic_updates').select('*', { count: 'exact', head: true }).eq('status', 'in_review'),
    supabase.from('civic_updates').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('deadlines').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Drafts', value: drafts ?? 0, color: 'var(--color-text-muted)' },
    { label: 'In Review', value: inReview ?? 0, color: 'var(--color-warning)' },
    { label: 'Published', value: published ?? 0, color: 'var(--color-accent)' },
    { label: 'Deadlines', value: totalDeadlines ?? 0, color: 'var(--color-info)' },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: '0.375rem' }}>Admin Overview</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Content management and editorial dashboard for Nagrik Bodh.
      </p>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: stat.color,
                lineHeight: 1,
                marginBottom: '0.375rem',
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 style={{ fontSize: '1.0625rem', marginBottom: '1rem' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a href="/admin/updates/new" className="btn btn-primary btn-sm">
            + New Update
          </a>
          <a href="/admin/review" className="btn btn-secondary btn-sm">
            Review Queue
          </a>
          <a href="/admin/deadlines" className="btn btn-secondary btn-sm">
            Manage Deadlines
          </a>
          <a href="/admin/audit" className="btn btn-secondary btn-sm">
            Audit Log
          </a>
        </div>
      </div>
    </div>
  )
}
