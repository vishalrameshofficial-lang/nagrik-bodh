import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { UpdateEditor } from '@/components/admin/UpdateEditor'

export const metadata: Metadata = {
  title: 'Admin — New Update',
  robots: { index: false, follow: false },
}

export default async function NewUpdatePage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: departments }, { data: jurisdictions }] =
    await Promise.all([
      supabase.from('categories').select('id, name_en, name_ta').eq('is_active', true).order('sort_order'),
      supabase.from('departments').select('id, name_en, name_ta').eq('is_active', true).order('name_en'),
      supabase.from('jurisdictions').select('id, name_en, name_ta, type').eq('is_active', true).order('sort_order'),
    ])

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Create New Update</h1>
      <UpdateEditor
        categories={(categories as any[]) ?? []}
        departments={(departments as any[]) ?? []}
        jurisdictions={(jurisdictions as any[]) ?? []}
      />
    </div>
  )
}
