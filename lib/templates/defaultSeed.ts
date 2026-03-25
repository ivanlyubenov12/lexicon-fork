import { nanoid } from 'nanoid'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Block } from './types'

/** Default questions to seed for every new class */
const DEFAULT_QUESTIONS = [
  // Video intro
  { text: 'Представи се — как се казваш, какво обичаш да правиш и какъв е любимият ти спомен от тази година?', type: 'video',       allows_text: false, allows_media: true,  order_index: 0 },
  // Personal
  { text: 'Кое е нещото от тази учебна година, което никога няма да забравиш?',                               type: 'personal',    allows_text: true,  allows_media: false, order_index: 1 },
  { text: 'Кое е нещото, което най-много ще ти липсва?',                                                      type: 'personal',    allows_text: true,  allows_media: false, order_index: 2 },
  { text: 'Каква е мечтата ти за след като завършиш?',                                                        type: 'personal',    allows_text: true,  allows_media: false, order_index: 3 },
  { text: 'Опиши себе си с три думи.',                                                                        type: 'personal',    allows_text: true,  allows_media: false, order_index: 4 },
  { text: 'Какъв урок от тази година ще вземеш за цял живот?',                                               type: 'personal',    allows_text: true,  allows_media: false, order_index: 5 },
  // Class voice
  { text: 'С коя една дума описваш класа ни?',                                                               type: 'class_voice', allows_text: true,  allows_media: false, order_index: 6 },
  { text: 'Кое е любимото ни съвместно преживяване?',                                                        type: 'class_voice', allows_text: true,  allows_media: false, order_index: 7 },
  { text: 'С каква дума описваш класния ни ръководител?',                                                    type: 'class_voice', allows_text: true,  allows_media: false, order_index: 8 },
  // Teacher description
  { text: 'Опиши класния ни ръководител като супергерой — какви са нейните/неговите суперсили?',             type: 'superhero',   allows_text: true,  allows_media: false, order_index: 9 },
]

/** Default polls */
const DEFAULT_POLLS = [
  { question: 'Кой ще стане известен?',                 order_index: 0 },
  { question: 'Кой е класовият шегаджия?',              order_index: 1 },
  { question: 'Кой ще направи нещо невероятно?',        order_index: 2 },
  { question: 'Кой е най-голямото приключение на класа?', order_index: 3 },
  { question: 'Кой пее/танцува най-добре?',             order_index: 4 },
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
  admin: SupabaseClient
): Promise<{ blocks: Block[]; error: string | null }> {
  // ── Questions ──────────────────────────────────────────────────────────
  const { data: insertedQs, error: qErr } = await admin
    .from('questions')
    .insert(DEFAULT_QUESTIONS.map(q => ({ ...q, class_id: classId, is_system: false })))
    .select('id, type, order_index')

  if (qErr || !insertedQs) return { blocks: [], error: 'Грешка при създаване на въпросите.' }

  // Sort by order_index to match original order
  const qs = [...insertedQs].sort((a, b) => a.order_index - b.order_index)
  const videoQ        = qs.find(q => q.type === 'video')
  const personalQs    = qs.filter(q => q.type === 'personal')
  const classVoiceQs  = qs.filter(q => q.type === 'class_voice')
  const superheroQ    = qs.find(q => q.type === 'superhero')

  // ── Polls ──────────────────────────────────────────────────────────────
  const { data: insertedPolls, error: pollErr } = await admin
    .from('class_polls')
    .insert(DEFAULT_POLLS.map(p => ({ ...p, class_id: classId })))
    .select('id, order_index')

  if (pollErr || !insertedPolls) return { blocks: [], error: 'Грешка при създаване на анкетите.' }

  const polls = [...insertedPolls].sort((a, b) => a.order_index - b.order_index)

  // ── Events ─────────────────────────────────────────────────────────────
  const { error: evErr } = await admin
    .from('events')
    .insert(DEFAULT_EVENTS.map(e => ({ ...e, class_id: classId })))

  if (evErr) return { blocks: [], error: 'Грешка при създаване на събитията.' }

  // ── Build layout ───────────────────────────────────────────────────────
  const blocks: Block[] = [
    // 1. Hero — class photo + info
    blk('hero'),

    // 2. All students grid
    blk('students_grid', { columns: 4, showTeaser: true }),

    // 3. Poll winners (5)
    ...polls.map(p => blk('poll', { pollId: p.id })),

    // 4. Teacher description (superhero question answers)
    ...(superheroQ ? [blk('question', { questionId: superheroQ.id })] : []),

    // 5. Class voice (3)
    ...classVoiceQs.map(q => blk('class_voice', { questionId: q.id })),

    // 6. Events list
    blk('events', { limit: 20, style: 'polaroids' }),
  ]

  return { blocks, error: null }
}

/** Questions to show students in the wizard (personal + video + superhero) */
export function getWizardQuestionTypes(): string[] {
  return ['video', 'personal', 'superhero']
}
