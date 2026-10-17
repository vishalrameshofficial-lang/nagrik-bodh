'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ExternalLink, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'
import type { Category, Department, Jurisdiction } from '@/types'

interface UpdateEditorProps {
  categories: Category[]
  departments: Department[]
  jurisdictions: Jurisdiction[]
  initialData?: any
}

type TranslationField = {
  title: string
  short_summary: string
  who_is_affected: string
  what_changed: string
  required_actions: string
  eligibility: string
  benefits: string
  required_documents: string
  translation_status: string
}

type SourceField = {
  url: string
  title_en: string
  issuing_authority: string
  document_date: string
  is_primary: boolean
}

const emptyTranslation = (): TranslationField => ({
  title: '',
  short_summary: '',
  who_is_affected: '',
  what_changed: '',
  required_actions: '',
  eligibility: '',
  benefits: '',
  required_documents: '',
  translation_status: 'pending',
})

const emptySource = (): SourceField => ({
  url: '',
  title_en: '',
  issuing_authority: '',
  document_date: '',
  is_primary: false,
})

export function UpdateEditor({ categories, departments, jurisdictions, initialData }: UpdateEditorProps) {
  const router = useRouter()
  const supabase = createClient()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? '')
  const [departmentId, setDepartmentId] = useState(initialData?.department_id ?? '')
  const [jurisdictionId, setJurisdictionId] = useState(initialData?.jurisdiction_id ?? '')
  const [effectiveDate, setEffectiveDate] = useState(initialData?.effective_date ?? '')
  const [officialDeadline, setOfficialDeadline] = useState(initialData?.official_deadline ?? '')
  const [deadlineStatus, setDeadlineStatus] = useState(initialData?.deadline_status ?? 'unknown')
  const [sourceDocDate, setSourceDocDate] = useState(initialData?.source_doc_date ?? '')
  const [isDemo, setIsDemo] = useState(initialData?.is_demo ?? false)

  const [en, setEn] = useState<TranslationField>(
    initialData?.translations?.find((t: any) => t.lang === 'en') ?? emptyTranslation()
  )
  const [ta, setTa] = useState<TranslationField>(
    initialData?.translations?.find((t: any) => t.lang === 'ta') ?? emptyTranslation()
  )
  const [sources, setSources] = useState<SourceField[]>(
    initialData?.sources?.length ? initialData.sources : [emptySource()]
  )

  const updateSource = (i: number, field: keyof SourceField, value: any) => {
    setSources((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)))
  }

  const handleSave = async (submitForReview = false) => {
    setError('')
    setSuccess('')

    if (!categoryId) { setError('Please select a category.'); return }
    if (!en.title || !en.short_summary) { setError('English title and summary are required.'); return }
    if (sources.some((s) => !s.url)) { setError('All sources must have a URL.'); return }

    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be logged in.'); setSaving(false); return }

    const slug = initialData?.slug ?? generateSlug(en.title) + '-' + Date.now()

    // Upsert the update
    const updatePayload = {
      slug,
      category_id: categoryId || null,
      department_id: departmentId || null,
      jurisdiction_id: jurisdictionId || null,
      effective_date: effectiveDate || null,
      official_deadline: officialDeadline || null,
      deadline_status: deadlineStatus,
      source_doc_date: sourceDocDate || null,
      is_demo: isDemo,
      created_by: user.id,
      updated_by: user.id,
      status: submitForReview ? 'in_review' : 'draft',
      submitted_by: submitForReview ? user.id : undefined,
      submitted_at: submitForReview ? new Date().toISOString() : undefined,
    }

    let updateId = initialData?.id

    if (updateId) {
      const { error: updateErr } = await supabase
        .from('civic_updates')
        .update(updatePayload)
        .eq('id', updateId)
      if (updateErr) { setError(updateErr.message); setSaving(false); return }
    } else {
      const { data: newUpdate, error: insertErr } = await supabase
        .from('civic_updates')
        .insert(updatePayload)
        .select('id')
        .single()
      if (insertErr || !newUpdate) { setError(insertErr?.message ?? 'Failed to create update.'); setSaving(false); return }
      updateId = newUpdate.id
    }

    // Upsert translations
    for (const [lang, fields] of [['en', en], ['ta', ta]] as const) {
      if (!fields.title && !fields.short_summary) continue
      await supabase.from('update_translations').upsert(
        {
          update_id: updateId,
          lang,
          ...fields,
          created_by: user.id,
          updated_by: user.id,
        },
        { onConflict: 'update_id,lang' }
      )
    }

    // Replace sources
    await supabase.from('sources').delete().eq('update_id', updateId)
    const validSources = sources.filter((s) => s.url)
    if (validSources.length > 0) {
      await supabase.from('sources').insert(
        validSources.map((s, i) => ({
          update_id: updateId,
          ...s,
          is_primary: i === 0 || s.is_primary,
          created_by: user.id,
        }))
      )
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      table_name: 'civic_updates',
      record_id: updateId,
      action: submitForReview ? 'submitted_for_review' : initialData ? 'updated' : 'created',
      performed_by: user.id,
    })

    setSaving(false)
    setSuccess(submitForReview ? 'Submitted for review!' : 'Saved as draft.')
    if (!initialData) {
      router.push(`/admin/updates/${updateId}/edit`)
    }
  }

  const TabPanel = ({ lang: l, value, onChange }: { lang: 'en' | 'ta'; value: TranslationField; onChange: (v: TranslationField) => void }) => {
    const fields: Array<{ key: keyof TranslationField; label: string; rows: number }> = [
      { key: 'title', label: l === 'en' ? 'Title (English)' : 'Title (Tamil)', rows: 2 },
      { key: 'short_summary', label: 'Short Summary', rows: 4 },
      { key: 'who_is_affected', label: 'Who is Affected', rows: 3 },
      { key: 'what_changed', label: 'What Changed', rows: 4 },
      { key: 'required_actions', label: 'Required Actions', rows: 4 },
      { key: 'eligibility', label: 'Eligibility', rows: 3 },
      { key: 'benefits', label: 'Benefits', rows: 3 },
      { key: 'required_documents', label: 'Required Documents', rows: 3 },
    ]

    return (
      <div lang={l} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {l === 'ta' && (
          <div className="alert alert-info">
            <AlertCircle size={16} />
            Tamil translations must be human-reviewed before publication. Set the translation status below accordingly.
          </div>
        )}
        {fields.map(({ key, label, rows }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <textarea
              className="input"
              style={{ minHeight: rows * 28, resize: 'vertical', fontFamily: l === 'ta' ? 'Noto Sans Tamil, sans-serif' : 'inherit' }}
              value={value[key] as string}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              rows={rows}
            />
          </div>
        ))}
        {l === 'ta' && (
          <div>
            <label className="label">Translation Review Status</label>
            <select
              className="input"
              value={value.translation_status}
              onChange={(e) => onChange({ ...value, translation_status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="machine_draft">Machine Draft — Not Verified</option>
              <option value="human_reviewed">Human Reviewed</option>
              <option value="verified">Verified</option>
            </select>
          </div>
        )}
      </div>
    )
  }

  const [activeTab, setActiveTab] = useState<'en' | 'ta' | 'meta' | 'sources'>('en')

  return (
    <div>
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {/* Tab navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '1.5rem',
        }}
        role="tablist"
      >
        {(['en', 'ta', 'meta', 'sources'] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.625rem 1.125rem',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-text-muted)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
            }}
          >
            {tab === 'en' ? 'English' : tab === 'ta' ? 'Tamil' : tab === 'meta' ? 'Metadata' : 'Sources'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card">
        {activeTab === 'en' && <TabPanel lang="en" value={en} onChange={setEn} />}
        {activeTab === 'ta' && <TabPanel lang="ta" value={ta} onChange={setTa} />}

        {activeTab === 'meta' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="label">Category *</label>
              <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <select className="input" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">Not specified</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name_en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Jurisdiction</label>
              <select className="input" value={jurisdictionId} onChange={(e) => setJurisdictionId(e.target.value)}>
                <option value="">Not specified</option>
                {jurisdictions.map((j) => (
                  <option key={j.id} value={j.id}>{j.name_en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Effective Date</label>
              <input type="date" className="input" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Official Deadline</label>
              <input type="date" className="input" value={officialDeadline} onChange={(e) => setOfficialDeadline(e.target.value)} />
            </div>
            <div>
              <label className="label">Deadline Status</label>
              <select className="input" value={deadlineStatus} onChange={(e) => setDeadlineStatus(e.target.value)}>
                <option value="unknown">Unknown — do not present a date</option>
                <option value="unconfirmed">Unconfirmed</option>
                <option value="confirmed">Confirmed</option>
                <option value="extended">Extended</option>
                <option value="passed">Passed</option>
              </select>
            </div>
            <div>
              <label className="label">Source Document Date</label>
              <input type="date" className="input" value={sourceDocDate} onChange={(e) => setSourceDocDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', paddingTop: '1.5rem' }}>
              <input
                type="checkbox"
                id="is-demo"
                checked={isDemo}
                onChange={(e) => setIsDemo(e.target.checked)}
              />
              <label htmlFor="is-demo" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                Mark as demonstration record
              </label>
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              At least one official source URL is required. The first source is treated as the primary source.
              Only link to the original issuing authority's publication where possible.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {sources.map((src, i) => (
                <div
                  key={i}
                  style={{
                    padding: '1.25rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-subtle)',
                    position: 'relative',
                  }}
                >
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => setSources((prev) => prev.filter((_, idx) => idx !== i))}
                      className="btn btn-ghost btn-sm"
                      style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: 'var(--color-error)' }}
                      aria-label="Remove source"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.875rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="label">Source URL * {i === 0 && <span className="badge badge-green" style={{ marginLeft: 6 }}>Primary</span>}</label>
                      <input
                        type="url"
                        className="input"
                        placeholder="https://…"
                        value={src.url}
                        onChange={(e) => updateSource(i, 'url', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Source Title (English)</label>
                      <input
                        type="text"
                        className="input"
                        value={src.title_en}
                        onChange={(e) => updateSource(i, 'title_en', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Issuing Authority</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Ministry of Finance"
                        value={src.issuing_authority}
                        onChange={(e) => updateSource(i, 'issuing_authority', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Document Date</label>
                      <input
                        type="date"
                        className="input"
                        value={src.document_date}
                        onChange={(e) => updateSource(i, 'document_date', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '1rem' }}
              onClick={() => setSources((prev) => [...prev, emptySource()])}
            >
              <Plus size={14} /> Add Source
            </button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className="btn btn-secondary"
          onClick={() => handleSave(false)}
          disabled={saving}
          id="save-draft-btn"
        >
          {saving ? 'Saving…' : 'Save Draft'}
        </button>
        <button
          className="btn btn-primary"
          onClick={() => handleSave(true)}
          disabled={saving}
          id="submit-review-btn"
        >
          {saving ? 'Submitting…' : 'Submit for Review'}
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => router.push('/admin/updates')}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
