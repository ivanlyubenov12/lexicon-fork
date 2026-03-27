import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { QUESTION_PRESETS } from '@/lib/templates/defaultSeed'
import { applyTemplate } from './actions'
import Link from 'next/link'

const PRESET_META: Record<string, { emoji: string; description: string; examples: string[] }> = {
  primary: {
    emoji: '📚',
    description: 'За ученици от 1 до 4 клас',
    examples: ['Любим предмет', 'Тайна суперсила', 'Мечта за бъдещето'],
  },
  kindergarten: {
    emoji: '🧸',
    description: 'За деца от детска градина',
    examples: ['Любима играчка', 'Любимо животно', 'Любима приказка'],
  },
  teens: {
    emoji: '🎓',
    description: 'За ученици от 5 до 12 клас',
    examples: ['Бъдеща кариера', 'Неща, от които ме е срам', 'Съвет към 5-годишния мен'],
  },
}

export default async function TemplatePickerPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()
  const { data: cls } = await admin
    .from('classes')
    .select('id, name, template_id')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()
  if (!cls) redirect('/moderator')

  const [namePart] = cls.name.includes(' — ')
    ? cls.name.split(' — ')
    : [cls.name]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        {/* Back */}
        <Link
          href={`/moderator/${classId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Назад към таблото
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">Стъпка 3</p>
          <h1 className="text-2xl font-bold text-gray-900">Избери шаблон за {namePart}</h1>
          <p className="text-gray-500 text-sm mt-2">
            Шаблонът определя въпросника и оформлението на лексикона. Можеш да го промениш по-късно.
          </p>
        </div>

        {/* Preset cards */}
        <div className="space-y-4">
          {QUESTION_PRESETS.map((preset) => {
            const meta = PRESET_META[preset.id]
            const isActive = cls.template_id === preset.id
            return (
              <form
                key={preset.id}
                action={applyTemplate.bind(null, classId, preset.id)}
              >
                <button
                  type="submit"
                  className={`w-full text-left bg-white border-2 rounded-2xl p-6 flex items-start gap-5 hover:border-indigo-400 hover:shadow-md transition-all group ${
                    isActive ? 'border-indigo-500 shadow-sm' : 'border-gray-200'
                  }`}
                >
                  <span className="text-4xl leading-none mt-0.5">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-base">{preset.label}</span>
                      {isActive && (
                        <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          Текущ
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{meta.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {meta.examples.map((ex) => (
                        <span
                          key={ex}
                          className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-indigo-500 transition-colors mt-1 flex-shrink-0">
                    arrow_forward
                  </span>
                </button>
              </form>
            )
          })}
        </div>
      </div>
    </div>
  )
}
