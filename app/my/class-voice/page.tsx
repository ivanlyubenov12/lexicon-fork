export const dynamic = 'force-dynamic'

// Route: /my/class-voice — P5: Anonymous class voice answers
// 3–5 questions · text only · one answer per question · cannot edit after submit
// Results only visible in the final published product
// Only accessible while class status is not: draft

import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import ClassVoiceSection from '../[studentId]/ClassVoiceSection'

export default async function ClassVoicePage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: student } = await admin
    .from('students')
    .select('id, first_name, class_id')
    .eq('parent_user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!student) redirect('/login')

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, status')
    .eq('id', student.class_id)
    .single()

  if (!classData || classData.status === 'draft') notFound()

  const { data: questions } = await admin
    .from('questions')
    .select('id, text, order_index')
    .eq('class_id', student.class_id)
    .eq('type', 'survey')
    .order('order_index')

  const voiceQuestions = questions ?? []

  const [namePart] = classData.name.includes(' — ')
    ? classData.name.split(' — ')
    : [classData.name]

  return (
    <div className="min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="max-w-lg mx-auto px-6 py-10">

        {/* Back link */}
        <Link
          href={`/my/${student.id}`}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Назад
        </Link>

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">
            {namePart}
          </p>
          <h1
            className="text-3xl font-bold text-gray-900 leading-tight mb-3"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Гласът на класа
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Отговорете анонимно на въпросите по-долу. Отговорите ви ще бъдат видими само в
            публикувания лексикон — никой не знае кой какво е написал.
          </p>
          <div className="flex items-center gap-2 mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
            <span className="material-symbols-outlined text-base">lock</span>
            Анонимно · не може да се редактира след изпращане
          </div>
        </div>

        {voiceQuestions.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-200 block mb-3">mic_off</span>
            <p className="text-sm text-gray-500">Няма активни въпроси в момента.</p>
          </div>
        ) : (
          <ClassVoiceSection classId={student.class_id} studentId={student.id} questions={voiceQuestions} />
        )}

      </div>
    </div>
  )
}
