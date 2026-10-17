import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SearchParamsSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const params = SearchParamsSchema.parse(searchParams)

    const supabase = await createClient()
    const { from, to } = {
      from: (params.page - 1) * params.pageSize,
      to: params.page * params.pageSize - 1,
    }

    let query = supabase
      .from('civic_updates')
      .select(
        `
        id, slug, status, is_demo, effective_date, official_deadline,
        deadline_status, published_at, last_verified_at,
        category:categories(id, slug, name_en, name_ta, icon),
        department:departments(id, slug, name_en, name_ta),
        jurisdiction:jurisdictions(id, slug, name_en, name_ta, type),
        translations:update_translations(id, lang, translation_status, title, short_summary),
        sources(id, url, title_en, is_primary, is_verified)
      `,
        { count: 'exact' }
      )
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, to)

    if (params.category) query = query.eq('categories.slug', params.category)
    if (params.jurisdiction) query = query.eq('jurisdictions.slug', params.jurisdiction)
    if (params.deadlineStatus) query = query.eq('deadline_status', params.deadlineStatus)

    const { data, count, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by keyword query if provided
    let results = data ?? []
    if (params.q) {
      const qLower = params.q.toLowerCase()
      results = results.filter((item: any) => {
        return item.translations?.some(
          (t: any) =>
            t.title?.toLowerCase().includes(qLower) ||
            t.short_summary?.toLowerCase().includes(qLower)
        )
      })
    }

    return NextResponse.json({
      data: results,
      total: count ?? results.length,
      page: params.page,
      pageSize: params.pageSize,
      hasMore: (count ?? 0) > to + 1,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Invalid search parameters', details: err.message },
      { status: 400 }
    )
  }
}
