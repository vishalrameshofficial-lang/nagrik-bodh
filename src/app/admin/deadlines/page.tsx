import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AdminDeadlinesManager } from '@/components/admin/AdminDeadlinesManager'

export const metadata: Metadata = {
  title: 'Admin — Deadlines Management',
  robots: { index: false, follow: false },
}

export default async function AdminDeadlinesPage() {
  const supabase = await createClient()

  const [{ data: deadlines }, { data: categories }, { data: departments }] = await Promise.all([
    supabase
      .from('deadlines')
      .select(`
        id, title_en, title_ta, description_en, description_ta, deadline_date, deadline_time,
        timezone, status, category_id, department_id, jurisdiction_id, source_url, notes,
        created_by, created_at, updated_at,
        category:categories(id, name_en, slug),
        department:departments(id, name_en, slug)
      `)
      .order('deadline_date', { ascending: true }),
    supabase.from('categories').select('id, name_en, slug').eq('is_active', true).order('sort_order'),
    supabase.from('departments').select('id, name_en, slug').eq('is_active', true).order('name_en'),
  ])

  return (
    <AdminDeadlinesManager
      deadlines={(deadlines as any[]) ?? []}
      categories={(categories as any[]) ?? []}
      departments={(departments as any[]) ?? []}
    />
  )
}
