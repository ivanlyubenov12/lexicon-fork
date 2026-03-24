export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'
import QuestionRow from './QuestionRow'
import AddQuestionForm from './AddQuestionForm'

const TYPE_GROUPS = [
  { type: 'personal',        label: 'Лични въпроси',        icon: 'person',          color: 'text-blue-500' },
  { type: 'better_together', label: 'По-добри заедно',       icon: 'diversity_3',     color: 'text-green-500' },
  { type: 'superhero',       label: 'Супергерой',            icon: 'auto_awesome',    color: 'text-purple-500' },
  { type: 'class_voice',     label: 'Гласът на класа',       icon: 'record_voice_over', color: 'text-amber-500' },
  { type: 'video',           label: 'Видео въпроси',         icon: 'videocam',        color: 'text-rose-500' },
]

export default async function AdminQuestionsPage() {
  noStore()
  const admin = createServiceRoleClient()

  const { data: questions } = await admin
    .from('questions')
    .select('id, text, type, order_index, is_system')
    .is('class_id', null)
    .eq('is_system', true)
    .order('order_index')

  const questionsByType = new Map<string, typeof questions>()
  for (const q of questions ?? []) {
    const existing = questionsByType.get(q.type) ?? []
    questionsByType.set(q.type, [...existing, q])
  }

  const maxOrder = Math.max(0, ...(questions ?? []).map(q => q.order_index))

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Администрация</p>
        <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
          Системни въпроси
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Тези въпроси са шаблонът, от който модераторите избират при настройка на класа.
          {' '}{(questions ?? []).length} въпроса общо.
        </p>
      </div>

      <div className="space-y-6">
        {TYPE_GROUPS.map(({ type, label, icon, color }) => {
          const typeQuestions = questionsByType.get(type) ?? []
          return (
            <div key={type} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                <span className={`material-symbols-outlined ${color}`} style={{ fontSize: 18 }}>{icon}</span>
                <h2 className="font-bold text-gray-800 text-sm">{label}</h2>
                <span className="ml-auto text-xs text-gray-400">{typeQuestions.length} въпроса</span>
              </div>
              {typeQuestions.length > 0 ? (
                <table className="w-full text-sm">
                  <tbody>
                    {typeQuestions.map((q) => (
                      <QuestionRow
                        key={q.id}
                        id={q.id}
                        text={q.text}
                        type={q.type}
                        orderIndex={q.order_index}
                      />
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-6 py-5 text-xs text-gray-400 italic">Няма въпроси от този тип.</p>
              )}
            </div>
          )
        })}

        <AddQuestionForm nextOrder={maxOrder + 1} />
      </div>
    </div>
  )
}
