export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ModeratorQuestionnairePage({
  params,
}: {
  params: Promise<{ classId: string; studentId: string }>
}) {
  noStore()
  const { classId, studentId } = await params
  const admin = createServiceRoleClient()

  const { data: student } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url, class_id')
    .eq('id', studentId)
    .eq('class_id', classId)
    .single()

  if (!student) notFound()

  // Only questions the moderator explicitly added to this class
  const { data: allClassQuestions } = await admin
    .from('questions')
    .select('id, text, order_index, allows_text, allows_media, type')
    .eq('class_id', classId)
    .order('order_index')

  const personalQuestions = (allClassQuestions ?? []).filter(q => q.type === 'personal')
  const classQuestions = (allClassQuestions ?? []).filter(q =>
    ['superhero', 'better_together', 'video'].includes(q.type)
  )

  // All answers for this student
  const { data: answers } = await admin
    .from('answers')
    .select('question_id, status, text_content, media_url, media_type')
    .eq('student_id', studentId)

  const answerMap = new Map((answers ?? []).map((a) => [a.question_id, a]))

  const allQuestions = [...personalQuestions, ...classQuestions]
  const total = allQuestions.length
  const approved = allQuestions.filter((q) => answerMap.get(q.id)?.status === 'approved').length
  const submitted = allQuestions.filter((q) => answerMap.get(q.id)?.status === 'submitted').length
  const empty = total - approved - submitted

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif' }}>
      {/* Banner */}
      <div className="bg-indigo-700 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-[100]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-indigo-300 text-base">assignment</span>
          <span className="text-sm font-semibold">
            Въпросник — <span className="text-indigo-200">{student.first_name} {student.last_name}</span>
          </span>
          <span className="text-xs text-indigo-300 bg-indigo-600 px-2 py-0.5 rounded-full">
            Преглед на модератор
          </span>
        </div>
        <Link
          href={`/moderator/${classId}/students`}
          className="flex items-center gap-1.5 text-sm text-indigo-200 hover:text-white transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Назад
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Student header */}
        <div className="flex items-center gap-4 mb-8">
          {student.photo_url ? (
            <img src={student.photo_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
              {student.first_name[0]}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-800">{student.first_name} {student.last_name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Въпросник на родителя</p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Прогрес</span>
            <span className="text-xs font-semibold text-indigo-600">{approved} / {total} одобрени</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all"
              style={{ width: `${total > 0 ? (approved / total) * 100 : 0}%` }}
            />
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {approved} одобрени
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              {submitted} за преглед
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              {empty} без отговор
            </span>
          </div>
        </div>

        {/* Personal questions */}
        {personalQuestions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">
              Въпроси към мен ({personalQuestions.length})
            </h2>
            <div className="space-y-2">
              {personalQuestions.map((q) => {
                const ans = answerMap.get(q.id)
                return (
                  <div key={q.id} className="bg-white rounded-xl border border-gray-200 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <StatusDot status={ans?.status} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 mb-1">{q.text}</p>
                        {ans?.text_content && (
                          <p className="text-sm text-gray-500 italic truncate">„{ans.text_content}"</p>
                        )}
                        {ans?.media_url && (
                          <span className="text-xs text-indigo-500 flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-xs">
                              {ans.media_type === 'video' ? 'videocam' : ans.media_type === 'audio' ? 'mic' : 'image'}
                            </span>
                            Медия качена
                          </span>
                        )}
                      </div>
                      <StatusBadge status={ans?.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Class questions */}
        {classQuestions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">
              Въпроси за класа ({classQuestions.length})
            </h2>
            <div className="space-y-2">
              {classQuestions.map((q) => {
                const ans = answerMap.get(q.id)
                return (
                  <div key={q.id} className="bg-white rounded-xl border border-gray-200 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <StatusDot status={ans?.status} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 mb-1">{q.text}</p>
                        {ans?.text_content && (
                          <p className="text-sm text-gray-500 italic truncate">„{ans.text_content}"</p>
                        )}
                        {ans?.media_url && (
                          <span className="text-xs text-indigo-500 flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-xs">
                              {ans.media_type === 'video' ? 'videocam' : ans.media_type === 'audio' ? 'mic' : 'image'}
                            </span>
                            Медия качена
                          </span>
                        )}
                      </div>
                      <StatusBadge status={ans?.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}

function StatusDot({ status }: { status?: string }) {
  if (status === 'approved') return <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
  if (status === 'submitted') return <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 flex-shrink-0 mt-1.5" />
  return <span className="w-2.5 h-2.5 rounded-full bg-gray-300 flex-shrink-0 mt-1.5" />
}

function StatusBadge({ status }: { status?: string }) {
  if (status === 'approved') return (
    <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">Одобрен</span>
  )
  if (status === 'submitted') return (
    <span className="text-xs bg-yellow-50 text-yellow-700 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">За преглед</span>
  )
  return (
    <span className="text-xs bg-gray-50 text-gray-400 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">Без отговор</span>
  )
}
