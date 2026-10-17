import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ReviewActionSchema = z.object({
  action: z.enum(['submitted_for_review', 'approved', 'rejected', 'scheduled', 'published', 'withdrawn', 'corrected']),
  notes: z.string().max(1000).optional(),
  scheduledAt: z.string().datetime().optional(),
  withdrawalReason: z.string().max(1000).optional(),
})

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id: updateId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check staff role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'reviewer', 'editor'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { action, notes, scheduledAt, withdrawalReason } = ReviewActionSchema.parse(body)

    // Authorization checks based on role and action
    if (['approved', 'rejected'].includes(action) && !['admin', 'reviewer'].includes(profile.role)) {
      return NextResponse.json({ error: 'Only reviewers and admins can approve or reject content' }, { status: 403 })
    }

    if (['published', 'withdrawn', 'corrected'].includes(action) && !['admin', 'reviewer'].includes(profile.role)) {
      return NextResponse.json({ error: 'Only reviewers and admins can publish, withdraw or correct' }, { status: 403 })
    }

    // Verify existing update
    const { data: update, error: fetchErr } = await supabase
      .from('civic_updates')
      .select('id, status, created_by')
      .eq('id', updateId)
      .single()

    if (fetchErr || !update) {
      return NextResponse.json({ error: 'Civic update not found' }, { status: 404 })
    }

    // Separation of duties: Reviewer cannot approve their own submission unless admin
    if (action === 'approved' && update.created_by === user.id && profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Editorial conflict: You cannot approve your own submission. A second reviewer is required.' },
        { status: 400 }
      )
    }

    const updatePayload: Record<string, any> = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }

    if (action === 'submitted_for_review') {
      updatePayload.status = 'in_review'
      updatePayload.submitted_by = user.id
      updatePayload.submitted_at = new Date().toISOString()
    } else if (action === 'approved') {
      updatePayload.status = 'approved'
      updatePayload.reviewed_by = user.id
      updatePayload.reviewed_at = new Date().toISOString()
    } else if (action === 'rejected') {
      updatePayload.status = 'rejected'
      updatePayload.reviewed_by = user.id
      updatePayload.reviewed_at = new Date().toISOString()
    } else if (action === 'scheduled') {
      if (!scheduledAt) {
        return NextResponse.json({ error: 'scheduledAt timestamp is required for scheduling' }, { status: 400 })
      }
      updatePayload.status = 'scheduled'
      updatePayload.scheduled_at = scheduledAt
    } else if (action === 'published') {
      updatePayload.status = 'published'
      updatePayload.published_at = new Date().toISOString()
      updatePayload.last_verified_at = new Date().toISOString()
    } else if (action === 'withdrawn') {
      updatePayload.status = 'withdrawn'
      updatePayload.withdrawn_at = new Date().toISOString()
      updatePayload.withdrawal_reason = withdrawalReason ?? notes ?? 'Withdrawn by editorial staff'
    } else if (action === 'corrected') {
      updatePayload.last_verified_at = new Date().toISOString()
      // Kept published, but audit logged with notes
    }

    const { error: updateErr } = await supabase
      .from('civic_updates')
      .update(updatePayload)
      .eq('id', updateId)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // Record in content_reviews
    await supabase.from('content_reviews').insert({
      update_id: updateId,
      reviewer_id: user.id,
      action,
      notes: notes ?? withdrawalReason ?? null,
    })

    // Record in audit_logs
    await supabase.from('audit_logs').insert({
      table_name: 'civic_updates',
      record_id: updateId,
      action,
      performed_by: user.id,
      new_data: { status: updatePayload.status, notes },
    })

    return NextResponse.json({
      success: true,
      action,
      status: updatePayload.status ?? update.status,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
