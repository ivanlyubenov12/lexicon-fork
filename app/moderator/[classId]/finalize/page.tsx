export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import FinalizeView from './FinalizeView'

export default async function FinalizePage({ params }: { params: { classId: string } }) {
  noStore()
  const { classId } = params

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, status, superhero_image_url')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()

  if (!classData) redirect('/login')

  const { data: students } = await admin
    .from('students')
    .select('id, invite_accepted_at')
    .eq('class_id', classId)

  const studentIds = (students ?? []).map((s) => s.id)
  const totalStudents = studentIds.length
  const acceptedStudents = (students ?? []).filter((s) => s.invite_accepted_at !== null).length

  const { count: approvedAnswers } = await admin
    .from('answers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')
    .in('student_id', studentIds.length > 0 ? studentIds : ['00000000-0000-0000-0000-000000000000'])

  const { count: pendingAnswers } = await admin
    .from('answers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'submitted')
    .in('student_id', studentIds.length > 0 ? studentIds : ['00000000-0000-0000-0000-000000000000'])

  const { count: pendingMessages } = await admin
    .from('peer_messages')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
    .in('recipient_student_id', studentIds.length > 0 ? studentIds : ['00000000-0000-0000-0000-000000000000'])

  return (
    <FinalizeView
      classId={classId}
      className={classData.name}
      classStatus={classData.status}
      totalStudents={totalStudents}
      acceptedStudents={acceptedStudents}
      approvedAnswers={approvedAnswers ?? 0}
      pendingAnswers={pendingAnswers ?? 0}
      pendingMessages={pendingMessages ?? 0}
      hasSuperheroImage={!!classData.superhero_image_url}
    />
  )
}
