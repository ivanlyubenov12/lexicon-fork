export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { QUESTION_PRESETS } from '@/lib/templates/defaultSeed'
import QuestionRow from './QuestionRow'
import AddQuestionForm from './AddQuestionForm'
import PresetQuestionsTab from './PresetQuestionsTab'

const TYPE_GROUPS = [
  { type: 'personal',        label: 'Въпроси за мен',        icon: 'person',            color: 'text-blue-500' },
  { type: 'video',           label: 'Видео въпроси',         icon: 'videocam',          color: 'text-rose-500' },
  { type: 'photo',           label: 'Въпроси — снимка',      icon: 'add_photo_alternate', color: 'text-teal-500' },
  { type: 'class_voice',     label: 'Анонимни въпроси',      icon: 'record_voice_over', color: 'text-amber-500' },
  { type: 'better_together', label: 'По-добри заедно',       icon: 'diversity_3',       color: 'text-green-500' },
  { type: 'superhero',       label: 'Супергерой',            icon: 'auto_awesome',      color: 'text-purple-500' },
]

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  noStore()
  const admin = createServiceRoleClient()
  const { tab = 'archive' } = await searchParams

  // ── Archive questions (no preset) ──────────────────────────────────────
  const { data: archiveQuestions } = await admin
    .from('questions')
    .select('id, text, type, order_index, is_system, voice_display, allows_media')
    .is('class_id', null)
    .eq('is_system', true)
    .is('preset', null)
    .order('order_index')

  // ── Preset questions ───────────────────────────────────────────────────
  const { data: allPresetQs } = await admin
    .from('questions')
    .select('id, text, description, type, allows_media, order_index, voice_display, is_featured, preset')
    .is('class_id', null)
    .eq('is_system', true)
    .not('preset', 'is', null)
    .order('order_index')

  const presetQuestions = new Map<string, typeof allPresetQs>()
  for (const q of allPresetQs ?? []) {
    const key = q.preset as string
    presetQuestions.set(key, [...(presetQuestions.get(key) ?? []), q])
  }

  const maxArchiveOrder = Math.max(0, ...(archiveQuestions ?? []).map(q => q.order_index))

  const tabs = [
    { id: 'archive', label: 'Архив' },
    ...QUESTION_PRESETS.map(p => ({ id: p.id, label: p.label })),
  ]

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Администрация</p>
        <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
          Въпросници
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Архивни въпроси за модераторите и дефолтни шаблони по клас.
        </p>
      </div>

      {/* Tab strip */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-2xl p-1 w-fit">
        {tabs.map(t => (
          <a
            key={t.id}
            href={`?tab=${t.id}`}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {/* ── Archive tab ──────────────────────────────────────────────── */}
      {tab === 'archive' && (
        <div className="space-y-6">
          {TYPE_GROUPS.map(({ type, label, icon, color }) => {
            const typeQuestions = (archiveQuestions ?? []).filter(q => q.type === type)
            return (
              <div key={type} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                  <span className={`material-symbols-outlined ${color}`} style={{ fontSize: 18 }}>{icon}</span>
                  <h2 className="font-bold text-gray-800 text-sm">{label}</h2>
                  <span className="ml-auto text-xs text-gray-400">{typeQuestions.length} въпроса</span>
                </div>
                {typeQuestions.length > 0 ? (
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {typeQuestions.map((q) => (
                        <QuestionRow
                          key={q.id}
                          id={q.id}
                          text={q.text}
                          type={q.type}
                          orderIndex={q.order_index}
                          voiceDisplay={(q as { voice_display?: string }).voice_display ?? null}
                          allowsMedia={(q as { allows_media?: boolean }).allows_media ?? false}
                        />
                      ))}
                    </tbody>
                  </table>
                  </div>
                ) : (
                  <p className="px-6 py-5 text-xs text-gray-400 italic">Няма въпроси от този тип.</p>
                )}
              </div>
            )
          })}

          <AddQuestionForm nextOrder={maxArchiveOrder + 1} />
        </div>
      )}

      {/* ── Preset tabs ───────────────────────────────────────────────── */}
      {QUESTION_PRESETS.map(preset => tab === preset.id && (
        <div key={preset.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50 bg-gray-50/30">
            <span className="material-symbols-outlined text-indigo-500" style={{ fontSize: 18 }}>school</span>
            <h2 className="font-bold text-gray-800 text-sm">Дефолтен въпросник — {preset.label}</h2>
            <span className="ml-auto text-xs text-gray-400">
              {(presetQuestions.get(preset.id) ?? []).length} въпроса
            </span>
          </div>
          <PresetQuestionsTab
            preset={preset.id}
            initialQuestions={(presetQuestions.get(preset.id) ?? []).map(q => ({
              id: q.id,
              text: q.text,
              description: (q as { description?: string | null }).description ?? null,
              type: q.type as 'personal' | 'class_voice' | 'better_together' | 'superhero' | 'video',
              allows_media: (q as { allows_media?: boolean }).allows_media ?? false,
              order_index: q.order_index,
              voice_display: (q as { voice_display?: string | null }).voice_display ?? null,
              is_featured: (q as { is_featured?: boolean }).is_featured ?? false,
            }))}
          />
        </div>
      ))}
    </div>
  )
}
