'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, AlertTriangle, ExternalLink, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils'

interface ReviewQueueProps {
  updates: any[]
}

export function ReviewQueue({ updates }: ReviewQueueProps) {
  const router = useRouter()
  const supabase = createClient()
  const [processing, setProcessing] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  const processAction = async (
    updateId: string,
    action: 'approved' | 'rejected' | 'published' | 'withdrawn',
    note?: string
  ) => {
    setProcessing(updateId)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setProcessing(null); return }

    const statusMap = {
      approved: 'approved',
      rejected: 'rejected',
      published: 'published',
      withdrawn: 'withdrawn',
    } as const

    const updatePayload: Record<string, any> = {
      status: statusMap[action],
      updated_by: user.id,
    }

    if (action === 'approved' || action === 'rejected') {
      updatePayload.reviewed_by = user.id
      updatePayload.reviewed_at = new Date().toISOString()
    }
    if (action === 'published') {
      updatePayload.published_at = new Date().toISOString()
      updatePayload.last_verified_at = new Date().toISOString()
    }

    await supabase.from('civic_updates').update(updatePayload).eq('id', updateId)

    // Log review action
    await supabase.from('content_reviews').insert({
      update_id: updateId,
      reviewer_id: user.id,
      action,
      notes: note ?? null,
    })

    await supabase.from('audit_logs').insert({
      table_name: 'civic_updates',
      record_id: updateId,
      action,
      performed_by: user.id,
    })

    setProcessing(null)
    router.refresh()
  }

  if (updates.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <CheckCircle2 size={24} />
        </div>
        <p>Review queue is empty. All caught up!</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {updates.map((update: any) => {
        const enTrans = update.translations?.find((t: any) => t.lang === 'en')
        const taTrans = update.translations?.find((t: any) => t.lang === 'ta')
        const hasVerifiedSource = update.sources?.some((s: any) => s.is_verified)
        const missingTamil = !taTrans?.title

        return (
          <div key={update.id} className="card">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span className="badge badge-yellow">In Review</span>
                  {update.category && <span className="badge badge-grey">{update.category.name_en}</span>}
                  {update.is_demo && <span className="badge badge-orange">Demo</span>}
                  {missingTamil && (
                    <span className="badge badge-red">
                      <AlertTriangle size={10} /> No Tamil translation
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.0625rem', marginBottom: '0.25rem' }}>
                  {enTrans?.title ?? '(No English title)'}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  {enTrans?.short_summary?.slice(0, 180)}
                  {(enTrans?.short_summary?.length ?? 0) > 180 ? '…' : ''}
                </p>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', flexShrink: 0, textAlign: 'right' }}>
                <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                Submitted {timeAgo(update.submitted_at)}
              </div>
            </div>

            {/* Checks */}
            <div
              style={{
                padding: '0.875rem',
                background: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
                display: 'flex',
                gap: '1.25rem',
                flexWrap: 'wrap',
              }}
            >
              <CheckItem ok={!!enTrans?.title} label="English title" />
              <CheckItem ok={!!enTrans?.short_summary} label="English summary" />
              <CheckItem ok={!missingTamil} label="Tamil translation" />
              <CheckItem ok={taTrans?.translation_status === 'verified' || taTrans?.translation_status === 'human_reviewed'} label="Tamil reviewed" />
              <CheckItem ok={(update.sources?.length ?? 0) > 0} label="Source linked" />
            </div>

            {/* Sources */}
            {update.sources?.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-muted)' }}>
                  Sources
                </div>
                {update.sources.map((src: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {src.url.slice(0, 60)}{src.url.length > 60 ? '…' : ''}
                      <ExternalLink size={11} />
                    </a>
                    {src.is_primary && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Primary</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Review notes */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="label" htmlFor={`notes-${update.id}`}>Review Notes</label>
              <textarea
                id={`notes-${update.id}`}
                className="input"
                rows={2}
                placeholder="Optional notes for the editor…"
                value={notes[update.id] ?? ''}
                onChange={(e) => setNotes((prev) => ({ ...prev, [update.id]: e.target.value }))}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              <Link
                href={`/admin/updates/${update.id}/edit`}
                className="btn btn-secondary btn-sm"
              >
                View/Edit
              </Link>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => processAction(update.id, 'approved', notes[update.id])}
                disabled={processing === update.id}
              >
                <CheckCircle2 size={14} /> Approve
              </button>
              {update.status === 'approved' && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => processAction(update.id, 'published', notes[update.id])}
                  disabled={processing === update.id}
                  style={{ background: 'var(--color-navy)' }}
                >
                  Publish Now
                </button>
              )}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => processAction(update.id, 'rejected', notes[update.id])}
                disabled={processing === update.id}
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
      {ok ? (
        <CheckCircle2 size={14} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
      ) : (
        <AlertTriangle size={14} style={{ color: 'var(--color-error)' }} aria-hidden="true" />
      )}
      <span style={{ color: ok ? 'var(--color-text-secondary)' : 'var(--color-error)' }}>{label}</span>
    </div>
  )
}
