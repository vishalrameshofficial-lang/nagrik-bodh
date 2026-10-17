import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Use', robots: { index: false, follow: true } }

export default function TermsPage() {
  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1>Terms of Use</h1>
        <p className="text-muted">Last updated: October 2026</p>

        <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
          Nagrik Bodh is an informational platform. It is not a legal, financial or official government resource.
          Always verify information from official government sources before taking any action.
        </div>

        {[
          { title: 'Acceptance', content: 'By using Nagrik Bodh you agree to these terms. If you do not agree, do not use the platform.' },
          { title: 'No official affiliation', content: 'Nagrik Bodh is an independent platform. It is not affiliated with, endorsed by, or an official publication of any government.' },
          { title: 'Accuracy and liability', content: 'We make reasonable efforts to ensure accuracy but we cannot guarantee that all information is current, complete or correct. We are not liable for any loss or damage arising from reliance on information published on this platform.' },
          { title: 'User accounts', content: 'You must provide accurate information when registering. You are responsible for maintaining the security of your account. We may suspend accounts that violate these terms.' },
          { title: 'Prohibited use', content: 'You may not use this platform to: impersonate government officials, distribute misinformation, attempt to access other users\' data, or circumvent security controls.' },
          { title: 'Content ownership', content: 'Summaries and explanations on this platform are original editorial work. Official government documents are in the public domain. We claim no copyright over official government notifications.' },
          { title: 'Changes', content: 'We may update these terms at any time. Continued use after changes constitutes acceptance.' },
        ].map((s) => (
          <div key={s.title} style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem' }}>{s.title}</h2>
            <p style={{ marginTop: 0 }}>{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
