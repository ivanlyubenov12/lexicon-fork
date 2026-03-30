export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendAllInvites } from '../actions'
import ModeratorSidebar from '../ModeratorSidebar'
import BulkReminderButton from './BulkReminderButton'
import StudentsBulkList from './StudentsBulkList'
import type { StudentRowData } from './StudentsBulkList'

interface StudentRow {
  id: string
  first_name: string
  last_name: string
  parent_email: string | null
  parent_user_id: string | null
  photo_url: string | null
  invite_accepted_at: string | null
  invite_token: string
}

export default async function StudentsPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const supabase = createServiceRoleClient()

  const { data: classData } = await supabase
    .from('classes')
    .select('id, name, school_year, school_logo_url, deadline, expected_student_count')
    .eq('id', classId)
    .single()

  const { data: students } = await supabase
    .from('students')
    .select('id, first_name, last_name, parent_email, parent_user_id, photo_url, invite_accepted_at, invite_token')
    .eq('class_id', classId)
    .order('last_name', { ascending: true })

  const studentList: StudentRow[] = students ?? []

  // Fetch registered emails for parents who accepted invite
  const parentUserIds = studentList.map(s => s.parent_user_id).filter(Boolean) as string[]
  const registeredEmailMap: Record<string, string> = {}
  if (parentUserIds.length > 0) {
    const { data: usersData } = await supabase.auth.admin.listUsers()
    for (const u of usersData?.users ?? []) {
      if (parentUserIds.includes(u.id) && u.email) {
        registeredEmailMap[u.id] = u.email
      }
    }
  }

  const { count: totalQuestions } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('class_id', classId)
    .in('type', ['personal', 'superhero', 'better_together'])

  const total = totalQuestions ?? 0

  const studentIds = studentList.map((s) => s.id)
  const approvedCountsMap: Record<string, number> = {}
  const approvedMessagesMap: Record<string, number> = {}

  if (studentIds.length > 0) {
    const [{ data: approvedAnswers }, { data: approvedMessages }] = await Promise.all([
      supabase.from('answers').select('student_id').eq('status', 'approved').in('student_id', studentIds),
      supabase.from('peer_messages').select('recipient_student_id').eq('status', 'approved').in('recipient_student_id', studentIds),
    ])

    for (const row of approvedAnswers ?? []) {
      approvedCountsMap[row.student_id] = (approvedCountsMap[row.student_id] ?? 0) + 1
    }
    for (const row of approvedMessages ?? []) {
      approvedMessagesMap[row.recipient_student_id] = (approvedMessagesMap[row.recipient_student_id] ?? 0) + 1
    }
  }

  const hasPendingInvites = studentList.some((s) => s.parent_email && !s.invite_accepted_at)

  const registeredCount = studentList.filter((s) => s.invite_accepted_at).length
  const invitedCount = studentList.filter((s) => s.parent_email && !s.invite_accepted_at).length
  const noInviteCount = studentList.filter((s) => !s.parent_email).length

  const expectedCount = classData?.expected_student_count ?? null
  const missingCount = expectedCount !== null ? Math.max(0, expectedCount - studentList.length) : null
  const deadline = classData?.deadline ?? null
  const deadlineDays = deadline
    ? Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000)
    : null

  const hasAcceptedIncomplete = studentList.some((s) => s.invite_accepted_at)

  const [namePart] = classData?.name?.includes(' — ')
    ? classData.name.split(' — ')
    : [classData?.name ?? '']

  return (
    <div className="flex min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <ModeratorSidebar
        classId={classId}
        namePart={namePart}
        schoolYear={classData?.school_year ?? null}
        logoUrl={classData?.school_logo_url ?? null}
        active="students"
      />

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main className="md:ml-64 flex-1 min-w-0 p-4 pt-20 md:p-8 lg:p-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">
            Покани и участници
          </p>
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Участници
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Управлявайте списъка с участници и изпращайте покани на родителите.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mt-6 sm:flex sm:flex-wrap sm:gap-4">
            <div className="bg-white border border-gray-100 rounded-xl px-3 sm:px-5 py-3 flex items-center gap-2 sm:gap-3 shadow-sm">
              <span className="material-symbols-outlined text-slate-400 text-lg sm:text-xl">group</span>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Добавени</p>
                <p className="text-base sm:text-lg font-bold text-gray-800">
                  {studentList.length}{expectedCount !== null ? ` / ${expectedCount}` : ''}
                </p>
              </div>
            </div>
            <div className="bg-white border border-green-100 rounded-xl px-3 sm:px-5 py-3 flex items-center gap-2 sm:gap-3 shadow-sm">
              <span className="material-symbols-outlined text-green-500 text-lg sm:text-xl">how_to_reg</span>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Регистрирани</p>
                <p className="text-base sm:text-lg font-bold text-green-600">{registeredCount}</p>
              </div>
            </div>
            <div className="bg-white border border-amber-100 rounded-xl px-3 sm:px-5 py-3 flex items-center gap-2 sm:gap-3 shadow-sm">
              <span className="material-symbols-outlined text-amber-400 text-lg sm:text-xl">mail</span>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Поканени</p>
                <p className="text-base sm:text-lg font-bold text-amber-600">{invitedCount}</p>
              </div>
            </div>
            {noInviteCount > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl px-3 sm:px-5 py-3 flex items-center gap-2 sm:gap-3 shadow-sm">
                <span className="material-symbols-outlined text-gray-300 text-lg sm:text-xl">person_off</span>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Без покана</p>
                  <p className="text-base sm:text-lg font-bold text-gray-400">{noInviteCount}</p>
                </div>
              </div>
            )}
          </div>

          {/* Missing students warning + Deadline countdown */}
          {(missingCount !== null && missingCount > 0 || deadlineDays !== null) && (
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-4">
              {missingCount !== null && missingCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="material-symbols-outlined text-base">person_add</span>
                  Липсват още {missingCount} {missingCount === 1 ? 'участник' : 'участника'} за добавяне
                </div>
              )}
              {deadlineDays !== null && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
                  deadlineDays < 0
                    ? 'bg-red-100 text-red-700'
                    : deadlineDays <= 7
                      ? 'bg-red-100 text-red-700'
                      : deadlineDays <= 14
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className="material-symbols-outlined text-base">timer</span>
                  {deadlineDays < 0
                    ? 'Срокът изтече'
                    : deadlineDays === 0
                      ? 'Днес е крайният срок!'
                      : `${deadlineDays} дни до крайния срок`}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            {hasPendingInvites && (
              <form
                action={async () => {
                  'use server'
                  await sendAllInvites(classId)
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  Изпрати покана на всички
                </button>
              </form>
            )}
            {hasAcceptedIncomplete && <BulkReminderButton classId={classId} />}
          </div>
        </div>

        {/* Student list */}
        <StudentsBulkList
            classId={classId}
            students={studentList.map((student): StudentRowData => {
              const approved = approvedCountsMap[student.id] ?? 0
              const messages = approvedMessagesMap[student.id] ?? 0
              const allDone  = !!student.photo_url && approved >= 2 && messages >= 1
              return {
                id:               student.id,
                first_name:       student.first_name,
                last_name:        student.last_name,
                parent_email:     student.parent_email,
                registered_email: student.parent_user_id ? (registeredEmailMap[student.parent_user_id] ?? null) : null,
                photo_url:        student.photo_url,
                invite_accepted_at: student.invite_accepted_at,
                invite_token:     student.invite_token,
                approved,
                messages,
                total,
                initials: `${student.first_name.charAt(0)}${student.last_name.charAt(0)}`.toUpperCase(),
                allDone,
                statusBadge: student.invite_accepted_at ? 'registered'
                           : student.parent_email       ? 'invited'
                           : 'none',
              }
            })}
          />
      </main>
    </div>
  )
}
