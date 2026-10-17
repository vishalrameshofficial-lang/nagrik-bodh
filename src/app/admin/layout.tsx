import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectedFrom=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name, email')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'reviewer', 'editor'].includes(profile.role)) {
    redirect('/')
  }

  return (
    <div className="admin-layout">
      <AdminSidebar profile={profile as any} />
      <div className="admin-content">{children}</div>
    </div>
  )
}
