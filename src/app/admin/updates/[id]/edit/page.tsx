import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UpdateEditor } from '@/components/admin/UpdateEditor'

export const metadata: Metadata = {
  title: 'Admin — Edit Update',
  robots: { index: false, follow: false },
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditUpdatePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: update },
    { data: categories },
    { data: departments },
    { data: jurisdictions },
  ] = await Promise.all([
    supabase
      .from('civic_updates')
      .select('*, translations:update_translations(*), sources(*)')
      .eq('id', id)
      .single(),
    supabase.from('categories').select('id, name_en, name_ta').eq('is_active', true).order('sort_order'),
    supabase.from('departments').select('id, name_en, name_ta').eq('is_active', true).order('name_en'),
    supabase.from('jurisdictions').select('id, name_en, name_ta, type').eq('is_active', true).order('sort_order'),
  ])

  if (!update) notFound()

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Edit Update</h1>
        <p className="text-muted" style={{ marginBottom: 0 }}>
          Status: <strong>{update.status}</strong>
        </p>
      </div>
      <UpdateEditor
        initialData={update as any}
        categories={(categories as any[]) ?? []}
        departments={(departments as any[]) ?? []}
        jurisdictions={(jurisdictions as any[]) ?? []}
      />
    </div>
  )
}
