import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import Dashboard from './Dashboard'

export default async function ModeratorDashboard({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const supabase = createServerClient()

  // 1. Get current user — redirect to login if not authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()


  if (!user) {
    redirect('/login')
  }

  // 2. Fetch class using service role to bypass RLS (we manually check moderator_id below)
  const adminClient = createServiceRoleClient()
  const { data: classData, error: classError } = await adminClient
    .from('classes')
    .select('id, name, school_year, status, school_logo_url, cover_image_url, deadline, layout')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()


  if (!classData) {
    redirect('/moderator')
  }

  // 3. Fetch students
  const { data: students } = await adminClient
    .from('students')
    .select('id, first_name, last_name, invite_accepted_at')
    .eq('class_id', classId)
    .order('last_name', { ascending: true })

  // 5. Fetch pending answers count
  const { count: pendingAnswers } = await adminClient
    .from('answers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'submitted')
    .in(
      'student_id',
      (students ?? []).map((s) => s.id)
    )

  // 6. Fetch pending messages count
  const { count: pendingMessages } = await adminClient
    .from('peer_messages')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
    .in(
      'recipient_student_id',
      (students ?? []).map((s) => s.id)
    )

  // 7. Check if questionnaire has been configured (any class-specific questions)
  const { count: questionCount } = await adminClient
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('class_id', classId)

  const studentIds = (students ?? []).map((s) => s.id)

  // 8. Fetch approved answers count
  const { count: approvedAnswers } = await adminClient
    .from('answers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')
    .in('student_id', studentIds)

  // 9. Fetch recent contributions (last 4 approved answers with student + question info)
  const { data: recentContributions } = studentIds.length > 0
    ? await adminClient
        .from('answers')
        .select('id, text_content, media_url, media_type, updated_at, student_id, question_id, questions(text), students(first_name, last_name, photo_url)')
        .eq('status', 'approved')
        .in('student_id', studentIds)
        .order('updated_at', { ascending: false })
        .limit(4)
    : { data: [] }

  // 10b. Compute students awaiting approval (fully completed + has submitted answers)
  const { count: personalQCount } = await adminClient
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('class_id', classId)
    .eq('type', 'personal')

  const requiredCount = personalQCount ?? 0

  const { data: allStudentAnswers } = studentIds.length > 0
    ? await adminClient
        .from('answers')
        .select('student_id, status')
        .in('student_id', studentIds)
        .in('status', ['submitted', 'approved'])
    : { data: [] }

  // Count total answered and submitted-pending per student
  const totalMap = new Map<string, number>()
  const submittedMap = new Map<string, number>()
  for (const a of allStudentAnswers ?? []) {
    totalMap.set(a.student_id, (totalMap.get(a.student_id) ?? 0) + 1)
    if (a.status === 'submitted') {
      submittedMap.set(a.student_id, (submittedMap.get(a.student_id) ?? 0) + 1)
    }
  }

  const awaitingApproval = (students ?? []).filter(s =>
    requiredCount > 0 &&
    (totalMap.get(s.id) ?? 0) >= requiredCount &&
    (submittedMap.get(s.id) ?? 0) > 0
  )

  // 10. Fetch events
  const { data: events } = await adminClient
    .from('events')
    .select('id, title, event_date')
    .eq('class_id', classId)
    .order('order_index')

  const layout = (classData as { layout?: unknown }).layout
  const hasLayout = Array.isArray(layout) && layout.length > 0

  return (
    <Dashboard
      classData={classData}
      moderatorEmail={user.email ?? null}
      deadline={classData.deadline ?? null}
      students={students ?? []}
      awaitingApproval={awaitingApproval}
      pendingAnswers={pendingAnswers ?? 0}
      pendingMessages={pendingMessages ?? 0}
      approvedAnswers={approvedAnswers ?? 0}
      hasQuestionnaire={(questionCount ?? 0) > 0}
      hasLayout={hasLayout}
      events={events ?? []}
      recentContributions={(recentContributions ?? []) as any[]}
    />
  )
}
