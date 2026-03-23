// Route: /moderator/[classId]/students — M3: Student list
export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendAllInvites } from '../actions'
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

  const { data: students } = await supabase
    .from('students')
    .select('id, first_name, last_name, parent_email, photo_url, invite_accepted_at, invite_token')
    .eq('class_id', classId)
    .order('last_name', { ascending: true })

  const studentList: StudentRow[] = students ?? []

  // Total question count for this class (system + class-specific, all answerable types)
  const { count: totalQuestions } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .or(`class_id.is.null,class_id.eq.${classId}`)
    .in('type', ['personal', 'superhero', 'better_together'])

  const total = totalQuestions ?? 0

  // Fetch approved answer counts per student
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

  const hasPendingInvites = studentList.some(
    (s) => s.parent_email && !s.invite_accepted_at
  )

  function getInitials(firstName: string, lastName: string) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  function getStatusBadge(student: StudentRow) {
    if (student.invite_accepted_at) {
      return (
        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
          Регистриран
        </span>
      )
    }
    if (student.parent_email) {
      return (
        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
          Поканен
        </span>
      )
    }
    return (
      <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-medium">
        Без покана
      </span>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href={`/moderator/${classId}`}
        className="text-sm text-gray-500 hover:text-gray-700 inline-block mb-6"
      >
        ← Към dashboard
      </Link>

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Деца в класа</h1>
        <Link
          href={`/moderator/${classId}/students/new`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Добави дете
        </Link>
      </div>

      {/* Send all invites button */}
      {hasPendingInvites && (
        <form
          action={async () => {
            'use server'
            await sendAllInvites(classId)
          }}
          className="mb-6"
        >
          <button
            type="submit"
            className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50"
          >
            Изпрати покана на всички
          </button>
        </form>
      )}

      {/* Empty state */}
      {studentList.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          Няма добавени деца. Добавете първото дете.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 bg-gray-50">
                  Снимка
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 bg-gray-50">
                  Име и фамилия
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 bg-gray-50">
                  Имейл на родителя
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 bg-gray-50">
                  Статус
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 bg-gray-50">
                  Прогрес
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 bg-gray-50">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {studentList.map((student) => (
                <tr key={student.id} className="border-t border-gray-100">
                  {/* Photo */}
                  <td className="px-4 py-3">
                    {student.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={student.photo_url}
                        alt={`${student.first_name} ${student.last_name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold">
                        {getInitials(student.first_name, student.last_name)}
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {student.first_name} {student.last_name}
                  </td>

                  {/* Parent email */}
                  <td className="px-4 py-3 text-gray-500">
                    {student.parent_email ?? '—'}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">{getStatusBadge(student)}</td>

                  {/* Progress */}
                  <td className="px-4 py-3 text-gray-700">
                    {approvedCountsMap[student.id] ?? 0} / {total}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <StudentActions
                      studentId={student.id}
                      parentEmail={student.parent_email}
                      inviteAccepted={!!student.invite_accepted_at}
                      classId={classId}
                      inviteToken={student.invite_token}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
