export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendAllInvites } from '../actions'
import ModeratorSidebar from '../ModeratorSidebar'
import StudentActions from './StudentActions'

interface StudentRow {
  id: string
  first_name: string
  last_name: string
  parent_email: string | null
  photo_url: string | null
  invite_accepted_at: string | null
  invite_token: string
}

export default async function StudentsPage({ params }: { params: { classId: string } }) {
  noStore()
  const { classId } = params
  const supabase = createServiceRoleClient()

  const { data: classData } = await supabase
    .from('classes')
    .select('id, name, school_year, school_logo_url')
    .eq('id', classId)
    .single()

  const { data: students } = await supabase
    .from('students')
    .select('id, first_name, last_name, parent_email, photo_url, invite_accepted_at, invite_token')
    .eq('class_id', classId)
    .order('last_name', { ascending: true })

  const studentList: StudentRow[] = students ?? []

  const { count: totalQuestions } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .or(`class_id.is.null,class_id.eq.${classId}`)
    .in('type', ['personal', 'superhero', 'better_together'])

  const total = totalQuestions ?? 0

  const studentIds = studentList.map((s) => s.id)
  const approvedCountsMap: Record<string, number> = {}

  if (studentIds.length > 0) {
    const { data: approvedAnswers } = await supabase
      .from('answers')
      .select('student_id')
      .eq('status', 'approved')
      .in('student_id', studentIds)

    for (const row of approvedAnswers ?? []) {
      approvedCountsMap[row.student_id] = (approvedCountsMap[row.student_id] ?? 0) + 1
    }
  }

  const hasPendingInvites = studentList.some((s) => s.parent_email && !s.invite_accepted_at)

  const registeredCount = studentList.filter((s) => s.invite_accepted_at).length
  const invitedCount = studentList.filter((s) => s.parent_email && !s.invite_accepted_at).length
  const noInviteCount = studentList.filter((s) => !s.parent_email).length

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
      <main className="ml-64 flex-1 p-8 lg:p-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">
            Покани и деца
          </p>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1
                className="text-4xl font-bold text-gray-900 leading-tight"
                style={{ fontFamily: 'Noto Serif, serif' }}
              >
                Деца в класа
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Управлявайте списъка с деца и изпращайте покани на родителите.
              </p>
            </div>
            <Link
              href={`/moderator/${classId}/students/new`}
              className="flex-shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow transition-colors"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              Добави дете
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex gap-4 mt-6">
            <div className="bg-white border border-gray-100 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-slate-400 text-xl">group</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Общо</p>
                <p className="text-lg font-bold text-gray-800">{studentList.length}</p>
              </div>
            </div>
            <div className="bg-white border border-green-100 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-green-500 text-xl">how_to_reg</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Регистрирани</p>
                <p className="text-lg font-bold text-green-600">{registeredCount}</p>
              </div>
            </div>
            <div className="bg-white border border-amber-100 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-amber-400 text-xl">mail</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Поканени</p>
                <p className="text-lg font-bold text-amber-600">{invitedCount}</p>
              </div>
            </div>
            {noInviteCount > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
                <span className="material-symbols-outlined text-gray-300 text-xl">person_off</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Без покана</p>
                  <p className="text-lg font-bold text-gray-400">{noInviteCount}</p>
                </div>
              </div>
            )}
          </div>

          {/* Send all invites */}
          {hasPendingInvites && (
            <form
              action={async () => {
                'use server'
                await sendAllInvites(classId)
              }}
              className="mt-4"
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
        </div>

        {/* Student list */}
        {studentList.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-200 block mb-3">group</span>
            <p className="text-gray-500 text-sm font-medium">Няма добавени деца</p>
            <p className="text-gray-400 text-xs mt-1">Натиснете „Добави дете", за да започнете.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {studentList.map((student) => {
              const approved = approvedCountsMap[student.id] ?? 0
              const progress = total > 0 ? Math.round((approved / total) * 100) : 0
              const initials = `${student.first_name.charAt(0)}${student.last_name.charAt(0)}`.toUpperCase()

              let statusBadge: React.ReactNode
              if (student.invite_accepted_at) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-green-100 text-green-700">
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>how_to_reg</span>
                    Регистриран
                  </span>
                )
              } else if (student.parent_email) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>mail</span>
                    Поканен
                  </span>
                )
              } else {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-500">
                    Без покана
                  </span>
                )
              }

              return (
                <div
                  key={student.id}
                  className="bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-5">
                    {/* Avatar */}
                    {student.photo_url ? (
                      <img
                        src={student.photo_url}
                        alt={`${student.first_name} ${student.last_name}`}
                        className="w-11 h-11 rounded-full object-cover flex-shrink-0 border border-gray-100"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                        {initials}
                      </div>
                    )}

                    {/* Name + email */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {student.parent_email ?? 'Без имейл на родителя'}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className="flex-shrink-0">
                      {statusBadge}
                    </div>

                    {/* Progress */}
                    <div className="flex-shrink-0 w-36">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Отговори</span>
                        <span className="text-xs font-semibold text-gray-600">{approved}/{total}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0">
                      <StudentActions
                        studentId={student.id}
                        parentEmail={student.parent_email}
                        inviteAccepted={!!student.invite_accepted_at}
                        classId={classId}
                        inviteToken={student.invite_token}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
