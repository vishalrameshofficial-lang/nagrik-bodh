'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut, BookOpen, Bell, Settings } from 'lucide-react'
import { useI18n } from '@/i18n'
import { createClient } from '@/lib/supabase/client'
import { LanguageSelector } from './LanguageSelector'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'

export function Header() {
  const { t, lang } = useI18n()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
          .then(({ data: p }) => {
            if (p) setProfile(p as Profile)
          })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const navLinks = [
    { href: '/updates', label: t('nav.updates') },
    { href: '/schemes', label: t('nav.schemes') },
    { href: '/deadlines', label: t('nav.deadlines') },
    { href: '/sources', label: t('nav.sources') },
    { href: '/about', label: t('nav.about') },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    window.location.href = '/'
  }

  return (
    <header className="header" role="banner">
      <div className="container">
        <div className="header-inner">
          {/* Logo */}
          <Link href="/" className="logo" aria-label="Nagrik Bodh Home">
            <div className="logo-mark" aria-hidden="true">न</div>
            <div className="logo-text">
              Nagrik Bodh
              <span>Civic Awareness Platform</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation">
            <ul className="nav-links" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'nav-link',
                      pathname.startsWith(link.href) && 'nav-link-active'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LanguageSelector />

            {profile ? (
              <div style={{ position: 'relative' }}>
                <button
                  id="user-menu-btn"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  aria-label="User menu"
                >
                  <User size={16} />
                  <span
                    style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {profile.display_name ?? profile.email.split('@')[0]}
                  </span>
                </button>
                {menuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-md)',
                      minWidth: 200,
                      zIndex: 200,
                    }}
                    role="menu"
                  >
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--color-border)',
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {profile.email}
                    </div>
                    <Link
                      href="/dashboard/saved"
                      className="btn btn-ghost"
                      style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, padding: '0.625rem 1rem' }}
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      <BookOpen size={15} /> {t('nav.saved')}
                    </Link>
                    <Link
                      href="/dashboard/reminders"
                      className="btn btn-ghost"
                      style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, padding: '0.625rem 1rem' }}
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      <Bell size={15} /> {t('nav.reminders')}
                    </Link>
                    {['admin', 'editor', 'reviewer'].includes(profile.role) && (
                      <Link
                        href="/admin"
                        className="btn btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, padding: '0.625rem 1rem' }}
                        onClick={() => setMenuOpen(false)}
                        role="menuitem"
                      >
                        <Settings size={15} /> {t('nav.admin')}
                      </Link>
                    )}
                    <div style={{ borderTop: '1px solid var(--color-border)', padding: '0.375rem 0' }}>
                      <button
                        className="btn btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '0.625rem 1rem', color: 'var(--color-error)' }}
                        onClick={handleLogout}
                        role="menuitem"
                      >
                        <LogOut size={15} /> {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                )}
                {menuOpen && (
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 150 }}
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  />
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                <Link href="/login" className="btn btn-ghost btn-sm">
                  {t('nav.login')}
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          style={{
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            padding: '1rem',
          }}
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'nav-link',
                    'block',
                    pathname.startsWith(link.href) && 'nav-link-active'
                  )}
                  style={{ display: 'block', padding: '0.625rem 0.75rem' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
