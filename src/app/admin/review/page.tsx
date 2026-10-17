import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ReviewQueue } from '@/components/admin/ReviewQueue'

export const metadata: Metadata = {
  title: 'Admin — Review Queue',
  robots: { index: false, follow: false },
}

export default async function ReviewPage() {
  const supabase = await createClient()

  const { data: updates } = await supabase
    .from('civic_updates')
    .select(
      `
      id, slug, status, is_demo, submitted_at, created_at,
      category:categories(id, name_en),
      department:departments(id, name_en),
      translations:update_translations(lang, title, short_summary, translation_status),
      sources(id, url, is_primary, is_verified),
      submitter:profiles!civic_updates_submitted_by_fkey(id, display_name, email)
    `
    )
    .in('status', ['in_review', 'approved'])
    .order('submitted_at', { ascending: true })

  return (
    <div>
      <h1 style={{ marginBottom: '0.375rem' }}>Review Queue</h1>
      <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
        Updates submitted for review. Approve, reject or request changes.
      </p>
      <ReviewQueue updates={(updates as any[]) ?? []} />
    </div>
  )
}
