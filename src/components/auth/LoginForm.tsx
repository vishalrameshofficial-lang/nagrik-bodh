'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useI18n } from '@/i18n'
import { createClient } from '@/lib/supabase/client'
import { LoginSchema } from '@/lib/validations'

export function LoginForm() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get('redirectedFrom') ?? '/dashboard/saved'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setServerError('')

    const result = LoginSchema.safeParse({ email, password })
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
          'Supabase project not connected: Please configure your actual NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to sign in.'
        )
        return
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)

      if (error) {
        setServerError('Invalid email or password. Please try again.')
        return
      }

      router.push(redirectedFrom)
      router.refresh()
    } catch (err: any) {
      setLoading(false)
      if (err?.message?.includes('fetch') || err?.name === 'TypeError') {
        setServerError(
          'Connection Error (Failed to fetch): The application cannot reach your Supabase backend. Please check NEXT_PUBLIC_SUPABASE_URL in .env.local.'
        )
      } else {
        setServerError(err?.message || 'An unexpected sign in error occurred.')
      }
    }
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
          <h1 style={{ fontSize: '1.375rem', marginBottom: '0.25rem' }}>{t('auth.login_title')}</h1>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 0 }}>
            Save updates and manage your reminders
          </p>
        </div>

        {(!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')) && !serverError && (
          <div className="alert alert-warning" style={{ marginBottom: '1.25rem', fontSize: '0.8125rem', lineHeight: 1.5 }}>
            <strong>Backend Configuration Needed:</strong> To enable real authentication, please set your Supabase project URL and anon key in <code>.env.local</code>.
          </div>
        )}

        {serverError && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={{ marginBottom: '1.125rem' }}>
            <label className="label" htmlFor="login-email">{t('auth.email')}</label>
            <input
              id="login-email"
              type="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              aria-describedby={errors.email ? 'login-email-error' : undefined}
            />
            {errors.email && (
              <p id="login-email-error" className="field-error">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label" htmlFor="login-password">{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={`input ${errors.password ? 'input-error' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{ paddingRight: '2.75rem' }}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p id="login-password-error" className="field-error">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? t('common.loading') : t('auth.login_button')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            {t('auth.no_account')}{' '}
            <Link href="/register" style={{ fontWeight: 600 }}>
              {t('nav.register')}
            </Link>
          </p>
          <Link href="/updates" className="text-muted" style={{ fontSize: '0.8125rem' }}>
            {t('auth.continue_as_guest')}
          </Link>
        </div>
      </div>
    </div>
  )
}
