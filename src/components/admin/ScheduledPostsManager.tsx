'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, Send, Edit3, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils'

interface Props {
  scheduledUpdates: any[]
}

export function ScheduledPostsManager({ scheduledUpdates }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [publishing, setPublishing] = useState<string | null>(null)

  const handlePublishNow = async (id: string) => {
    setPublishing(id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('civic_updates')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          last_verified_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('id', id)

      if (error) throw error

      await supabase.from('audit_logs').insert({
        table_name: 'civic_updates',
        record_id: id,
        action: 'published',
        performed_by: user.id,
      })

      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to publish post')
    } finally {
      setPublishing(null)
    }
  }

  const handleUnschedule = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('civic_updates')
        .update({
          status: 'approved',
          scheduled_at: null,
          updated_by: user.id,
        })
        .eq('id', id)

      if (error) throw error
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to unschedule post')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Scheduled Content</h1>
        <p className="text-muted" style={{ margin: 0 }}>
          Approved civic updates queued for automatic release at a designated timestamp.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Title & Category</th>
                <th>Scheduled Release (IST)</th>
                <th>Jurisdiction / Department</th>
                <th>Reviewer</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scheduledUpdates && scheduledUpdates.length > 0 ? (
                scheduledUpdates.map((update) => {
                  const en = update.translations?.find((t: any) => t.lang === 'en')
                  return (
                    <tr key={update.id}>
                      <td>
                        <Link
                          href={`/admin/updates/${update.id}/edit`}
                          style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: '0.9375rem' }}
                        >
                          {en?.title ?? update.slug}
                        </Link>
                        {update.category && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                            {update.category.name_en}
                          </div>
                        )}
                      </td>
                      <td>
                        {update.scheduled_at ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem' }}>
                            <Clock size={14} style={{ color: 'var(--color-accent)' }} />
                            <div>
                              <div style={{ fontWeight: 500 }}>
                                {new Date(update.scheduled_at).toLocaleDateString()}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {new Date(update.scheduled_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">Not specified</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8125rem' }}>
                        <div>{update.jurisdiction?.name_en ?? 'All India'}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                          {update.department?.name_en ?? 'General'}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8125rem' }}>
                        {update.reviewer?.display_name ?? update.reviewer?.email ?? 'Staff'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handlePublishNow(update.id)}
                            disabled={publishing === update.id}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <Send size={12} />
                            Publish Now
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleUnschedule(update.id)}
                          >
                            Revert
                          </button>
                          <Link
                            href={`/admin/updates/${update.id}/edit`}
                            className="btn btn-secondary btn-sm"
                          >
                            <Edit3 size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
                    No content currently scheduled for future release.
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
