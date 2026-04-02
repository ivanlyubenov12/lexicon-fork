import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import Dashboard from './Dashboard'
import ModeratorSidebar from './ModeratorSidebar'

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
    .select('id, name, school_year, status, school_logo_url, cover_image_url, deadline, layout, teacher_name, plan, template_id, member_label, group_label')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()


  if (!classData) {
    redirect('/moderator')
  }

  // 3. Fetch students
  const { data: students } = await adminClient
    .from('students')
    .select('id, first_name, last_name, invite_accepted_at, questionnaire_submitted')
    .eq('class_id', classId)
    .order('sort_order', { ascending: true, nullsFirst: false })
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

  // 10b. Students awaiting approval = any student with at least 1 submitted answer
  const { data: allStudentAnswers } = studentIds.length > 0
    ? await adminClient
        .from('answers')
        .select('student_id, status')
        .in('student_id', studentIds)
        .eq('status', 'submitted')
    : { data: [] }

  const submittedStudentIds = new Set((allStudentAnswers ?? []).map(a => a.student_id))

  const awaitingApproval = (students ?? []).filter(s => s.questionnaire_submitted && submittedStudentIds.has(s.id))

  // 10. Fetch events
  const { data: events } = await adminClient
    .from('events')
    .select('id, title, event_date')
    .eq('class_id', classId)
    .order('order_index')

  const layout = (classData as { layout?: unknown }).layout
  const hasLayout = Array.isArray(layout) && layout.length > 0

  const [namePart] = classData.name.includes(' — ')
    ? classData.name.split(' — ')
    : [classData.name]

  return (
    <div className="flex min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <ModeratorSidebar
        classId={classId}
        namePart={namePart}
        schoolYear={classData.school_year ?? null}
        logoUrl={classData.school_logo_url ?? null}
        active="dashboard"
      />
      <Dashboard
        classData={{ id: classData.id, name: classData.name, school_year: classData.school_year, status: classData.status, school_logo_url: classData.school_logo_url, plan: classData.plan ?? null, template_id: classData.template_id ?? null, memberLabel: classData.member_label ?? null, groupLabel: classData.group_label ?? null }}
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
    </div>
  )
}
