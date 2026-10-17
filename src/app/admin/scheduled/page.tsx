import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ScheduledPostsManager } from '@/components/admin/ScheduledPostsManager'

export const metadata: Metadata = {
  title: 'Admin — Scheduled Content',
  robots: { index: false, follow: false },
}

export default async function AdminScheduledPage() {
  const supabase = await createClient()

  const { data: scheduledUpdates } = await supabase
    .from('civic_updates')
    .select(`
      id, slug, status, scheduled_at, is_demo,
      category:categories(id, name_en),
      department:departments(id, name_en),
      jurisdiction:jurisdictions(id, name_en),
      translations:update_translations(lang, title, short_summary),
      reviewer:profiles!civic_updates_reviewed_by_fkey(display_name, email)
    `)
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })

  return <ScheduledPostsManager scheduledUpdates={(scheduledUpdates as any[]) ?? []} />
}
