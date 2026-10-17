import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UpdateCard } from '@/components/updates/UpdateCard'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('name_en, description_en').eq('slug', slug).single()
  return { title: data?.name_en ?? 'Category', description: data?.description_en ?? '' }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) notFound()

  const { data: updates } = await supabase
    .from('civic_updates')
    .select(
      `id, slug, status, is_demo, effective_date, official_deadline,
      deadline_status, published_at, last_verified_at,
      category:categories(id, slug, name_en, name_ta),
      department:departments(id, slug, name_en, name_ta),
      jurisdiction:jurisdictions(id, slug, name_en, name_ta, type),
      translations:update_translations(id, lang, translation_status, title, short_summary)`
    )
    .eq('status', 'published')
    .eq('category_id', category.id)
    .order('published_at', { ascending: false })

  return (
    <div style={{ padding: '2rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: 860 }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{category.name_en}</h1>
        {category.description_en && (
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{category.description_en}</p>
        )}
        {!updates || updates.length === 0 ? (
          <div className="empty-state"><p>No updates in this category yet.</p></div>
        ) : (
          <div className="gap-stack" style={{ gap: '0.75rem' }}>
            {updates.map((u: any) => <UpdateCard key={u.id} update={u} />)}
          </div>
        )}
      </div>
    </div>
  )
}
