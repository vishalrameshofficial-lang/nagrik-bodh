import Link from 'next/link'

const currentYear = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: 'var(--color-accent)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                न
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                Nagrik Bodh
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
              Government updates, clearly explained for every Indian citizen.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              Platform
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {[
                { href: '/updates', label: 'Civic Updates' },
                { href: '/schemes', label: 'Government Schemes' },
                { href: '/deadlines', label: 'Deadlines' },
                { href: '/sources', label: 'Sources' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About links */}
          <div>
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              About
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {[
                { href: '/about', label: 'Methodology' },
                { href: '/corrections', label: 'Corrections Policy' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Use' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-disclaimer">
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--color-text-secondary)' }}>Disclaimer:</strong>{' '}
            Nagrik Bodh is an independent civic information platform. It is not affiliated with,
            endorsed by, or an official publication of the Government of India or any state
            government. Always verify information from official government sources before taking
            any action.
          </p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>
            © {currentYear} Nagrik Bodh. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
