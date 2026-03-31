export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import EventCommentForm from './EventCommentForm'

export default async function EventPage({
  params,
}: {
  params: Promise<{ studentId: string; eventId: string }>
}) {
  const { studentId, eventId } = await params

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: student } = await admin
    .from('students')
    .select('id, class_id, parent_user_id')
    .eq('id', studentId)
    .single()
  if (!student || student.parent_user_id !== user.id) redirect('/login')

  const { data: event } = await admin
    .from('events')
    .select('id, title, event_date, photos, note')
    .eq('id', eventId)
    .single()
  if (!event) redirect(`/my/${studentId}`)

  // All events ordered same as in StudentProfileParent
  const { data: allEvents } = await admin
    .from('events')
    .select('id')
    .eq('class_id', student.class_id)
    .order('order_index')

  const list = allEvents ?? []
  const idx = list.findIndex(e => e.id === eventId)

  const prevId = idx > 0 ? list[idx - 1].id : null
  const nextId = idx < list.length - 1 ? list[idx + 1].id : null

  const prevUrl = prevId ? `/my/${studentId}/event/${prevId}` : null
  const nextUrl = nextId ? `/my/${studentId}/event/${nextId}` : null

  const { data: existing } = await admin
    .from('event_comments')
    .select('id, comment_text')
    .eq('event_id', eventId)
    .eq('student_id', studentId)
    .maybeSingle()

  return (
    <EventCommentForm
      studentId={studentId}
      event={{
        id: event.id,
        title: event.title,
        event_date: event.event_date ?? null,
        photos: Array.isArray(event.photos) ? event.photos : [],
        note: event.note ?? null,
      }}
      existingComment={existing ? { id: existing.id, comment_text: existing.comment_text } : null}
      prevUrl={prevUrl}
      nextUrl={nextUrl}
      eventNumber={idx + 1}
      totalEvents={list.length}
    />
  )
}
