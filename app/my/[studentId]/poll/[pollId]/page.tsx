export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { buildSeq, seqUrl } from '../../sequence'
import PollAnswerPage from './PollAnswerPage'

export default async function PollAnswerRoute({
  params,
}: {
  params: Promise<{ studentId: string; pollId: string }>
}) {
  const { studentId, pollId } = await params

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

  const { data: poll } = await admin
    .from('class_polls')
    .select('id, question')
    .eq('id', pollId)
    .single()
  if (!poll) redirect(`/my/${studentId}`)

  const [{ data: allQs }, { data: allPolls }, { data: classmates }, { data: myVote }] = await Promise.all([
    admin.from('questions')
      .select('id, text, type, order_index, is_anonymous')
      .eq('class_id', student.class_id)
      .order('order_index'),
    admin.from('class_polls')
      .select('id, question, order_index')
      .eq('class_id', student.class_id)
      .order('order_index'),
    admin.from('students')
      .select('id, first_name, last_name, photo_url')
      .eq('class_id', student.class_id)
      .neq('id', studentId)
      .order('sort_order', { ascending: true, nullsFirst: false })
    .order('last_name'),
    admin.from('class_poll_votes')
      .select('nominee_student_id')
      .eq('poll_id', pollId)
      .eq('voter_student_id', studentId)
      .maybeSingle(),
  ])

  const seq = buildSeq(allQs ?? [], allPolls ?? [])
  const idx = seq.findIndex(item => item.id === pollId && item.kind === 'poll')

  const prevUrl = idx > 0 ? seqUrl(seq[idx - 1], studentId) : null
  const nextUrl = idx < seq.length - 1 ? seqUrl(seq[idx + 1], studentId) : null

  return (
    <PollAnswerPage
      studentId={studentId}
      poll={poll}
      classmates={classmates ?? []}
      existingVote={myVote?.nominee_student_id ?? null}
      prevUrl={prevUrl}
      nextUrl={nextUrl}
      questionNumber={idx + 1}
      totalQuestions={seq.length}
    />
  )
}
