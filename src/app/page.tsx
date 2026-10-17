import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { HomePage } from '@/components/pages/HomePage'

export const metadata: Metadata = {
  title: 'Nagrik Bodh — Government Updates, Clearly Explained',
  description:
    'Clear, verified explanations of government notifications, schemes, rules and compliance deadlines for Indian citizens. Available in English and Tamil.',
}

export default async function Home() {
  const supabase = await createClient()

  // Fetch latest published updates
  const { data: updates } = await supabase
    .from('civic_updates')
    .select(
      `
      id, slug, status, is_demo, effective_date, official_deadline,
      deadline_status, published_at, last_verified_at,
      category:categories(id, slug, name_en, name_ta, icon),
      department:departments(id, slug, name_en, name_ta),
      jurisdiction:jurisdictions(id, slug, name_en, name_ta, type),
      translations:update_translations(id, lang, translation_status, title, short_summary)
    `
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(6)

  // Fetch upcoming deadlines
  const { data: deadlines } = await supabase
    .from('deadlines')
    .select(
      `
      id, title_en, title_ta, deadline_date, status,
      category:categories(id, slug, name_en, name_ta)
    `
    )
    .in('status', ['confirmed', 'unconfirmed'])
    .gte('deadline_date', new Date().toISOString().split('T')[0])
    .order('deadline_date', { ascending: true })
    .limit(5)

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name_en, name_ta, description_en, description_ta, icon')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <HomePage
      updates={(updates as any[]) ?? []}
      deadlines={(deadlines as any[]) ?? []}
      categories={(categories as any[]) ?? []}
    />
  )
}
