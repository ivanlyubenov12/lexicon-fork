'use client'

import { useState, useTransition } from 'react'
import { createQuestion, updateQuestion, deleteQuestion, reorderQuestions, toggleFeaturedQuestion, reseedDefaultQuestions, bulkDeleteQuestions } from './actions'
import { QUESTION_PRESETS } from '@/lib/templates/defaultSeed'

type QuestionType = 'personal' | 'better_together' | 'superhero' | 'video' | 'photo' | 'survey'

interface Question {
  id: string
  text: string
  description: string | null
  type: QuestionType
  allows_text: boolean
  allows_media: boolean
  max_length: number | null
  order_index: number
  voice_display: 'wordcloud' | 'barchart' | null
  is_featured: boolean
  poll_options: string[] | null
  is_anonymous: boolean
}

interface Props {
  classId: string
  systemQuestions: Question[]
  customQuestions: Question[]
}

const TYPE_LABELS: Record<QuestionType, string> = {
  personal:        'Въпрос за мен',
  better_together: 'По-добри заедно',
  superhero:       'Супергерой',
  video:           'Видео',
  photo:           'Снимка',
  survey:          'Анкета',
}

// Types available in the creation/edit dropdown (excludes legacy-only types)
const SELECTABLE_TYPES: QuestionType[] = ['personal', 'video', 'photo', 'survey']

function mediaFlagsForType(type: QuestionType) {
  if (type === 'video') return { allows_text: false, allows_media: true }
  if (type === 'photo') return { allows_text: true,  allows_media: true }
  return { allows_text: true, allows_media: false }
}

const DEFAULT_MAX_LENGTH = '150'

const EMPTY_FORM = {
  text: '',
  description: '',
  type: 'personal' as QuestionType,
  max_length: DEFAULT_MAX_LENGTH,
  voice_display: null as 'wordcloud' | 'barchart' | null,
  poll_options: [] as string[],
  is_anonymous: true,
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function QuestionForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial: typeof EMPTY_FORM
  onSave: (data: typeof EMPTY_FORM) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [form, setForm] = useState(initial)

  // Detect duplicate poll options (case-insensitive, trimmed)
  const trimmedOpts = form.poll_options.map(o => o.trim().toLowerCase())
  const duplicateOptIndices = new Set<number>()
  trimmedOpts.forEach((v, i) => {
    if (v && trimmedOpts.indexOf(v) !== i) duplicateOptIndices.add(i)
    if (v && trimmedOpts.lastIndexOf(v) !== i) duplicateOptIndices.add(i)
  })
  const hasDuplicateOpts = duplicateOptIndices.size > 0

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="bg-white border border-indigo-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Текст на въпроса
        </label>
        <textarea
          value={form.text}
          onChange={(e) => set('text', e.target.value)}
          rows={2}
          placeholder="Напишете въпроса..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          Описание <span className="text-gray-400 font-normal normal-case">(видимо само при попълване)</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
          placeholder="Допълнително обяснение на въпроса..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none text-gray-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Раздел
          </label>
          <select
            value={form.type}
            onChange={(e) => set('type', e.target.value as QuestionType)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {SELECTABLE_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Макс. знаци <span className="text-gray-400 font-normal normal-case">(по желание)</span>
          </label>
          <input
            type="number"
            min={10}
            max={2000}
            value={form.max_length}
            onChange={(e) => set('max_length', e.target.value)}
            placeholder="без ограничение"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* Format indicator (derived from type, not editable) */}
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
        <span className="material-symbols-outlined text-sm text-gray-400" style={{ fontVariationSettings: "'FILL' 1" }}>
          {form.type === 'video' ? 'videocam' : 'article'}
        </span>
        <span>
          Формат на отговора:&nbsp;
          <strong className="text-gray-700">
            {form.type === 'video' ? 'само видео' : 'само текст'}
          </strong>
        </span>
      </div>

      {/* Unified survey options */}
      {form.type === 'survey' && (
        <div className="space-y-4">
          {/* Mode selector: poll vs aggregated */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Режим на анкетата
            </label>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => set('voice_display', null)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                  form.voice_display == null
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="material-symbols-outlined text-base">how_to_vote</span>
                Анкета с избор
              </button>
              <button
                type="button"
                onClick={() => set('voice_display', 'wordcloud')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium border-l border-gray-200 transition-colors ${
                  form.voice_display != null
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="material-symbols-outlined text-base">cloud</span>
                Облак / Диаграма
              </button>
            </div>
          </div>

          {/* Poll mode (voice_display == null) */}
          {form.voice_display == null && (() => {
            const isStudentPoll = form.poll_options[0] === '__students__'
            return (
              <div>
                {/* Student picker toggle */}
                <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Избор от участниците</p>
                    <p className="text-xs text-gray-400 mt-0.5">Учениците гласуват за съученик</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set('poll_options', isStudentPoll ? [] : ['__students__'])}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isStudentPoll ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      isStudentPoll ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {!isStudentPoll && (
                  <>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Предефинирани отговори
                    </label>
                    <div className="space-y-2">
                      {form.poll_options.map((opt, idx) => (
                        <div key={idx} className="flex flex-col gap-0.5">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={e => {
                                const next = [...form.poll_options]
                                next[idx] = e.target.value
                                set('poll_options', next)
                              }}
                              placeholder={`Отговор ${idx + 1}`}
                              className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                                duplicateOptIndices.has(idx)
                                  ? 'border-red-400 focus:ring-red-400'
                                  : 'border-gray-200 focus:ring-indigo-400'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => set('poll_options', form.poll_options.filter((_, i) => i !== idx))}
                              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <span className="material-symbols-outlined text-base">close</span>
                            </button>
                          </div>
                          {duplicateOptIndices.has(idx) && (
                            <p className="text-xs text-red-500 px-1">Този отговор вече съществува.</p>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => set('poll_options', [...form.poll_options, ''])}
                        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium px-1 py-1"
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                        Добави отговор
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Резултатите ще се показват като бар диаграма.</p>
                  </>
                )}

                {/* Anonymous toggle */}
                <div className="flex items-center justify-between mt-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Анонимна анкета</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {form.is_anonymous
                        ? 'Гласовете не се свързват с имена'
                        : 'Гласът се вижда в личната страница на всеки'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set('is_anonymous', !form.is_anonymous)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.is_anonymous ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      form.is_anonymous ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            )
          })()}

          {/* Voice mode (voice_display != null) */}
          {form.voice_display != null && (
            <div>
              {/* Voice display sub-toggle: wordcloud vs barchart */}
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Визуализация на отговорите
              </label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-4">
                <button
                  type="button"
                  onClick={() => set('voice_display', 'wordcloud')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                    form.voice_display === 'wordcloud'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">cloud</span>
                  Облак от думи
                </button>
                <button
                  type="button"
                  onClick={() => set('voice_display', 'barchart')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium border-l border-gray-200 transition-colors ${
                    form.voice_display === 'barchart'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">bar_chart</span>
                  Бар диаграма
                </button>
              </div>

              {/* Optional predefined words */}
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Предефинирани думи <span className="text-gray-400 font-normal normal-case">(по желание)</span>
              </label>
              <div className="space-y-2">
                {form.poll_options.map((opt, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const next = [...form.poll_options]
                          next[idx] = e.target.value
                          set('poll_options', next)
                        }}
                        placeholder={`Дума ${idx + 1}`}
                        className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                          duplicateOptIndices.has(idx)
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-gray-200 focus:ring-indigo-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => set('poll_options', form.poll_options.filter((_, i) => i !== idx))}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </div>
                    {duplicateOptIndices.has(idx) && (
                      <p className="text-xs text-red-500 px-1">Тази дума вече съществува.</p>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => set('poll_options', [...form.poll_options, ''])}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium px-1 py-1"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Добави дума
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Ако има думи — учениците избират от тях. Ако не — пишат свободно.</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={isPending || !form.text.trim() || hasDuplicateOpts}
          className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Запазване...' : 'Запази'}
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="text-gray-400 hover:text-gray-600 text-sm px-4 py-2.5"
        >
          Отказ
        </button>
      </div>
    </div>
  )
}

// ─── Question card ─────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  number,
  classId,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  featuredCount,
  onFeaturedChange,
  onUpdate,
  onDelete,
  selectMode,
  isSelected,
  onToggleSelect,
}: {
  question: Question
  number?: number
  classId: string
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
  featuredCount: number
  onFeaturedChange: (id: string, val: boolean) => void
  onUpdate: (id: string, partial: Partial<Question>) => void
  onDelete: (id: string) => void
  selectMode: boolean
  isSelected: boolean
  onToggleSelect: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleToggleFeatured() {
    const next = !question.is_featured
    if (next && featuredCount >= 3) return // max 3
    onFeaturedChange(question.id, next)
    startTransition(async () => {
      await toggleFeaturedQuestion(classId, question.id, next)
    })
  }

  function handleSave(form: typeof EMPTY_FORM) {
    startTransition(async () => {
      const result = await updateQuestion(classId, question.id, {
        text: form.text,
        description: form.description || null,
        type: form.type,
        ...mediaFlagsForType(form.type),
        max_length: form.max_length ? parseInt(form.max_length as unknown as string) : null,
        order_index: question.order_index,
        voice_display: form.type === 'survey' ? form.voice_display : null,
        poll_options: form.type === 'survey' ? form.poll_options.filter(o => o.trim()) : null,
        is_anonymous: form.type === 'survey' && form.voice_display == null ? form.is_anonymous : true,
      })
      if (result.error) {
        setError(result.error)
      } else {
        onUpdate(question.id, {
          text: form.text,
          description: form.description || null,
          type: form.type,
          ...mediaFlagsForType(form.type),
          max_length: form.max_length ? parseInt(form.max_length as unknown as string) : null,
          voice_display: form.type === 'survey' ? form.voice_display : null,
          poll_options: form.type === 'survey' ? form.poll_options.filter(o => o.trim()) : null,
          is_anonymous: form.type === 'survey' && form.voice_display == null ? form.is_anonymous : true,
        })
        setEditing(false)
        setError(null)
      }
    })
  }

  function handleDelete() {
    if (!confirm('Изтриване на въпроса?')) return
    startTransition(async () => {
      const result = await deleteQuestion(classId, question.id)
      if (result.error) setError(result.error)
      else onDelete(question.id)
    })
  }

  if (editing) {
    return (
      <div className="space-y-2">
        {error && <p className="text-red-500 text-xs px-1">{error}</p>}
        <QuestionForm
          initial={{
            text: question.text,
            description: question.description ?? '',
            type: question.type,
            max_length: question.max_length?.toString() ?? DEFAULT_MAX_LENGTH,
            voice_display: question.voice_display ?? null,
            poll_options: question.poll_options ?? [],
            is_anonymous: question.is_anonymous,
          }}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
          isPending={isPending}
        />
      </div>
    )
  }

  return (
    <div
      className={`group bg-white border rounded-2xl px-6 py-5 shadow-sm transition-all ${
        selectMode
          ? isSelected
            ? 'border-indigo-400 bg-indigo-50 cursor-pointer'
            : 'border-gray-200 hover:border-indigo-200 cursor-pointer'
          : 'border-gray-100 hover:shadow-md'
      }`}
      onClick={selectMode ? () => onToggleSelect(question.id) : undefined}
    >
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <div className="flex items-start gap-4">

        {/* Checkbox (select mode) or reorder arrows */}
        <div className="flex-shrink-0 pt-1 flex flex-col gap-0.5">
          {selectMode ? (
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'
            }`}>
              {isSelected && <span className="material-symbols-outlined text-white" style={{ fontSize: 14 }}>check</span>}
            </div>
          ) : (
            <>
              <button
                onClick={onMoveUp}
                disabled={isFirst || isPending}
                className="text-gray-300 hover:text-gray-500 disabled:opacity-20 leading-none text-xs"
              >▲</button>
              <button
                onClick={onMoveDown}
                disabled={isLast || isPending}
                className="text-gray-300 hover:text-gray-500 disabled:opacity-20 leading-none text-xs"
              >▼</button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {number != null && (
              <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-600 text-white tabular-nums">
                В{number}
              </span>
            )}
            <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-700">
              {TYPE_LABELS[question.type]}
            </span>
            {question.type === 'video' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>videocam</span>
                Само видео
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>article</span>
                Само текст
              </span>
            )}
            {question.voice_display != null && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  {question.voice_display === 'barchart' ? 'bar_chart' : 'cloud'}
                </span>
                {question.voice_display === 'barchart' ? 'Бар диаграма' : 'Облак от думи'}
              </span>
            )}
          </div>

          {/* Question text + star */}
          <div className="flex items-start gap-2">
            <p
              className="text-xl text-indigo-700 leading-snug flex-1"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              {question.text}
            </p>
            <button
              onClick={handleToggleFeatured}
              disabled={isPending || (!question.is_featured && featuredCount >= 3)}
              title={question.is_featured ? 'Премахни от профилните въпроси' : featuredCount >= 3 ? 'Максимум 3 профилни въпроса' : 'Добави като профилен въпрос'}
              className={`flex-shrink-0 mt-1 transition-colors disabled:opacity-30 ${
                question.is_featured ? 'text-amber-400 hover:text-amber-500' : 'text-gray-200 hover:text-amber-300'
              }`}
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: question.is_featured ? "'FILL' 1" : "'FILL' 0" }}>
                star
              </span>
            </button>
          </div>
          {question.description && (
            <p className="text-sm text-gray-400 mt-1.5 italic">{question.description}</p>
          )}

        </div>

        {/* Actions — appear on hover, hidden in select mode */}
        {!selectMode && (
          <div className="flex-shrink-0 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-gray-400 hover:text-indigo-600 transition-colors font-medium"
            >
              Редактирай
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
            >
              Изтрий
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main editor ───────────────────────────────────────────────────────────────

function sortQuestions(qs: Question[]): Question[] {
  return [...qs].sort((a, b) => {
    if (a.is_featured === b.is_featured) return a.order_index - b.order_index
    return a.is_featured ? -1 : 1
  })
}

export default function QuestionsEditor({ classId, systemQuestions, customQuestions: initialCustom }: Props) {
  const [customQuestions, setCustomQuestions] = useState(() => sortQuestions(initialCustom))
  const featuredCount = customQuestions.filter(q => q.is_featured).length
  const [adding, setAdding] = useState(false)
  const [addTab, setAddTab] = useState<'write' | 'archive'>('write')
  const [isPending, startTransition] = useTransition()
  const [addError, setAddError] = useState<string | null>(null)
  const [reseeding, setReseeding] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  function toggleCollapse(key: string) { setCollapsed(prev => ({ ...prev, [key]: !prev[key] })) }
  function isCollapsed(key: string) { return !!collapsed[key] }
  const [reseedError, setReseedError] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string>(QUESTION_PRESETS[0].id)
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggleSelectMode() {
    setSelectMode(s => !s)
    setSelected(new Set())
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === customQuestions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(customQuestions.map(q => q.id)))
    }
  }

  function handleBulkDelete() {
    if (selected.size === 0) return
    if (!confirm(`Изтриване на ${selected.size} въпрос${selected.size === 1 ? '' : 'а'}?`)) return
    const ids = Array.from(selected)
    setCustomQuestions(prev => prev.filter(q => !ids.includes(q.id)))
    setSelected(new Set())
    setSelectMode(false)
    startTransition(async () => {
      await bulkDeleteQuestions(classId, ids)
    })
  }

  function handleReseed(preset = selectedPreset) {
    setReseeding(true)
    setReseedError(null)
    startTransition(async () => {
      const result = await reseedDefaultQuestions(classId, preset)
      if (result.error) {
        setReseedError(result.error)
        setReseeding(false)
      }
      // page will revalidate and reload with questions
    })
  }

  function handleAdd(form: typeof EMPTY_FORM) {
    startTransition(async () => {
      const nextIndex =
        customQuestions.length > 0
          ? Math.max(...customQuestions.map((q) => q.order_index)) + 1
          : 1

      const result = await createQuestion(classId, {
        text: form.text,
        description: form.description || null,
        type: form.type,
        ...mediaFlagsForType(form.type),
        max_length: form.max_length ? parseInt(form.max_length as unknown as string) : null,
        order_index: nextIndex,
        voice_display: form.type === 'survey' ? form.voice_display : null,
        poll_options: form.type === 'survey' ? form.poll_options.filter(o => o.trim()) : null,
        is_anonymous: form.type === 'survey' && form.voice_display == null ? form.is_anonymous : true,
      })

      if (result.error) {
        setAddError(result.error)
      } else {
        setAdding(false)
        setAddError(null)
        setCustomQuestions((prev) => [
          ...prev,
          {
            id: 'pending-' + Date.now(),
            text: form.text,
            description: form.description || null,
            type: form.type,
            ...mediaFlagsForType(form.type),
            max_length: form.max_length ? parseInt(form.max_length as unknown as string) : null,
            order_index: nextIndex,
            voice_display: form.type === 'survey' ? form.voice_display : null,
            is_featured: false,
            poll_options: form.type === 'survey' ? form.poll_options.filter(o => o.trim()) : null,
            is_anonymous: form.type === 'survey' && form.voice_display == null ? form.is_anonymous : true,
          },
        ])
      }
    })
  }

  function handleAddFromArchive(q: Question) {
    const nextIndex =
      customQuestions.length > 0
        ? Math.max(...customQuestions.map((c) => c.order_index)) + 1
        : 1
    startTransition(async () => {
      const result = await createQuestion(classId, {
        text: q.text,
        type: q.type,
        allows_text: q.allows_text,
        allows_media: q.allows_media,
        max_length: q.max_length,
        order_index: nextIndex,
      })
      if (!result.error) {
        setCustomQuestions((prev) => [
          ...prev,
          { ...q, id: 'pending-' + q.id, order_index: nextIndex },
        ])
      }
    })
  }

  function handleMove(index: number, direction: 'up' | 'down') {
    const newList = [...customQuestions]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]]
    const reindexed = newList.map((q, i) => ({ ...q, order_index: i + 1 }))
    setCustomQuestions(reindexed)
    startTransition(async () => {
      await reorderQuestions(
        classId,
        reindexed.map((q) => ({ id: q.id, order_index: q.order_index }))
      )
    })
  }

  return (
    <div>
      {/* ── Actions bar ────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-end gap-2">
        {customQuestions.length > 0 && (
          <button
            onClick={toggleSelectMode}
            className={`flex items-center gap-2 border text-sm font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-colors ${
              selectMode
                ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-700'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {selectMode ? 'close' : 'checklist'}
            </span>
            {selectMode ? 'Отказ' : 'Избери'}
          </button>
        )}
        {!adding && !selectMode && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl hover:border-indigo-300 hover:text-indigo-700 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Нов въпрос
          </button>
        )}
      </div>

      {/* ── Question count info ────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3">
          <span className="material-symbols-outlined text-indigo-400 text-lg">quiz</span>
          <span className="text-sm text-indigo-700">
            Въпросникът се състои от{' '}
            <strong className="font-bold">{customQuestions.length}</strong>{' '}
            {customQuestions.length === 1 ? 'въпрос' : 'въпроса'}
          </span>
        </div>
        {systemQuestions.length > 0 && (
          <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3">
            <span className="material-symbols-outlined text-gray-400 text-lg">auto_awesome</span>
            <span className="text-sm text-gray-500">
              <strong className="font-bold">{systemQuestions.length}</strong> в архива
            </span>
          </div>
        )}
        <div className={`flex items-center gap-2.5 border rounded-2xl px-5 py-3 ${
          featuredCount === 3 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
        }`}>
          <span className="material-symbols-outlined text-amber-400 text-lg" style={{ fontVariationSettings: featuredCount > 0 ? "'FILL' 1" : "'FILL' 0" }}>star</span>
          <span className="text-sm text-gray-600">
            Акценти: <strong className="font-bold">{featuredCount} / 3</strong>
          </span>
        </div>
      </div>

      {/* ── Bulk action bar ────────────────────────────────────────── */}
      {selectMode && (
        <div className="mb-6 flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-2xl px-5 py-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              selected.size === customQuestions.length && customQuestions.length > 0
                ? 'bg-indigo-600 border-indigo-600'
                : 'border-indigo-400 bg-white'
            }`}>
              {selected.size === customQuestions.length && customQuestions.length > 0 && (
                <span className="material-symbols-outlined text-white" style={{ fontSize: 14 }}>check</span>
              )}
            </div>
            {selected.size === customQuestions.length && customQuestions.length > 0 ? 'Премахни избора' : 'Избери всички'}
          </button>
          <span className="text-sm text-indigo-600 flex-1">
            {selected.size > 0 ? `${selected.size} избран${selected.size === 1 ? '' : 'и'}` : 'Натисни върху въпрос за избор'}
          </span>
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isPending}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              Изтрий {selected.size}
            </button>
          )}
        </div>
      )}

      {/* ── Add / Archive panel ────────────────────────────────────── */}
      {adding && (
        <div className="mb-6">
          {/* Tab switcher */}
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-2xl p-1 w-fit">
            <button
              onClick={() => setAddTab('write')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                addTab === 'write' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Напиши въпрос
            </button>
            <button
              onClick={() => setAddTab('archive')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                addTab === 'archive' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              Идеи от архива
            </button>
          </div>

          {addTab === 'write' ? (
            <>
              {addError && <p className="text-red-500 text-xs mb-2 px-1">{addError}</p>}
              <QuestionForm
                initial={EMPTY_FORM}
                onSave={handleAdd}
                onCancel={() => { setAdding(false); setAddError(null); setAddTab('write') }}
                isPending={isPending}
              />
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">Избери въпрос от архива</p>
                <button
                  onClick={() => { setAdding(false); setAddTab('write') }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕ Затвори
                </button>
              </div>
              {systemQuestions.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">Архивът е празен.</p>
              ) : (
                systemQuestions.map((q) => {
                  const added = customQuestions.some((c) => c.text === q.text)
                  return (
                    <div
                      key={q.id}
                      className={`bg-gray-50 rounded-xl px-4 py-3 flex items-start gap-3 border transition-colors ${
                        added ? 'border-gray-100 opacity-50' : 'border-gray-100 hover:border-indigo-200'
                      }`}
                    >
                      <p className="flex-1 text-sm text-gray-700 leading-snug" style={{ fontFamily: 'Noto Serif, serif' }}>
                        {q.text}
                      </p>
                      <button
                        disabled={added || isPending}
                        onClick={() => handleAddFromArchive(q)}
                        className="flex-shrink-0 w-7 h-7 rounded-full border border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={added ? 'Вече добавен' : 'Добави'}
                      >
                        {added ? '✓' : '+'}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Questions list ─────────────────────────────────────────── */}
      {customQuestions.length === 0 && !adding ? (
        <div className="mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-1">
                <span className="material-symbols-outlined text-indigo-400 text-xl">auto_awesome</span>
                <p className="text-sm font-semibold text-gray-800">Изберете готов въпросник</p>
              </div>
              <p className="text-xs text-gray-400 pl-8">Изберете шаблон според възрастовата група</p>
            </div>

            {/* Preset tabs */}
            <div className="flex gap-1 px-4 pt-3">
              {QUESTION_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    selectedPreset === preset.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Selected preset info */}
            {QUESTION_PRESETS.filter(p => p.id === selectedPreset).map(preset => (
              <div key={preset.id} className="px-6 py-4">
                <p className="text-xs text-gray-500 mb-4">{preset.description}</p>
                {reseedError && <p className="text-red-500 text-xs mb-3">{reseedError}</p>}
                <button
                  onClick={() => handleReseed(preset.id)}
                  disabled={reseeding || isPending}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  {reseeding ? 'Зареждане...' : `Зареди въпросника за ${preset.label}`}
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">или натиснете „Нов въпрос" за ръчно добавяне</p>
        </div>
      ) : (() => {
        const accentQs  = customQuestions.filter(q => q.type === 'better_together' || q.type === 'superhero')
        const voiceQs   = customQuestions.filter(q => q.type === 'survey' && q.voice_display != null)
        const surveyQs  = customQuestions.filter(q => q.type === 'survey' && q.voice_display == null)
        const mainQs    = customQuestions.filter(q => q.type === 'personal' || q.type === 'video' || q.type === 'photo')

        // Number map — В1, В2... for personal+video+photo in order_index order
        const numMap = new Map(
          [...mainQs].sort((a, b) => a.order_index - b.order_index).map((q, i) => [q.id, i + 1])
        )

        function renderCard(q: Question) {
          const gi = customQuestions.findIndex(cq => cq.id === q.id)
          return (
            <QuestionCard
              key={q.id}
              question={q}
              number={numMap.get(q.id)}
              classId={classId}
              onMoveUp={() => handleMove(gi, 'up')}
              onMoveDown={() => handleMove(gi, 'down')}
              isFirst={gi === 0}
              isLast={gi === customQuestions.length - 1}
              featuredCount={featuredCount}
              onFeaturedChange={(id, val) =>
                setCustomQuestions(prev => sortQuestions(prev.map(q => q.id === id ? { ...q, is_featured: val } : q)))
              }
              onUpdate={(id, partial) =>
                setCustomQuestions(prev => prev.map(q => q.id === id ? { ...q, ...partial } : q))
              }
              onDelete={(id) =>
                setCustomQuestions(prev => prev.filter(q => q.id !== id))
              }
              selectMode={selectMode}
              isSelected={selected.has(q.id)}
              onToggleSelect={toggleSelect}
            />
          )
        }

        function SectionHeader({ icon, label, sub, color = 'text-gray-400' }: { icon: string; label: string; sub?: string; color?: string }) {
          return (
            <div className="flex items-center gap-2 px-1 mb-2">
              <span className={`material-symbols-outlined text-base ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              <p className={`text-xs font-bold uppercase tracking-widest ${color}`}>{label}</p>
              {sub && <p className="text-xs text-gray-400">{sub}</p>}
            </div>
          )
        }

        return (
          <div className="space-y-6 mb-8">
            {/* ── Акценти ──────────────────────────────────────── */}
            {accentQs.length > 0 && (
              <div className="border border-amber-200 rounded-2xl overflow-hidden">
                <button onClick={() => toggleCollapse('accents')} className="w-full bg-amber-50 px-5 py-3 border-b border-amber-200 flex items-center gap-2 hover:bg-amber-100 transition-colors text-left">
                  <span className="material-symbols-outlined text-amber-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Акценти</p>
                  <p className="text-xs text-amber-400 ml-1">— показват се в личната страница като ★</p>
                  <span className={`material-symbols-outlined text-amber-400 text-base ml-auto transition-transform ${isCollapsed('accents') ? '' : 'rotate-180'}`}>expand_more</span>
                </button>
                {!isCollapsed('accents') && <div className="p-3 space-y-2">{accentQs.map(renderCard)}</div>}
              </div>
            )}

            {/* ── Въпроси (personal + video + photo) ──────────── */}
            {mainQs.length > 0 && (() => {
              const sorted = [...mainQs].sort((a, b) => a.order_index - b.order_index)
              const featured = sorted.filter(q => q.is_featured)
              const rest = sorted.filter(q => !q.is_featured)
              return (
                <div>
                  <SectionHeader icon="quiz" label="Въпроси" sub={`— В1 · В${mainQs.length}`} color="text-indigo-400" />
                  <div className="space-y-2">
                    {featured.length > 0 && (
                      <div className="border border-amber-300 rounded-2xl overflow-hidden mb-1">
                        <button onClick={() => toggleCollapse('featured')} className="w-full bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center gap-1.5 hover:bg-amber-100 transition-colors text-left">
                          <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Акценти</p>
                          <span className={`material-symbols-outlined text-amber-400 text-base ml-auto transition-transform ${isCollapsed('featured') ? '' : 'rotate-180'}`}>expand_more</span>
                        </button>
                        {!isCollapsed('featured') && <div className="p-3 space-y-2">{featured.map(renderCard)}</div>}
                      </div>
                    )}
                    {(() => {
                      const videos = rest.filter(q => q.type === 'video')
                      const others = rest.filter(q => q.type !== 'video')
                      return (
                        <>
                          {videos.length > 0 && (
                            <div className="border border-indigo-200 rounded-2xl overflow-hidden mb-1">
                              <button onClick={() => toggleCollapse('video')} className="w-full bg-indigo-50 px-4 py-2 border-b border-indigo-200 flex items-center gap-1.5 hover:bg-indigo-100 transition-colors text-left">
                                <span className="material-symbols-outlined text-indigo-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>videocam</span>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Видео въпрос</p>
                                <span className={`material-symbols-outlined text-indigo-300 text-base ml-auto transition-transform ${isCollapsed('video') ? '' : 'rotate-180'}`}>expand_more</span>
                              </button>
                              {!isCollapsed('video') && <div className="p-3 space-y-2">{videos.map(renderCard)}</div>}
                            </div>
                          )}
                          {others.map(renderCard)}
                        </>
                      )
                    })()}
                  </div>
                </div>
              )
            })()}

            {/* ── Анонимни (class_voice) ───────────────────────── */}
            {voiceQs.length > 0 && (
              <div className="border border-purple-200 rounded-2xl overflow-hidden">
                <button onClick={() => toggleCollapse('voice')} className="w-full bg-purple-50 px-5 py-3 border-b border-purple-200 flex items-center gap-2 hover:bg-purple-100 transition-colors text-left">
                  <span className="material-symbols-outlined text-purple-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>record_voice_over</span>
                  <p className="text-xs font-bold uppercase tracking-widest text-purple-600">Анонимни въпроси</p>
                  <p className="text-xs text-purple-400 ml-1">— облак от думи или диаграма</p>
                  <span className={`material-symbols-outlined text-purple-300 text-base ml-auto transition-transform ${isCollapsed('voice') ? '' : 'rotate-180'}`}>expand_more</span>
                </button>
                {!isCollapsed('voice') && <div className="p-3 space-y-2">{voiceQs.map(renderCard)}</div>}
              </div>
            )}

            {/* ── Анкети (survey) ─────────────────────────────── */}
            {surveyQs.length > 0 && (
              <div className="border border-teal-200 rounded-2xl overflow-hidden">
                <button onClick={() => toggleCollapse('survey')} className="w-full bg-teal-50 px-5 py-3 border-b border-teal-200 flex items-center gap-2 hover:bg-teal-100 transition-colors text-left">
                  <span className="material-symbols-outlined text-teal-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>poll</span>
                  <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Анкети</p>
                  <p className="text-xs text-teal-400 ml-1">— избор от отговори или от участници</p>
                  <span className={`material-symbols-outlined text-teal-300 text-base ml-auto transition-transform ${isCollapsed('survey') ? '' : 'rotate-180'}`}>expand_more</span>
                </button>
                {!isCollapsed('survey') && <div className="p-3 space-y-2">{surveyQs.map(renderCard)}</div>}
              </div>
            )}
          </div>
        )
      })()}

    </div>
  )
}
