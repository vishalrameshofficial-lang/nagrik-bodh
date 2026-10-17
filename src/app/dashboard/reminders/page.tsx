import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Reminders — Dashboard',
}

export default async function RemindersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: reminders } = await supabase
    .from('notification_jobs')
    .select('*, update:civic_updates(slug, translations:update_translations(lang, title))')
    .eq('user_id', user.id)
    .order('scheduled_for', { ascending: true })

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Reminders</h1>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          Personal deadline and update reminders.
        </p>

        {/* Preferences */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.875rem' }}>Notification Preferences</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
            <div>
              <span className="text-muted">Email reminders:</span>{' '}
              <strong>{prefs?.email_reminders ? 'Enabled' : 'Disabled'}</strong>
            </div>
            <div>
              <span className="text-muted">Remind before deadline:</span>{' '}
              <strong>{(prefs?.reminder_days_before ?? [1, 7]).join(', ')} days</strong>
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', marginBottom: 0 }}>
            Email notification setup requires Resend API configuration. See <code>.env.example</code>.
          </p>
        </div>

        {/* Reminders list */}
        {!reminders || reminders.length === 0 ? (
          <div className="empty-state">
            <p>No reminders set yet. You can set reminders from deadline pages.</p>
            <Link href="/deadlines" className="btn btn-primary btn-sm">
              View Deadlines
            </Link>
          </div>
        ) : (
          <div className="gap-stack" style={{ gap: '0.625rem' }}>
            {reminders.map((r: any) => {
              const update = r.update
              const enTitle = update?.translations?.find((t: any) => t.lang === 'en')?.title
              return (
                <div key={r.id} className="card card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {enTitle ?? 'Reminder'}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Scheduled for {formatDate(r.scheduled_for, 'dd MMM yyyy HH:mm')}
                    </div>
                  </div>
                  <span className={`badge badge-${r.status === 'sent' ? 'green' : r.status === 'failed' ? 'red' : 'grey'}`}>
                    {r.status}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
