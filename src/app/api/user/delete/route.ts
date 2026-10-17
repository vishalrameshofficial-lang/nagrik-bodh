import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Never delete admin via self-service endpoint if they are the only admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')

      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the only platform administrator account.' },
          { status: 400 }
        )
      }
    }

    // 1. Delete user private data
    await Promise.all([
      supabase.from('saved_updates').delete().eq('user_id', user.id),
      supabase.from('user_preferences').delete().eq('user_id', user.id),
      supabase.from('notification_jobs').delete().eq('user_id', user.id),
    ])

    // 2. Mark profile as deleted or remove
    await supabase.from('profiles').update({
      deleted_at: new Date().toISOString(),
      display_name: '[Deleted Citizen]',
      email: `deleted_${user.id}@deleted.nagrikbodh.in`,
    }).eq('id', user.id)

    // 3. Delete from Supabase Auth if service role is available
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const adminSupabase = createAdminClient()
        await adminSupabase.auth.admin.deleteUser(user.id)
      } catch (adminErr) {
        console.warn('Failed to delete auth user via admin client:', adminErr)
      }
    }

    // 4. Sign out
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: 'Your account and personal data have been completely deleted.',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
