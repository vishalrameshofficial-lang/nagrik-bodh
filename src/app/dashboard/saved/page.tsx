import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, timeAgo } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Saved Updates — Dashboard',
}

export default async function SavedUpdatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: saved } = await supabase
    .from('saved_updates')
    .select(
      `
      id, saved_at,
      update:civic_updates(
        id, slug, status, effective_date, official_deadline, deadline_status,
        published_at, last_verified_at, is_demo,
        category:categories(id, slug, name_en, name_ta),
        translations:update_translations(lang, translation_status, title, short_summary)
      )
    `
    )
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Saved Updates</h1>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          Updates you've saved for quick reference.
        </p>

        {!saved || saved.length === 0 ? (
          <div className="empty-state">
            <p>You haven't saved any updates yet.</p>
            <Link href="/updates" className="btn btn-primary btn-sm">
              Browse Updates
            </Link>
          </div>
        ) : (
          <div className="gap-stack" style={{ gap: '0.75rem' }}>
            {saved.map((item: any) => {
              if (!item.update || item.update.status !== 'published') return null
              const enTrans = item.update.translations?.find((t: any) => t.lang === 'en')
              return (
                <div key={item.id} className="card card-hover" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      {item.update.category && (
                        <span className="badge badge-green" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                          {item.update.category.name_en}
                        </span>
                      )}
                      <h3 style={{ fontSize: '1rem', marginBottom: '0.375rem' }}>
                        <Link href={`/updates/${item.update.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {enTrans?.title}
                        </Link>
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                        {enTrans?.short_summary?.slice(0, 150)}
                        {(enTrans?.short_summary?.length ?? 0) > 150 ? '…' : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                    Saved {timeAgo(item.saved_at)}
                    {item.update.effective_date && ` · Effective ${formatDate(item.update.effective_date)}`}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
