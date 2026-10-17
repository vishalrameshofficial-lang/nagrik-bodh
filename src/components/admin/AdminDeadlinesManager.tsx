'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Plus, CheckCircle2, Clock, AlertTriangle, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Deadline, DeadlineStatus } from '@/types'

interface Props {
  deadlines: (Deadline & { category?: any; department?: any })[]
  categories: any[]
  departments: any[]
}

export function AdminDeadlinesManager({ deadlines, categories, departments }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title_en: '',
    title_ta: '',
    description_en: '',
    deadline_date: '',
    deadline_time: '23:59',
    status: 'unconfirmed' as DeadlineStatus,
    category_id: categories[0]?.id || '',
    department_id: departments[0]?.id || '',
    source_url: '',
    notes: '',
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('deadlines').insert({
        title_en: formData.title_en,
        title_ta: formData.title_ta || formData.title_en,
        description_en: formData.description_en || null,
        deadline_date: formData.deadline_date || null,
        deadline_time: formData.deadline_time || null,
        status: formData.status,
        category_id: formData.category_id || null,
        department_id: formData.department_id || null,
        source_url: formData.source_url || null,
        notes: formData.notes || null,
        created_by: user.id,
      })

      if (error) throw error

      setShowModal(false)
      setFormData({
        title_en: '',
        title_ta: '',
        description_en: '',
        deadline_date: '',
        deadline_time: '23:59',
        status: 'unconfirmed',
        category_id: categories[0]?.id || '',
        department_id: departments[0]?.id || '',
        source_url: '',
        notes: '',
      })
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to save deadline')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: DeadlineStatus) => {
    const { error } = await supabase
      .from('deadlines')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      alert(error.message)
    } else {
      router.refresh()
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Deadlines Management</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            Track compliance cut-offs, scheme enrolment windows, and statutory deadlines with strict verification.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Deadline
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Title (English & Tamil)</th>
                <th>Due Date & Time</th>
                <th>Status</th>
                <th>Category / Department</th>
                <th>Source URL</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deadlines && deadlines.length > 0 ? (
                deadlines.map((dl) => (
                  <tr key={dl.id}>
                    <td>
                      <strong>{dl.title_en}</strong>
                      {dl.title_ta && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{dl.title_ta}</div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>
                      {dl.deadline_date ? (
                        <>
                          <div style={{ fontWeight: 600 }}>{new Date(dl.deadline_date).toLocaleDateString()}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {dl.deadline_time ?? '23:59'} (IST)
                          </div>
                        </>
                      ) : (
                        <span className="text-muted">Unspecified</span>
                      )}
                    </td>
                    <td>
                      <select
                        className="input"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                        value={dl.status}
                        onChange={(e) => handleStatusChange(dl.id, e.target.value as DeadlineStatus)}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="unconfirmed">Unconfirmed</option>
                        <option value="extended">Extended</option>
                        <option value="passed">Passed</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {dl.category && <div>{dl.category.name_en}</div>}
                      {dl.department && (
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                          {dl.department.name_en}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {dl.source_url ? (
                        <a
                          href={dl.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                        >
                          Official Link <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                        ID: {dl.id.slice(0, 8)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    No deadlines currently created. Click &quot;New Deadline&quot; to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for creating a deadline */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Create Official Deadline</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '0.875rem' }}>
                <label className="label">Title (English) *</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. Income Tax Return Filing AY 2024-25"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '0.875rem' }}>
                <label className="label">Title (Tamil)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. வருமான வரி கணக்கு தாக்கல்"
                  value={formData.title_ta}
                  onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })}
                />
              </div>

              <div className="grid grid-2" style={{ gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div>
                  <label className="label">Deadline Date</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.deadline_date}
                    onChange={(e) => setFormData({ ...formData, deadline_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Deadline Status *</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DeadlineStatus })}
                  >
                    <option value="unconfirmed">Unconfirmed (Speculative/Pending)</option>
                    <option value="confirmed">Confirmed (Officially Notified)</option>
                    <option value="extended">Extended</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-2" style={{ gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div>
                  <label className="label">Category</label>
                  <select
                    className="input"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="">Select category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name_en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Department</label>
                  <select
                    className="input"
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  >
                    <option value="">Select department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name_en}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '0.875rem' }}>
                <label className="label">Official Source URL</label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://incometax.gov.in/..."
                  value={formData.source_url}
                  onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label">Verification Notes</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Official notification reference, gazette number..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Create Deadline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
