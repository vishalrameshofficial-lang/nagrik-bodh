'use client'

import { Globe } from 'lucide-react'
import { useI18n } from '@/i18n'

export function LanguageSelector() {
  const { lang, setLang, t } = useI18n()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <Globe size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} aria-hidden="true" />
      <select
        id="language-selector"
        value={lang}
        onChange={(e) => setLang(e.target.value as 'en' | 'ta')}
        aria-label="Select language"
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '4px',
          appearance: 'none',
          outline: 'none',
        }}
      >
        <option value="en">English</option>
        <option value="ta">தமிழ்</option>
      </select>
    </div>
  )
}
