import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import SetupWizard from './SetupWizard'
import Dashboard from './Dashboard'

export default async function ModeratorDashboard({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const supabase = createServerClient()

  // 1. Get current user — redirect to login if not authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('[ModeratorDashboard] user:', user?.id ?? 'null')

  if (!user) {
    redirect('/login')
  }

  // 2. Fetch class using service role to bypass RLS (we manually check moderator_id below)
  const adminClient = createServiceRoleClient()
  const { data: classData, error: classError } = await adminClient
    .from('classes')
    .select('id, name, school_year, status, school_logo_url')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()

  console.log('[ModeratorDashboard] classData:', classData?.id ?? 'null', 'error:', classError?.message ?? 'none')

  if (!classData) {
    redirect('/register')
  }

  // 3. First-time setup: show wizard when class name is still empty
  if (!classData.name) {
    return <SetupWizard classId={classId} />
  }

  // 4. Fetch students
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

  // 10. Fetch events
  const { data: events } = await adminClient
    .from('events')
    .select('id, title, event_date')
    .eq('class_id', classId)
    .order('order_index')

  return (
    <Dashboard
      classData={classData}
      students={students ?? []}
      pendingAnswers={pendingAnswers ?? 0}
      pendingMessages={pendingMessages ?? 0}
      approvedAnswers={approvedAnswers ?? 0}
      hasQuestionnaire={(questionCount ?? 0) > 0}
      events={events ?? []}
      recentContributions={(recentContributions ?? []) as any[]}
    />
  )
}
