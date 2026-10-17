import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Methodology and Editorial Standards',
  description: 'How Nagrik Bodh verifies, sources and presents government information for Indian citizens.',
}

export default function AboutPage() {
  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ marginBottom: '0.5rem' }}>About Nagrik Bodh</h1>
        <p className="text-muted" style={{ fontSize: '1.0625rem', marginBottom: '2.5rem' }}>
          An independent platform that simplifies government notifications for Indian citizens.
        </p>

        <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
          <strong>Important:</strong> Nagrik Bodh is not affiliated with, endorsed by, or an official
          publication of the Government of India or any state government. All information must be
          independently verified from official sources before any action is taken.
        </div>

        {[
          {
            title: 'Our Mission',
            content: `India's regulatory and administrative landscape is complex, fragmented and often published in inaccessible formats. Government gazettes, ministry notifications and departmental circulars are authoritative but rarely summarised in accessible language. Nagrik Bodh bridges this gap by curating, explaining and translating these notifications — in English and Tamil — for ordinary citizens.`,
          },
          {
            title: 'Editorial Standards',
            content: `Every update on Nagrik Bodh follows a strict editorial workflow:
            
1. A draft is created by an editor with a link to the primary official source.
2. The draft is reviewed by a second team member who checks the source, verifies the dates and checks the accuracy of the summary.
3. Tamil translations are independently reviewed and marked accordingly. Machine-draft translations are never presented as verified.
4. Only approved updates can be scheduled or published. A single reviewer cannot both write and approve the same update.
5. Published updates are periodically re-verified for continued accuracy.`,
          },
          {
            title: 'Source Policy',
            content: `We prefer the original issuing authority's publication — a gazette notification, ministry circular or official press release — over a secondary announcement. Where we use a secondary source, we clearly indicate this. We record the source URL, issuing authority, document date and retrieval timestamp.`,
          },
          {
            title: 'Translation Policy',
            content: `Tamil translations go through three stages: pending, machine draft and human reviewed/verified. We never present an unreviewed translation as authoritative. A visible notice is shown when a translation is machine-generated or has not been independently reviewed.`,
          },
          {
            title: 'Corrections and Withdrawals',
            content: `If an error is identified in a published update, we can rapidly withdraw or correct it. The historical record is preserved with a clear notice about the correction. We do not silently overwrite incorrect information. A correction notice links to the newer or corrected version.`,
          },
          {
            title: 'Deadlines Policy',
            content: `Deadline dates are marked as Confirmed, Unconfirmed, Extended, Passed or Unknown. We never present an unconfirmed deadline as authoritative. If a deadline cannot be confirmed from an official source, we explicitly say so. Citizens must verify deadlines independently before acting.`,
          },
          {
            title: 'What We Do Not Do',
            content: `• We do not publish AI-generated summaries without human review.
• We do not present content as an official government publication.
• We do not collect sensitive personal data for ordinary browsing.
• We do not invent deadlines, eligibility criteria or benefits.
• We do not accept sponsored content or paid promotions.`,
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{section.title}</h2>
            <p style={{ whiteSpace: 'pre-line', lineHeight: 1.8, marginTop: 0 }}>{section.content}</p>
          </div>
        ))}

        <hr className="divider" />
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          For corrections or questions, see our <a href="/corrections">Corrections Policy</a>.
          For privacy information, see our <a href="/privacy">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}
