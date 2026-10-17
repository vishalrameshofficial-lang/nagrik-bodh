import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy', robots: { index: false, follow: true } }

export default function PrivacyPage() {
  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1>Privacy Policy</h1>
        <p className="text-muted">Last updated: October 2026</p>

        {[
          { title: 'What we collect', content: `For registered users: email address, display name, saved updates, reminder preferences and language settings. For all users: standard server logs (IP address, browser type) that are retained for up to 30 days.` },
          { title: 'What we do not collect', content: `We do not collect Aadhaar numbers, PAN numbers, financial credentials, identity documents or any sensitive personal data. Ordinary browsing of public pages does not require registration.` },
          { title: 'How we use your data', content: `Your email is used to authenticate your account and, if you opt in, to send deadline reminders. We do not sell, share or use your data for advertising.` },
          { title: 'Data retention', content: `Your account data is retained until you delete your account. Audit logs are retained for 12 months for editorial integrity purposes.` },
          { title: 'Account deletion', content: `You can delete your account from your dashboard. This removes your profile, saved updates and reminder preferences. Audit trail entries referencing your account are anonymised, not deleted.` },
          { title: 'Third-party services', content: `We use Supabase for authentication and database hosting. Email reminders (when configured) use Resend. Neither service receives unnecessary personal data.` },
          { title: 'Contact', content: `For privacy requests, contact us via the corrections page.` },
        ].map((s) => (
          <div key={s.title} style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem' }}>{s.title}</h2>
            <p style={{ whiteSpace: 'pre-line', marginTop: 0 }}>{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
