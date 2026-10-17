import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { UpdatesFeed } from '@/components/pages/UpdatesFeed'
import { SearchParamsSchema } from '@/lib/validations'

export const metadata: Metadata = {
  title: 'Civic Updates',
  description: 'Browse all verified government notifications, rules and scheme updates for Indian citizens.',
}

interface Props {
  searchParams: Promise<Record<string, string | string[]>>
}

export default async function UpdatesPage({ searchParams }: Props) {
  const rawParams = await searchParams
  const params = SearchParamsSchema.parse({
    q: rawParams.q,
    category: rawParams.category,
    department: rawParams.department,
    jurisdiction: rawParams.jurisdiction,
    lang: rawParams.lang,
    page: rawParams.page ?? 1,
    pageSize: rawParams.pageSize ?? 20,
    deadlineStatus: rawParams.deadlineStatus,
  })

  const supabase = await createClient()
  const { from, to } = { from: (params.page - 1) * params.pageSize, to: params.page * params.pageSize - 1 }

  let query = supabase
    .from('civic_updates')
    .select(
      `
      id, slug, status, is_demo, effective_date, official_deadline,
      deadline_status, published_at, last_verified_at,
      category:categories(id, slug, name_en, name_ta, icon),
      department:departments(id, slug, name_en, name_ta),
      jurisdiction:jurisdictions(id, slug, name_en, name_ta, type),
      translations:update_translations(id, lang, translation_status, title, short_summary)
    `,
      { count: 'exact' }
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to)

  if (params.category) query = query.eq('categories.slug', params.category)
  if (params.jurisdiction) query = query.eq('jurisdictions.slug', params.jurisdiction)
  if (params.deadlineStatus) query = query.eq('deadline_status', params.deadlineStatus)

  const { data: updates, count } = await query

  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name_en, name_ta')
    .eq('is_active', true)
    .order('sort_order')

  const { data: jurisdictions } = await supabase
    .from('jurisdictions')
    .select('id, slug, name_en, name_ta, type')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <Suspense fallback={<div className="container py-8 text-center text-muted">Loading civic updates...</div>}>
      <UpdatesFeed
        updates={(updates as any[]) ?? []}
        total={count ?? 0}
        params={params}
        categories={(categories as any[]) ?? []}
        jurisdictions={(jurisdictions as any[]) ?? []}
      />
    </Suspense>
  )
}
