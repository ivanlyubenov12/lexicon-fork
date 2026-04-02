export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import ModeratorSidebar from '../ModeratorSidebar'
import Link from 'next/link'
import { QUESTION_PRESETS } from '@/lib/templates/defaultSeed'
import TemplateAccordion from './TemplateAccordion'
import { updateBgPattern } from './bgActions'
import { updateTheme, updateLabels } from './themeActions'
import { BG_PATTERN_OPTIONS } from '@/lib/lexicon/bgPatterns'
import { themes } from '@/lib/templates/themes'
import LexiconAccordion from './LexiconAccordion'
import ClassSettingsForm from './ClassSettingsForm'

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
  sports: {
    emoji: '⚽',
    description: 'За спортен отбор',
    examples: ['Любима позиция', 'Тайна суперсила на терена', 'Мечтан клуб'],
  },
  friends: {
    emoji: '👥',
    description: 'За приятелска група',
    examples: ['Как се запознахме', 'Тайна суперсила', 'Най-смешен спомен'],
  },
}

export default async function LexiconPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, school_logo_url, cover_image_url, teacher_name, deadline, template_id, theme_id, bg_pattern, layout, is_customized, member_label, group_label, memories_label, stars_label')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()

  if (!classData) redirect('/moderator')

  const [namePart] = classData.name.includes(' — ')
    ? classData.name.split(' — ')
    : [classData.name]

  const isCustomActive = !!(classData as any).is_customized
  const activeThemeId  = classData.theme_id ?? 'classic'
  const activeBgId     = classData.bg_pattern ?? 'school'
  const memberLabel    = (classData as any).member_label ?? ''
  const groupLabel     = (classData as any).group_label ?? ''
  const memoriesLabel  = (classData as any).memories_label ?? ''
  const starsLabel     = (classData as any).stars_label ?? ''

  return (
    <div className="flex min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <ModeratorSidebar
        classId={classId}
        namePart={namePart}
        schoolYear={classData.school_year ?? null}
        logoUrl={classData.school_logo_url ?? null}
        active="lexicon"
      />

      <main className="md:ml-64 flex-1 min-w-0 p-4 pt-20 md:p-8 lg:p-12">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-lg font-bold text-gray-800">Настройки</h1>
          <Link
            href={`/moderator/${classId}/layout`}
            className="flex-shrink-0 flex items-center gap-2 bg-white border border-gray-200 hover:border-indigo-400 hover:text-indigo-700 text-gray-600 text-sm font-semibold px-3 py-2 rounded-xl shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">tune</span>
            Оформление
          </Link>
        </div>

        <div className="space-y-4">

          {/* ── Основни данни ──────────────────────────────────────────── */}
          <LexiconAccordion title="Основни данни" icon="edit_note" defaultOpen={false}>
            <ClassSettingsForm
              classId={classId}
              initialName={classData.name}
              initialSchoolYear={classData.school_year ?? ''}
              initialTeacherName={(classData as any).teacher_name ?? ''}
              initialLogoUrl={classData.school_logo_url ?? null}
              initialCoverUrl={(classData as any).cover_image_url ?? null}
              initialDeadline={(classData as any).deadline ?? null}
              templateId={classData.template_id ?? null}
            />
          </LexiconAccordion>

          {/* ── Шаблон ─────────────────────────────────────────────────── */}
          <LexiconAccordion title="Шаблон" icon="style">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Шаблонът определя въпросника. Избраният шаблон може да се донастрои с цветова палитра и фон.
              </p>
              <TemplateAccordion
                classId={classId}
                presets={QUESTION_PRESETS.map(p => ({
                  id: p.id,
                  label: p.label,
                  emoji: PRESET_META[p.id]?.emoji ?? '',
                  description: PRESET_META[p.id]?.description ?? '',
                  examples: PRESET_META[p.id]?.examples ?? [],
                }))}
                activePresetId={classData.template_id ?? null}
                isCustomized={isCustomActive}
              />

              {/* По поръчка */}
              <div className={`bg-white border-2 rounded-2xl overflow-hidden transition-all ${
                isCustomActive ? 'border-indigo-500 shadow-md' : 'border-dashed border-gray-200'
              }`}>
                <div className="p-4 sm:p-6 flex items-start gap-4 sm:gap-5">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 transition-colors ${
                    isCustomActive ? 'border-indigo-600' : 'border-gray-300'
                  }`}>
                    {isCustomActive && <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                  </span>
                  <span className="text-4xl leading-none mt-0.5">✏️</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-base">По поръчка</span>
                      {isCustomActive && (
                        <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Текущ</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {isCustomActive
                        ? `Базиран на „${PRESET_META[classData.template_id ?? 'primary']?.emoji} ${QUESTION_PRESETS.find(p => p.id === classData.template_id)?.label ?? classData.template_id}" с персонализирани промени.`
                        : 'Направи промяна в цветовата палитра, фона, въпросника или наредбата на блоковете — шаблонът автоматично ще стане „По поръчка".'}
                    </p>
                  </div>
                </div>

                {isCustomActive && (
                  <div className="border-t border-indigo-100 bg-indigo-50/40 px-4 sm:px-6 py-5 space-y-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Цветова палитра</p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {Object.values(themes).map(theme => {
                          const sel     = activeThemeId === theme.id
                          const primary = (theme.vars as Record<string, string>)['--lex-primary']
                          const bg      = (theme.vars as Record<string, string>)['--lex-bg']
                          const accent  = (theme.vars as Record<string, string>)['--lex-accent']
                          return (
                            <form key={theme.id} action={updateTheme.bind(null, classId, theme.id)}>
                              <button type="submit" title={theme.name}
                                className={`w-full rounded-xl border-2 overflow-hidden transition-all hover:shadow-md ${
                                  sel ? 'border-indigo-500 shadow-sm' : 'border-gray-200 hover:border-indigo-300'
                                }`}
                              >
                                <div className="h-10 w-full flex items-end px-2 pb-1.5 gap-1" style={{ backgroundColor: bg }}>
                                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: primary }} />
                                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                                  <div className="flex-1 h-1.5 rounded-full opacity-20" style={{ backgroundColor: primary }} />
                                </div>
                                <div className="px-2 py-1.5 text-center">
                                  <span className="text-xs font-semibold text-gray-700">{theme.name}</span>
                                </div>
                              </button>
                            </form>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Фон</p>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {BG_PATTERN_OPTIONS.map(opt => {
                          const sel = activeBgId === opt.id
                          return (
                            <form key={opt.id} action={updateBgPattern.bind(null, classId, opt.id)}>
                              <button type="submit" title={opt.name}
                                className={`w-full rounded-xl border-2 overflow-hidden transition-all hover:shadow-md ${
                                  sel ? 'border-indigo-500 shadow-sm' : 'border-gray-200 hover:border-indigo-300'
                                }`}
                              >
                                <div className={`h-10 w-full ${opt.previewClass} flex items-center justify-center`}>
                                  {opt.id === 'school'       && <span className="text-base opacity-70">✏️📐</span>}
                                  {opt.id === 'kindergarten' && <span className="text-base opacity-70">🧸🌈</span>}
                                  {opt.id === 'teens'        && <span className="text-base opacity-70">🎓💻</span>}
                                  {opt.id === 'levski'       && <span className="text-base opacity-70">⚽⭐</span>}
                                  {opt.id === 'none'         && <span className="text-sm opacity-30 font-medium text-gray-400">Аа</span>}
                                </div>
                                <div className="px-2 py-1.5 text-center">
                                  <span className="text-xs font-semibold text-gray-700">{opt.name}</span>
                                </div>
                              </button>
                            </form>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Терминология</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <form action={async (fd: FormData) => {
                          'use server'
                          await updateLabels(classId, { member_label: fd.get('v') as string || null as any })
                        }}>
                          <label className="block text-xs text-gray-500 mb-1">Един член</label>
                          <div className="flex gap-1">
                            <input name="v" defaultValue={memberLabel} placeholder="напр. Ученик"
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                            <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                              <span className="material-symbols-outlined text-sm">check</span>
                            </button>
                          </div>
                        </form>
                        <form action={async (fd: FormData) => {
                          'use server'
                          await updateLabels(classId, { group_label: fd.get('v') as string || null as any })
                        }}>
                          <label className="block text-xs text-gray-500 mb-1">Групата</label>
                          <div className="flex gap-1">
                            <input name="v" defaultValue={groupLabel} placeholder="напр. Класа"
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                            <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                              <span className="material-symbols-outlined text-sm">check</span>
                            </button>
                          </div>
                        </form>
                        <form action={async (fd: FormData) => {
                          'use server'
                          await updateLabels(classId, { memories_label: fd.get('v') as string || null as any })
                        }}>
                          <label className="block text-xs text-gray-500 mb-1">Секция спомени</label>
                          <div className="flex gap-1">
                            <input name="v" defaultValue={memoriesLabel} placeholder="напр. Нашите спомени"
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                            <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                              <span className="material-symbols-outlined text-sm">check</span>
                            </button>
                          </div>
                        </form>
                        <form action={async (fd: FormData) => {
                          'use server'
                          await updateLabels(classId, { stars_label: fd.get('v') as string || null as any })
                        }}>
                          <label className="block text-xs text-gray-500 mb-1">Звездите на...</label>
                          <div className="flex gap-1">
                            <input name="v" defaultValue={starsLabel} placeholder="напр. Звездите на класа"
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                            <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                              <span className="material-symbols-outlined text-sm">check</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`px-4 sm:px-6 py-3 flex items-center justify-between gap-2 ${
                  isCustomActive ? 'border-t border-indigo-100' : 'border-t border-gray-100'
                }`}>
                  <span className="text-xs text-gray-400">
                    {isCustomActive ? 'Персонализиран шаблон' : 'Промени нещо, за да активираш'}
                  </span>
                  {isCustomActive && (
                    <Link href={`/moderator/${classId}/preview`} target="_blank"
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      Прегледай лексикона
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </LexiconAccordion>

        </div>
      </main>
    </div>
  )
}
