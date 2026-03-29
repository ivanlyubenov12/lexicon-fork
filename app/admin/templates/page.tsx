export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { QUESTION_PRESETS } from '@/lib/templates/defaultSeed'
import { themes } from '@/lib/templates/themes'
import { BG_PATTERN_OPTIONS } from '@/lib/lexicon/bgPatterns'
import { updateTemplateDefault, updateTemplateLabels } from './actions'

const PRESET_META: Record<string, { emoji: string; description: string }> = {
  primary:      { emoji: '📚', description: 'За ученици от 1 до 4 клас' },
  kindergarten: { emoji: '🧸', description: 'За деца от детска градина' },
  teens:        { emoji: '🎓', description: 'За ученици от 5 до 12 клас' },
  sports:       { emoji: '⚽', description: 'За спортен отбор' },
  friends:      { emoji: '👥', description: 'За приятелска група' },
}

export default async function AdminTemplatesPage() {
  noStore()
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/login')

  const admin = createServiceRoleClient()
  const { data: defaults } = await admin
    .from('template_defaults')
    .select('preset_id, theme_id, bg_pattern, member_label, group_label, memories_label')

  const defaultsMap: Record<string, {
    theme_id: string; bg_pattern: string
    member_label: string; group_label: string; memories_label: string
  }> = {}
  for (const row of defaults ?? []) {
    defaultsMap[row.preset_id] = {
      theme_id: row.theme_id,
      bg_pattern: row.bg_pattern,
      member_label: row.member_label ?? 'Ученик',
      group_label: row.group_label ?? 'Клас',
      memories_label: row.memories_label ?? 'Нашите спомени',
    }
  }

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">Админ</p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
          Темплейти по подразбиране
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Задайте цветова палитра, фон и терминология по подразбиране за всеки тип лексикон.
          Учителите могат да ги overrideват за своя лексикон.
        </p>
      </div>

      <div className="space-y-8 max-w-3xl">
        {QUESTION_PRESETS.map(preset => {
          const meta = PRESET_META[preset.id]
          const current = defaultsMap[preset.id] ?? {
            theme_id: 'classic', bg_pattern: 'school',
            member_label: 'Ученик', group_label: 'Клас', memories_label: 'Нашите спомени',
          }
          const themeList = Object.values(themes)
          const bgList = BG_PATTERN_OPTIONS

          return (
            <div key={preset.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Preset header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <span className="text-3xl leading-none">{meta.emoji}</span>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">{preset.label}</h2>
                  <p className="text-sm text-gray-500">{meta.description}</p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Terminology labels */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Терминология</h3>
                  <form action={updateTemplateLabels.bind(null, preset.id, '', '', '')} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Един член (ед.ч.)</label>
                      <input
                        name="memberLabel"
                        defaultValue={current.member_label}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Ученик"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Групата (ед.ч.)</label>
                      <input
                        name="groupLabel"
                        defaultValue={current.group_label}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Клас"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Секция спомени</label>
                      <input
                        name="memoriesLabel"
                        defaultValue={current.memories_label}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Нашите спомени"
                      />
                    </div>
                    <div className="sm:col-span-3 flex justify-end">
                      <LabelsSubmitButton preset={preset.id} current={current} />
                    </div>
                  </form>
                </div>

                {/* Theme picker */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Цветова палитра</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {themeList.map(theme => {
                      const isActive = current.theme_id === theme.id
                      return (
                        <form key={theme.id} action={updateTemplateDefault.bind(null, preset.id, theme.id, current.bg_pattern)}>
                          <button
                            type="submit"
                            className={`w-full rounded-xl border-2 overflow-hidden transition-all hover:shadow-md ${
                              isActive ? 'border-indigo-500 shadow-sm' : 'border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            <div
                              className={`h-10 w-full ${theme.previewBg}`}
                              style={{ background: theme.vars['--lex-hero-grad'] }}
                            />
                            <div className="px-2 py-1.5 text-center">
                              <span className={`text-xs font-semibold ${isActive ? 'text-indigo-700' : 'text-gray-600'}`}>
                                {theme.name}
                              </span>
                            </div>
                          </button>
                        </form>
                      )
                    })}
                  </div>
                </div>

                {/* Background picker */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Фон</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {bgList.map(opt => {
                      const isActive = current.bg_pattern === opt.id
                      return (
                        <form key={opt.id} action={updateTemplateDefault.bind(null, preset.id, current.theme_id, opt.id)}>
                          <button
                            type="submit"
                            className={`w-full text-left rounded-xl border-2 overflow-hidden transition-all hover:shadow-md ${
                              isActive ? 'border-indigo-500 shadow-sm' : 'border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            <div className={`h-10 w-full ${opt.previewClass} flex items-center justify-center`}>
                              {opt.id === 'school' && <span className="text-lg opacity-60">✏️📐</span>}
                              {opt.id === 'kindergarten' && <span className="text-lg opacity-60">🧸🌈</span>}
                              {opt.id === 'teens' && <span className="text-lg opacity-60">🎓💻</span>}
                              {opt.id === 'none' && <span className="text-sm opacity-30 font-medium text-gray-400">Аа</span>}
                            </div>
                            <div className="px-2 py-1.5">
                              <span className={`text-xs font-semibold block ${isActive ? 'text-indigo-700' : 'text-gray-600'}`}>
                                {opt.name}
                              </span>
                            </div>
                          </button>
                        </form>
                      )
                    })}
                  </div>
                </div>

                {/* Questions link */}
                <div className="pt-2 border-t border-gray-100">
                  <a
                    href={`/admin/questions?preset=${preset.id}`}
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline font-medium"
                  >
                    <span className="material-symbols-outlined text-base">quiz</span>
                    Редактирай въпросите за {preset.label.toLowerCase()}
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Server actions can't read form data when bound with .bind(), so we use a small wrapper
// that reads the form fields properly via a hidden-field approach
function LabelsSubmitButton({ preset, current }: {
  preset: string
  current: { theme_id: string; bg_pattern: string; member_label: string; group_label: string; memories_label: string }
}) {
  async function submitLabels(formData: FormData) {
    'use server'
    const { redirect } = await import('next/navigation')
    const { createServerClient, createServiceRoleClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/login')
    const admin = createServiceRoleClient()
    await admin.from('template_defaults').update({
      member_label:   (formData.get('memberLabel') as string) || current.member_label,
      group_label:    (formData.get('groupLabel') as string) || current.group_label,
      memories_label: (formData.get('memoriesLabel') as string) || current.memories_label,
    }).eq('preset_id', preset)
    redirect('/admin/templates')
  }

  return (
    <button
      type="submit"
      formAction={submitLabels}
      className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
    >
      Запази терминология
    </button>
  )
}
