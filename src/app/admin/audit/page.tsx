import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDate, timeAgo } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Admin — Audit Log',
  robots: { index: false, follow: false },
}

export default async function AuditPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*, performer:profiles!audit_logs_performed_by_fkey(display_name, email)')
    .order('created_at', { ascending: false })
    .limit(100)

  const actionColors: Record<string, string> = {
    created: 'badge-blue',
    updated: 'badge-grey',
    submitted_for_review: 'badge-yellow',
    approved: 'badge-green',
    rejected: 'badge-red',
    published: 'badge-green',
    withdrawn: 'badge-orange',
    superseded: 'badge-grey',
    corrected: 'badge-yellow',
    deleted: 'badge-red',
  }

  return (
    <div>
      <h1 style={{ marginBottom: '0.375rem' }}>Audit Log</h1>
      <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
        Complete history of all content actions. Read-only.
      </p>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Table</th>
              <th>Record ID</th>
              <th>Performed by</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((log: any) => (
              <tr key={log.id}>
                <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }} title={formatDate(log.created_at, 'dd MMM yyyy HH:mm')}>
                  {timeAgo(log.created_at)}
                </td>
                <td>
                  <span className={`badge ${actionColors[log.action] ?? 'badge-grey'}`}>
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </td>
                <td style={{ fontSize: '0.8125rem' }}>{log.table_name}</td>
                <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                  {log.record_id?.slice(0, 8)}…
                </td>
                <td style={{ fontSize: '0.8125rem' }}>
                  {log.performer?.display_name ?? log.performer?.email ?? 'System'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
