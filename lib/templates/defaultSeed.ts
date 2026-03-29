import { nanoid } from 'nanoid'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Block } from './types'

/** Available question presets — used by the UI to render the preset picker */
export const QUESTION_PRESETS = [
  { id: 'primary',      label: '1–4 клас',       description: 'Начален курс' },
  { id: 'kindergarten', label: 'Детска градина',  description: 'Детска градина' },
  { id: 'teens',        label: 'Горен курс',      description: 'Горен курс' },
  { id: 'sports',       label: 'Спортен отбор',   description: 'Спортен отбор' },
  { id: 'friends',      label: 'Приятелска група', description: 'Приятелска група' },
] as const

export type QuestionPreset = (typeof QUESTION_PRESETS)[number]['id']

/** Default questions — only core columns guaranteed to exist in every schema version */
const DEFAULT_QUESTIONS = [
  // ── Home page questions (class_voice — answered by all students) ──
  { text: 'Най-любимият ми предмет в училище е',                                                     type: 'class_voice', allows_text: true,  allows_media: false, order_index: 0 },
  { text: 'А най-трудният е',                                                                        type: 'class_voice', allows_text: true,  allows_media: false, order_index: 1 },
  { text: 'Какъв е нашият клас? Опиши го с две или три думи',                                        type: 'class_voice', allows_text: true,  allows_media: false, order_index: 2 },
  { text: 'В междучасията най-често:',                                                               type: 'class_voice', allows_text: true,  allows_media: false, order_index: 3 },
  { text: 'Каква суперсила има класният/класната?',                                                  type: 'class_voice', allows_text: true,  allows_media: false, order_index: 4 },
  // ── Student page questions ─────────────────────────────────────────
  { text: 'Представи се на останалите',                                                              type: 'video',       allows_text: false, allows_media: true,  order_index: 5 },
  { text: 'Ако имах вълшебна пръчка, щях да',                                                        type: 'personal',    allows_text: true,  allows_media: false, order_index: 6 },
  { text: 'Моята тайна суперсила е',                                                                 type: 'personal',    allows_text: true,  allows_media: false, order_index: 7, description: 'Какво мислиш, че правиш по специален начин?' },
  { text: 'Като порасна искам да стана',                                                             type: 'personal',    allows_text: true,  allows_media: false, order_index: 8 },
  { text: 'Най-интересният ден тази година беше:',                                                   type: 'personal',    allows_text: true,  allows_media: false, order_index: 9 },
  { text: 'Ако бях животно, щях да съм:',                                                            type: 'personal',    allows_text: true,  allows_media: false, order_index: 10 },
  { text: 'Ако бях супергерой, щях да:',                                                             type: 'personal',    allows_text: true,  allows_media: false, order_index: 11 },
  { text: 'Мечтая да отида в:',                                                                      type: 'personal',    allows_text: true,  allows_media: false, order_index: 12 },
  { text: 'Ако бях учител за един ден, щях да:',                                                     type: 'personal',    allows_text: true,  allows_media: false, order_index: 13 },
]

/** Optional column updates applied after insert — silently skipped if column doesn't exist yet */
const VOICE_DISPLAY_UPDATES: Record<number, 'barchart' | 'wordcloud'> = {
  0: 'barchart',
  1: 'barchart',
  2: 'wordcloud',
  3: 'wordcloud',
  4: 'wordcloud',
}
const FEATURED_INDEXES = new Set([6, 7, 8])

/** Default polls */
export const DEFAULT_POLLS = [
  { question: 'Кой ще стане президент?',          order_index: 0 },
  { question: 'Кой е бъдеща поп-звезда?',         order_index: 1 },
  { question: 'Кой е винаги готов да помогне?',   order_index: 2 },
]

/** Default events */
const DEFAULT_EVENTS = [
  { title: 'Тържествено начало на учебната година', note: 'Денят, в който всичко започна.', order_index: 0 },
  { title: 'Коледно тържество',                    note: 'Магията на коледните празници заедно.', order_index: 1 },
  { title: 'Пролетен празник',                     note: 'Пролетта дойде и ние я посрещнахме с усмивки.', order_index: 2 },
]

function blk(type: Block['type'], config: Record<string, unknown> = {}): Block {
  return { id: nanoid(8), type, config }
}

export async function seedDefaultClass(
  classId: string,
  admin: SupabaseClient,
  preset = 'primary'
): Promise<{ blocks: Block[]; error: string | null }> {
  // ── Questions: load from DB preset, fall back to hardcoded ─────────────
  const { data: presetQs } = await admin
    .from('questions')
    .select('text, type, allows_text, allows_media, order_index, voice_display, description, is_featured')
    .eq('is_system', true)
    .eq('preset', preset)
    .order('order_index')

  // Deduplicate by text in case migrations created duplicate system questions
  const uniquePresetQs = presetQs && presetQs.length > 0
    ? [...new Map(presetQs.map(q => [q.text, q])).values()]
    : null

  const questionsToSeed = uniquePresetQs && uniquePresetQs.length > 0
    ? uniquePresetQs
    : DEFAULT_QUESTIONS.map((q, i) => ({
        ...q,
        voice_display: (VOICE_DISPLAY_UPDATES as Record<number, string>)[q.order_index] ?? null,
        is_featured: FEATURED_INDEXES.has(i),
        description: (q as { description?: string }).description ?? null,
      }))

  const { data: insertedQs, error: qErr } = await admin
    .from('questions')
    .insert(questionsToSeed.map(q => ({
      text: q.text,
      type: q.type,
      allows_text: q.allows_text,
      allows_media: q.allows_media,
      order_index: q.order_index,
      voice_display: q.voice_display ?? null,
      description: q.description ?? null,
      is_featured: q.is_featured ?? false,
      class_id: classId,
      is_system: false,
    })))
    .select('id, type, order_index, voice_display')

  if (qErr || !insertedQs) return { blocks: [], error: 'Грешка при създаване на въпросите.' }

  // ── Polls ──────────────────────────────────────────────────────────────
  const { data: insertedPolls, error: pollErr } = await admin
    .from('class_polls')
    .insert(DEFAULT_POLLS.map(p => ({ ...p, class_id: classId })))
    .select('id, order_index')

  if (pollErr || !insertedPolls) return { blocks: [], error: 'Грешка при създаване на анкетите.' }

  // ── Build layout ────────────────────────────────────────────────────────
  const blocks = buildLayoutFromQuestions(
    insertedQs,
    [...insertedPolls].sort((a, b) => a.order_index - b.order_index),
  )

  return { blocks, error: null }
}

/** Questions to show students in the wizard (personal + video only; class_voice answered implicitly) */
export function getWizardQuestionTypes(): string[] {
  return ['video', 'personal']
}

/**
 * Build the default layout blocks from an already-existing set of class questions + polls.
 * Used when questions were already seeded but the layout needs to be (re-)wired.
 */
export function buildLayoutFromQuestions(
  questions: { id: string; type: string; order_index: number; voice_display?: string | null }[],
  polls: { id: string; order_index: number }[],
): Block[] {
  const voiceQs = questions
    .filter(q => q.type === 'class_voice')
    .sort((a, b) => a.order_index - b.order_index)

  // Split by voice_display; fall back to order_index heuristic if null
  const barchartQs  = voiceQs.filter(q => (q.voice_display ?? (q.order_index <= 1 ? 'barchart' : 'wordcloud')) === 'barchart')
  const wordcloudQs = voiceQs.filter(q => (q.voice_display ?? (q.order_index <= 1 ? 'barchart' : 'wordcloud')) !== 'barchart')

  const sortedPolls = [...polls].sort((a, b) => a.order_index - b.order_index)

  return [
    blk('hero'),
    ...(barchartQs[0]  ? [blk('subjects_bar', { questionId: barchartQs[0].id  })] : []),
    ...(barchartQs[1]  ? [blk('subjects_bar', { questionId: barchartQs[1].id  })] : []),
    ...(sortedPolls.length > 0 ? [blk('polls_grid', { pollIds: sortedPolls.map(p => p.id) })] : []),
    ...(wordcloudQs[0] ? [blk('class_voice',  { questionId: wordcloudQs[0].id })] : []),
    ...(wordcloudQs[1] ? [blk('class_voice',  { questionId: wordcloudQs[1].id })] : []),
    ...(wordcloudQs[2] ? [blk('class_voice',  { questionId: wordcloudQs[2].id })] : []),
    blk('events', { limit: 20, style: 'photo_grid' }),
  ]
}
