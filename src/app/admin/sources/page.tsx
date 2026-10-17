import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Link2, ExternalLink, ShieldCheck, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Admin — Sources Management',
  robots: { index: false, follow: false },
}

export default async function AdminSourcesPage() {
  const supabase = await createClient()

  const { data: sources } = await supabase
    .from('sources')
    .select(`
      id, url, title_en, issuing_authority, document_date, retrieved_at, is_primary, is_verified,
      update:civic_updates(
        id, slug, status,
        translations:update_translations(lang, title)
      ),
      verifier:profiles!sources_verified_by_fkey(display_name, email)
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Official Sources</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            Audit and verify source citations, issuing authorities, and official portals across civic updates.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Issuing Authority & Title</th>
                <th>Civic Update</th>
                <th>Type</th>
                <th>Verification</th>
                <th>Document Date</th>
                <th style={{ textAlign: 'right' }}>URL</th>
              </tr>
            </thead>
            <tbody>
              {sources && sources.length > 0 ? (
                sources.map((src: any) => {
                  const enTitle = src.update?.translations?.find((t: any) => t.lang === 'en')?.title
                  return (
                    <tr key={src.id}>
                      <td>
                        <strong>{src.issuing_authority ?? 'Authority Unspecified'}</strong>
                        {src.title_en && (
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                            {src.title_en}
                          </div>
                        )}
                      </td>
                      <td>
                        {src.update ? (
                          <div>
                            <Link
                              href={`/admin/updates/${src.update.id}/edit`}
                              style={{ color: 'var(--color-accent)', fontWeight: 500, fontSize: '0.875rem' }}
                            >
                              {enTitle ?? src.update.slug}
                            </Link>
                            <div>
                              <span className={`badge ${src.update.status === 'published' ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: '0.6875rem' }}>
                                {src.update.status}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">Unlinked</span>
                        )}
                      </td>
                      <td>
                        {src.is_primary ? (
                          <span className="badge badge-green">Primary</span>
                        ) : (
                          <span className="badge badge-neutral">Secondary</span>
                        )}
                      </td>
                      <td>
                        {src.is_verified ? (
                          <span className="badge badge-verified" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Check size={10} /> Verified
                          </span>
                        ) : (
                          <span className="badge badge-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertCircle size={10} /> Pending Verification
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        {src.document_date ? new Date(src.document_date).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <ExternalLink size={12} />
                          Visit
                        </a>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    No source records registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
