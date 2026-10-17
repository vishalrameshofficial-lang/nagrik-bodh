import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a Nagrik Bodh account to save updates and manage deadline reminders.',
  robots: { index: false, follow: false },
}

export default function RegisterPage() {
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
      <RegisterForm />
    </div>
  )
}
