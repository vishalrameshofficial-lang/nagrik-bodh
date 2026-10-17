import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Corrections Policy' }

export default function CorrectionsPage() {
  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1>Corrections Policy</h1>
        <p style={{ fontSize: '1.0625rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Accurate civic information is central to our mission. We correct errors promptly and transparently.
        </p>
        <h2>Reporting an error</h2>
        <p>If you believe any published information is incorrect, outdated or misleading, please contact us with:</p>
        <ul>
          <li>The URL of the page in question</li>
          <li>A description of the error</li>
          <li>A link to the official government source that contradicts the published content</li>
        </ul>
        <h2>Our correction process</h2>
        <p>
          Upon receiving a correction report, an editor reviews the official source. If the error is confirmed:
        </p>
        <ol>
          <li>The update is withdrawn or suspended immediately if the error is critical.</li>
          <li>A corrected version is drafted, reviewed and approved before republication.</li>
          <li>The published update carries a correction notice linking to the corrected version.</li>
          <li>The editorial history is preserved in our audit log. We do not silently overwrite incorrect information.</li>
        </ol>
        <h2>Machine translations</h2>
        <p>
          If you identify a translation error in Tamil content, please report it with the correct translation
          from the official source or a qualified human reviewer. We do not accept AI-generated corrections
          without human review.
        </p>
      </div>
    </div>
  )
}
