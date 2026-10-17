import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  // Validate cron secret if set
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    // Find all scheduled updates whose scheduled_at has arrived
    const { data: readyToPublish, error: fetchErr } = await supabase
      .from('civic_updates')
      .select('id, slug, scheduled_at')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)

    if (fetchErr) throw fetchErr

    if (!readyToPublish || readyToPublish.length === 0) {
      return NextResponse.json({ message: 'No scheduled posts due for publication', publishedCount: 0 })
    }

    const ids = readyToPublish.map((u) => u.id)

    // Publish them
    const { error: updateErr } = await supabase
      .from('civic_updates')
      .update({
        status: 'published',
        published_at: now,
        last_verified_at: now,
      })
      .in('id', ids)

    if (updateErr) throw updateErr

    // Log in audit log
    for (const update of readyToPublish) {
      await supabase.from('audit_logs').insert({
        table_name: 'civic_updates',
        record_id: update.id,
        action: 'published',
        new_data: { trigger: 'scheduled_cron', published_at: now },
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully auto-published ${ids.length} scheduled updates.`,
      publishedCount: ids.length,
      publishedIds: ids,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
