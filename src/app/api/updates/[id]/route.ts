import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Can query by UUID or slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    let query = supabase
      .from('civic_updates')
      .select(`
        id, slug, status, effective_date, official_deadline, deadline_status,
        deadline_timezone, is_demo, published_at, last_verified_at,
        category:categories(id, slug, name_en, name_ta, icon),
        department:departments(id, slug, name_en, name_ta, website_url),
        jurisdiction:jurisdictions(id, slug, name_en, name_ta, type),
        translations:update_translations(
          id, lang, translation_status, title, short_summary, who_is_affected,
          what_changed, required_actions, eligibility, benefits, required_documents
        ),
        sources(id, url, title_en, title_ta, issuing_authority, document_date, retrieved_at, is_primary, is_verified)
      `)

    if (isUuid) {
      query = query.eq('id', id)
    } else {
      query = query.eq('slug', id)
    }

    const { data: update, error } = await query.single()

    if (error || !update) {
      return NextResponse.json({ error: 'Civic update not found' }, { status: 404 })
    }

    return NextResponse.json({ data: update })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
