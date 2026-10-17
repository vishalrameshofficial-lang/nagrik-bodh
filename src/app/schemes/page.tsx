import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { UpdateCard } from '@/components/updates/UpdateCard'

export const metadata: Metadata = {
  title: 'Government Schemes',
  description: 'Government welfare schemes, benefits and entitlements for Indian citizens — clearly explained.',
}

export default async function SchemesPage() {
  const supabase = await createClient()

  const { data: schemes } = await supabase
    .from('civic_updates')
    .select(
      `
      id, slug, status, is_demo, effective_date, official_deadline,
      deadline_status, published_at, last_verified_at,
      category:categories(id, slug, name_en, name_ta),
      department:departments(id, slug, name_en, name_ta),
      jurisdiction:jurisdictions(id, slug, name_en, name_ta, type),
      translations:update_translations(id, lang, translation_status, title, short_summary)
    `
    )
    .eq('status', 'published')
    .eq('categories.slug', 'government-schemes')
    .order('published_at', { ascending: false })

  return (
    <div style={{ padding: '2rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: 860 }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Government Schemes</h1>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          Welfare schemes, subsidies and entitlement programmes from central and state governments.
        </p>

        {!schemes || schemes.length === 0 ? (
          <div className="empty-state">
            <p>No scheme updates published yet.</p>
          </div>
        ) : (
          <div className="gap-stack" style={{ gap: '0.75rem' }}>
            {schemes.map((s: any) => (
              <UpdateCard key={s.id} update={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
