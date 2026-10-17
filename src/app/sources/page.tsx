import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ExternalLink, ShieldCheck, Landmark, Globe } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Official Sources Directory',
  description: 'Verified government portals, ministries, and primary publication authorities used by Nagrik Bodh.',
}

export default async function SourcesPage() {
  const supabase = await createClient()

  // Fetch departments and active sources
  const [{ data: departments }, { data: sources }] = await Promise.all([
    supabase
      .from('departments')
      .select('id, slug, name_en, name_ta, ministry_en, website_url, is_central')
      .eq('is_active', true)
      .order('name_en'),
    supabase
      .from('sources')
      .select(`
        id, url, title_en, issuing_authority, document_date, retrieved_at, is_primary, is_verified,
        update:civic_updates(
          id, slug,
          translations:update_translations(title, lang)
        )
      `)
      .eq('is_verified', true)
      .order('retrieved_at', { ascending: false })
      .limit(30),
  ])

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        <div style={{ maxWidth: 760, marginBottom: '2.5rem' }}>
          <h1 style={{ marginBottom: '0.75rem' }}>Official Sources Directory</h1>
          <p className="text-muted" style={{ fontSize: '1.0625rem', lineHeight: 1.6 }}>
            Every explanation on Nagrik Bodh is backed by primary official documentation. We cite original government
            notifications, circulars, and departmental portals so you can independently verify every fact.
          </p>
        </div>

        {/* Verification Standards Callout */}
        <div className="card" style={{ marginBottom: '3rem', borderLeft: '4px solid var(--color-accent)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <ShieldCheck size={28} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.375rem', fontWeight: 600 }}>
                Our Verification & Sourcing Standards
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                We prioritize primary notifications directly from the issuing ministry or department. We record the source
                URL, publication date, and timestamp of retrieval. If a secondary news report is referenced for context,
                it is clearly distinguished from official gazettes and statutory rules.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Departments & Portals */}
        <section style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.375rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Landmark size={20} style={{ color: 'var(--color-accent)' }} />
            Key Government Departments & Ministries
          </h2>

          <div className="grid grid-2" style={{ gap: '1rem' }}>
            {departments && departments.length > 0 ? (
              departments.map((dept) => (
                <div key={dept.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{dept.name_en}</h4>
                      {dept.name_ta && (
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          {dept.name_ta}
                        </p>
                      )}
                      {dept.ministry_en && dept.ministry_en !== dept.name_en && (
                        <span className="badge badge-neutral" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                          {dept.ministry_en}
                        </span>
                      )}
                    </div>
                    {dept.website_url ? (
                      <a
                        href={dept.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                      >
                        <Globe size={14} />
                        Portal
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="badge badge-neutral">Official Dept</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">No department records found.</p>
            )}
          </div>
        </section>

        {/* Recently Cited Sources */}
        <section>
          <h2 style={{ fontSize: '1.375rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={20} style={{ color: 'var(--color-accent)' }} />
            Verified Citations in Published Updates
          </h2>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container">
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Issuing Authority / Title</th>
                    <th>Associated Civic Update</th>
                    <th>Document Date</th>
                    <th>Verification</th>
                    <th style={{ textAlign: 'right' }}>Official Link</th>
                  </tr>
                </thead>
                <tbody>
                  {sources && sources.length > 0 ? (
                    sources.map((src: any) => {
                      const enTitle = src.update?.translations?.find((t: any) => t.lang === 'en')?.title
                      return (
                        <tr key={src.id}>
                          <td>
                            <strong>{src.issuing_authority ?? 'Government Authority'}</strong>
                            {src.title_en && (
                              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                                {src.title_en}
                              </div>
                            )}
                          </td>
                          <td>
                            {src.update ? (
                              <Link
                                href={`/updates/${src.update.slug}`}
                                style={{ color: 'var(--color-accent)', fontWeight: 500, fontSize: '0.875rem' }}
                              >
                                {enTitle ?? src.update.slug}
                              </Link>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                            {src.document_date ? new Date(src.document_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td>
                            <span className="badge badge-verified" style={{ fontSize: '0.75rem' }}>
                              Primary Verified
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                            >
                              View Source
                              <ExternalLink size={12} />
                            </a>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                        No sources currently recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
