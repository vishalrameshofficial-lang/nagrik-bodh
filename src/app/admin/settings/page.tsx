import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Settings, Shield, Server, Mail, Database, AlertTriangle, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin — Platform Settings',
  robots: { index: false, follow: false },
}

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  // Fetch admin and staff users
  const { data: staffUsers } = await supabase
    .from('profiles')
    .select('id, email, display_name, role, created_at')
    .in('role', ['admin', 'reviewer', 'editor'])
    .order('role')

  // Check counts
  const [{ count: totalUpdates }, { count: totalDemoUpdates }] = await Promise.all([
    supabase.from('civic_updates').select('*', { count: 'exact', head: true }),
    supabase.from('civic_updates').select('*', { count: 'exact', head: true }).eq('is_demo', true),
  ])

  const envStatus = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    resendApiKey: !!process.env.RESEND_API_KEY,
    cronSecret: !!process.env.CRON_SECRET,
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Platform Settings & Configuration</h1>
        <p className="text-muted" style={{ margin: 0 }}>
          Manage administrative permissions, inspect external integrations, and check system health.
        </p>
      </div>

      {/* Production Demo Warning */}
      {(totalDemoUpdates ?? 0) > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <AlertTriangle size={18} />
            <strong>Demo Content Notice:</strong>
          </div>
          <div>
            There are currently <strong>{totalDemoUpdates}</strong> demonstration records in the database.
            All demo records are clearly labelled with <code>[DEMO]</code> and <code>is_demo = TRUE</code>.
            Before opening the platform for public nationwide use, ensure all demonstration content is replaced
            with manually verified official notifications.
          </div>
        </div>
      )}

      {/* System & Integrations Status */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Server size={18} style={{ color: 'var(--color-accent)' }} />
          Service Integrations & Environment
        </h2>

        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <Database size={20} style={{ color: 'var(--color-accent)' }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>Supabase PostgreSQL & Auth</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Core Database & RLS</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>URL Configured:</span>
                <span className={envStatus.supabaseUrl ? 'text-accent font-medium' : 'text-danger'}>
                  {envStatus.supabaseUrl ? '✓ Active' : '✗ Missing'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Anon Key:</span>
                <span className={envStatus.supabaseAnonKey ? 'text-accent font-medium' : 'text-danger'}>
                  {envStatus.supabaseAnonKey ? '✓ Active' : '✗ Missing'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Service Role Key (Server):</span>
                <span className={envStatus.supabaseServiceRole ? 'text-accent font-medium' : 'text-muted'}>
                  {envStatus.supabaseServiceRole ? '✓ Configured' : 'Not set (Optional for dev)'}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <Mail size={20} style={{ color: 'var(--color-accent)' }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>Transactional Email (Resend)</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Citizen Deadline Reminders</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>API Key:</span>
                <span className={envStatus.resendApiKey ? 'text-accent font-medium' : 'text-muted'}>
                  {envStatus.resendApiKey ? '✓ Configured' : 'Disclosed: Not configured'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Scheduled Cron Secret:</span>
                <span className={envStatus.cronSecret ? 'text-accent font-medium' : 'text-muted'}>
                  {envStatus.cronSecret ? '✓ Set' : 'Default / None'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                Reminder jobs are persisted in <code>notification_jobs</code> table and dispatched when keys are provided.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Staff & Access Control Directory */}
      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} style={{ color: 'var(--color-accent)' }} />
          Administrative Team & Roles
        </h2>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>User / Display Name</th>
                  <th>Email</th>
                  <th>Assigned Role</th>
                  <th>Permission Level</th>
                  <th style={{ textAlign: 'right' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {staffUsers && staffUsers.length > 0 ? (
                  staffUsers.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>
                        {u.display_name ?? 'Staff User'}
                      </td>
                      <td style={{ fontSize: '0.875rem' }}>{u.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === 'admin'
                              ? 'badge-red'
                              : u.role === 'reviewer'
                              ? 'badge-green'
                              : 'badge-yellow'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        {u.role === 'admin'
                          ? 'Full platform management & user roles'
                          : u.role === 'reviewer'
                          ? 'Review queue approval & rejection'
                          : 'Draft creation & translation editing'}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                      No staff users found. Run <code>supabase/bootstrap-admin.sql</code> to promote an account.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
