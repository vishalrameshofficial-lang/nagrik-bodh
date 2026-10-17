import { Suspense } from 'react'
import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Nagrik Bodh account to save updates and set reminders.',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
        background: 'linear-gradient(180deg, var(--color-bg-subtle) 0%, var(--color-bg) 100%)',
      }}
    >
      <Suspense fallback={<div className="card text-center py-8">Loading sign in form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
