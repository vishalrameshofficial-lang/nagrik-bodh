'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, ClipboardCheck, Link2,
  Calendar, Clock, FileSearch, Settings, User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/updates', label: 'Content', icon: FileText },
  { href: '/admin/review', label: 'Review Queue', icon: ClipboardCheck },
  { href: '/admin/sources', label: 'Sources', icon: Link2 },
  { href: '/admin/deadlines', label: 'Deadlines', icon: Calendar },
  { href: '/admin/scheduled', label: 'Scheduled', icon: Clock },
  { href: '/admin/audit', label: 'Audit Log', icon: FileSearch },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar({ profile }: { profile: Pick<Profile, 'role' | 'display_name' | 'email'> }) {
  const pathname = usePathname()

  return (
    <aside className="admin-sidebar" aria-label="Admin navigation">
      {/* Profile badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.75rem',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: 'var(--color-accent)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.875rem',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <User size={16} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile.display_name ?? profile.email}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
            {profile.role}
          </div>
        </div>
      </div>

      <nav aria-label="Admin menu">
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn('nav-link', isActive && 'nav-link-active')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem' }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div
        style={{
          marginTop: 'auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <Link href="/" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}>
          ← Back to site
        </Link>
      </div>
    </aside>
  )
}
