import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const SaveSchema = z.object({
  updateId: z.string().uuid(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: saved, error } = await supabase
    .from('saved_updates')
    .select(`
      id, saved_at,
      update:civic_updates(
        id, slug, status, effective_date, official_deadline, deadline_status, is_demo,
        category:categories(name_en, name_ta),
        translations:update_translations(lang, title, short_summary)
      )
    `)
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: saved ?? [] })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { updateId } = SaveSchema.parse(body)

    const { error } = await supabase
      .from('saved_updates')
      .insert({ user_id: user.id, update_id: updateId })
      .select()
      .single()

    if (error && error.code !== '23505') { // 23505 is unique violation (already saved)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, saved: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const updateId = searchParams.get('updateId')

    if (!updateId) {
      return NextResponse.json({ error: 'Missing updateId parameter' }, { status: 400 })
    }

    const { error } = await supabase
      .from('saved_updates')
      .delete()
      .eq('user_id', user.id)
      .eq('update_id', updateId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, saved: false })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
