import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate, timeAgo, statusLabel } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Admin — Content',
  robots: { index: false, follow: false },
}

export default async function AdminUpdates() {
  const supabase = await createClient()

  const { data: updates } = await supabase
    .from('civic_updates')
    .select(
      `
      id, slug, status, is_demo, created_at, updated_at, published_at, submitted_at,
      category:categories(name_en),
      translations:update_translations(lang, title)
    `
    )
    .order('updated_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Content Management</h1>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            All civic updates — drafts, in review, published and archived.
          </p>
        </div>
        <Link href="/admin/updates/new" className="btn btn-primary btn-sm">
          + New Update
        </Link>
      </div>

      {!updates || updates.length === 0 ? (
        <div className="empty-state">
          <p>No updates yet. Create your first civic update.</p>
          <Link href="/admin/updates/new" className="btn btn-primary btn-sm">
            + New Update
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title (EN)</th>
                <th>Category</th>
                <th>Status</th>
                <th>Translations</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {updates.map((update: any) => {
                const enTranslation = update.translations?.find((t: any) => t.lang === 'en')
                const hasTamil = update.translations?.some((t: any) => t.lang === 'ta')

                return (
                  <tr key={update.id}>
                    <td style={{ maxWidth: 320 }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {enTranslation?.title ?? '(No English translation)'}
                      </div>
                      {update.is_demo && (
                        <span className="badge badge-orange" style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>
                          Demo
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>
                      {(update.category as any)?.name_en ?? '—'}
                    </td>
                    <td>
                      <span
                        className={`badge badge-${
                          update.status === 'published' ? 'green' :
                          update.status === 'in_review' ? 'yellow' :
                          update.status === 'approved' ? 'blue' :
                          update.status === 'rejected' ? 'red' :
                          update.status === 'withdrawn' ? 'orange' : 'grey'
                        }`}
                      >
                        {statusLabel(update.status)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <span className="badge badge-green" title="English">EN</span>
                        {hasTamil ? (
                          <span className="badge badge-blue" title="Tamil">தமிழ்</span>
                        ) : (
                          <span className="badge badge-grey" title="Tamil missing">தமிழ் ✗</span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {timeAgo(update.updated_at)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <Link
                          href={`/admin/updates/${update.id}/edit`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                        >
                          Edit
                        </Link>
                        {update.status === 'published' && (
                          <Link
                            href={`/updates/${update.slug}`}
                            target="_blank"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                          >
                            View ↗
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
