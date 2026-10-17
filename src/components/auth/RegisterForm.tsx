'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useI18n } from '@/i18n'
import { createClient } from '@/lib/supabase/client'
import { RegisterSchema } from '@/lib/validations'

export function RegisterForm() {
  const { t } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setServerError('')

    const result = RegisterSchema.safeParse({ email, password, display_name: displayName })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((i) => {
        fieldErrors[i.path[0] as string] = i.message
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const isPlaceholder =
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

      if (isPlaceholder) {
        setLoading(false)
        setServerError(
          'Supabase project not connected: Please configure your actual NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable real account registration.'
        )
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/`,
        },
      })
      setLoading(false)

      if (error) {
        setServerError(error.message)
        return
      }

      setSuccess(true)
    } catch (err: any) {
      setLoading(false)
      if (err?.message?.includes('fetch') || err?.name === 'TypeError') {
        setServerError(
          'Connection Error (Failed to fetch): The application cannot reach your Supabase backend. Please check NEXT_PUBLIC_SUPABASE_URL in .env.local.'
        )
      } else {
        setServerError(err?.message || 'An unexpected registration error occurred.')
      }
    }
  }

  if (success) {
    return (
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: 'var(--color-accent-light)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: 'var(--color-accent)',
            }}
            aria-hidden="true"
          >
            ✓
          </div>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Check your email</h1>
          <p className="text-muted" style={{ marginBottom: '1.25rem' }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
            {t('nav.login')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div className="card">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: 'var(--color-accent)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.25rem',
              margin: '0 auto 1rem',
            }}
            aria-hidden="true"
          >
            न
          </div>
          <h1 style={{ fontSize: '1.375rem', marginBottom: '0.25rem' }}>{t('auth.register_title')}</h1>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 0 }}>
            Save updates, set deadline reminders
          </p>
        </div>

        {(!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')) && !serverError && (
          <div className="alert alert-warning" style={{ marginBottom: '1.25rem', fontSize: '0.8125rem', lineHeight: 1.5 }}>
            <strong>Backend Configuration Needed:</strong> To enable real account creation, please set your Supabase project URL and anon key in <code>.env.local</code>.
          </div>
        )}

        {serverError && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div style={{ marginBottom: '1.125rem' }}>
            <label className="label" htmlFor="reg-name">{t('auth.display_name')}</label>
            <input
              id="reg-name"
              type="text"
              className={`input ${errors.display_name ? 'input-error' : ''}`}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              required
              aria-describedby={errors.display_name ? 'reg-name-error' : undefined}
            />
            {errors.display_name && (
              <p id="reg-name-error" className="field-error">{errors.display_name}</p>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '1.125rem' }}>
            <label className="label" htmlFor="reg-email">{t('auth.email')}</label>
            <input
              id="reg-email"
              type="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              aria-describedby={errors.email ? 'reg-email-error' : undefined}
            />
            {errors.email && (
              <p id="reg-email-error" className="field-error">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label" htmlFor="reg-password">{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                className={`input ${errors.password ? 'input-error' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                style={{ paddingRight: '2.75rem' }}
                aria-describedby={errors.password ? 'reg-password-error' : 'reg-password-hint'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0,
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password ? (
              <p id="reg-password-error" className="field-error">{errors.password}</p>
            ) : (
              <p id="reg-password-hint" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                8+ characters, one uppercase letter, one number
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
            id="register-submit-btn"
          >
            {loading ? t('common.loading') : t('auth.register_button')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            {t('auth.have_account')}{' '}
            <Link href="/login" style={{ fontWeight: 600 }}>
              {t('nav.login')}
            </Link>
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
            By creating an account you agree to our{' '}
            <Link href="/terms">Terms of Use</Link> and <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
