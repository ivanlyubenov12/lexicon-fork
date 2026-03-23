import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import SetupWizard from './SetupWizard'
import Dashboard from './Dashboard'

export default async function ModeratorDashboard({ params }: { params: { classId: string } }) {
  noStore()
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
    .select('id, name, school_year, status')
    .eq('id', params.classId)
    .eq('moderator_id', user.id)
    .single()

  console.log('[ModeratorDashboard] classData:', classData?.id ?? 'null', 'error:', classError?.message ?? 'none')

  if (!classData) {
    redirect('/register')
  }

  // 3. First-time setup: show wizard when class name is still empty
  if (!classData.name) {
    return <SetupWizard classId={params.classId} />
  }

  // 4. Fetch students
  const { data: students } = await adminClient
    .from('students')
    .select('id, first_name, last_name, invite_accepted_at')
    .eq('class_id', params.classId)
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

  return (
    <Dashboard
      classData={classData}
      students={students ?? []}
      pendingAnswers={pendingAnswers ?? 0}
      pendingMessages={pendingMessages ?? 0}
    />
  )
}
