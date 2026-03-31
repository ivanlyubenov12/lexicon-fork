export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import MessageForm from './MessageForm'

export default async function MessagePage({
  params,
}: {
  params: Promise<{ studentId: string; recipientId: string }>
}) {
  const { studentId, recipientId } = await params

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

  const { data: recipient } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url')
    .eq('id', recipientId)
    .single()
  if (!recipient || recipient.id === studentId) redirect(`/my/${studentId}`)

  // All classmates ordered same as in admin panel
  const { data: classmates } = await admin
    .from('students')
    .select('id, first_name, last_name')
    .eq('class_id', student.class_id)
    .neq('id', studentId)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('last_name')

  const list = classmates ?? []
  const idx = list.findIndex(c => c.id === recipientId)

  const prevId = idx > 0 ? list[idx - 1].id : null
  const nextId = idx < list.length - 1 ? list[idx + 1].id : null

  const prevUrl = prevId ? `/my/${studentId}/message/${prevId}` : null
  const nextUrl = nextId ? `/my/${studentId}/message/${nextId}` : null

  // Existing message from this student to recipient
  const { data: existing } = await admin
    .from('peer_messages')
    .select('content, status')
    .eq('author_student_id', studentId)
    .eq('recipient_student_id', recipientId)
    .maybeSingle()

  return (
    <MessageForm
      studentId={studentId}
      recipient={recipient}
      existingMessage={existing ?? null}
      prevUrl={prevUrl}
      nextUrl={nextUrl}
      messageNumber={idx + 1}
      totalMessages={list.length}
    />
  )
}
