export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import ModeratorSidebar from '../ModeratorSidebar'
import FinalizeView from './FinalizeView'

export default async function FinalizePage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, school_logo_url, status, plan, superhero_image_url')
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

  const placeholder = ['00000000-0000-0000-0000-000000000000']
  const ids = studentIds.length > 0 ? studentIds : placeholder

  const { count: approvedAnswers } = await admin
    .from('answers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')
    .in('student_id', ids)

  const { count: pendingAnswers } = await admin
    .from('answers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'submitted')
    .in('student_id', ids)

  const { count: pendingMessages } = await admin
    .from('peer_messages')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
    .in('recipient_student_id', ids)

  const [namePart] = classData.name?.includes(' — ')
    ? classData.name.split(' — ')
    : [classData.name ?? '']

  return (
    <div className="flex min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <ModeratorSidebar
        classId={classId}
        namePart={namePart}
        schoolYear={classData.school_year}
        logoUrl={classData.school_logo_url}
        active="finalize"
      />

      <main className="ml-64 flex-1 p-8 lg:p-12">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">
            Последна стъпка
          </p>
          <h1
            className="text-4xl font-bold text-gray-900 leading-tight"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Финализирай лексикона
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Провери дали всичко е готово и публикувай.
          </p>
        </div>

        <FinalizeView
          classId={classId}
          className={classData.name}
          classPlan={(classData.plan as 'basic' | 'premium' | null) ?? null}
          classStatus={classData.status}
          totalStudents={totalStudents}
          acceptedStudents={acceptedStudents}
          approvedAnswers={approvedAnswers ?? 0}
          pendingAnswers={pendingAnswers ?? 0}
          pendingMessages={pendingMessages ?? 0}
          hasSuperheroImage={!!classData.superhero_image_url}
        />
      </main>
    </div>
  )
}
