import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UpdateDetailPage } from '@/components/updates/UpdateDetailPage'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('civic_updates')
    .select('translations:update_translations(lang, title, short_summary)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  const enTranslation = (data?.translations as any[])?.find((t: any) => t.lang === 'en')
  return {
    title: enTranslation?.title ?? 'Civic Update',
    description: enTranslation?.short_summary ?? '',
  }
}

export default async function UpdateDetail({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: update } = await supabase
    .from('civic_updates')
    .select(
      `
      *,
      category:categories(*),
      department:departments(*),
      jurisdiction:jurisdictions(*),
      translations:update_translations(*),
      sources(*),
      superseded_by_update:civic_updates!civic_updates_superseded_by_fkey(
        id, slug,
        translations:update_translations(lang, title)
      )
    `
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!update) notFound()

  // Get related updates (same category)
  const { data: related } = await supabase
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
    .eq('category_id', (update as any).category_id)
    .neq('id', update.id)
    .order('published_at', { ascending: false })
    .limit(3)

  return (
    <UpdateDetailPage
      update={update as any}
      related={(related as any[]) ?? []}
    />
  )
}
