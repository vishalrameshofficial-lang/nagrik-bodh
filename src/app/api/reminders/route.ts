import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ReminderPrefSchema = z.object({
  email_reminders: z.boolean().optional(),
  reminder_days_before: z.array(z.number().int().min(1).max(30)).optional(),
  preferred_categories: z.array(z.string().uuid()).optional().nullable(),
  preferred_jurisdictions: z.array(z.string().uuid()).optional().nullable(),
  language: z.enum(['en', 'ta']).optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [{ data: preferences }, { data: jobs }] = await Promise.all([
    supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
    supabase
      .from('notification_jobs')
      .select(`
        id, type, status, scheduled_for, sent_at,
        deadline:deadlines(id, title_en, title_ta, deadline_date)
      `)
      .eq('user_id', user.id)
      .order('scheduled_for', { ascending: true }),
  ])

  return NextResponse.json({
    preferences: preferences ?? null,
    upcomingReminders: jobs ?? [],
  })
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = ReminderPrefSchema.parse(body)

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
