'use client'

import { useState, useTransition } from 'react'
import { createQuestion, updateQuestion, deleteQuestion, reorderQuestions } from './actions'

type QuestionType = 'personal' | 'class_voice' | 'better_together' | 'superhero' | 'video'

interface Question {
  id: string
  text: string
  type: QuestionType
  allows_text: boolean
  allows_media: boolean
  max_length: number | null
  order_index: number
}

interface Props {
  classId: string
  systemQuestions: Question[]
  customQuestions: Question[]
}

const TYPE_LABELS: Record<QuestionType, string> = {
  personal: 'Личен',
  class_voice: 'Гласът на класа',
  better_together: 'По-добри заедно',
  superhero: 'Супергерой',
  video: 'Видео въпрос',
}

// Video questions require video, all others are text-only
function mediaFlagsForType(type: QuestionType) {
  return type === 'video'
    ? { allows_text: false, allows_media: true }
    : { allows_text: true, allows_media: false }
}

const EMPTY_FORM = {
  text: '',
  type: 'personal' as QuestionType,
  max_length: '',
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
            {(Object.keys(TYPE_LABELS) as QuestionType[]).map((t) => (
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

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={isPending || !form.text.trim()}
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
  classId,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  question: Question
  classId: string
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSave(form: typeof EMPTY_FORM) {
    startTransition(async () => {
      const result = await updateQuestion(classId, question.id, {
        text: form.text,
        type: form.type,
        ...mediaFlagsForType(form.type),
        max_length: form.max_length ? parseInt(form.max_length as unknown as string) : null,
        order_index: question.order_index,
      })
      if (result.error) setError(result.error)
      else { setEditing(false); setError(null) }
    })
  }

  function handleDelete() {
    if (!confirm('Изтриване на въпроса?')) return
    startTransition(async () => {
      const result = await deleteQuestion(classId, question.id)
      if (result.error) setError(result.error)
    })
  }

  if (editing) {
    return (
      <div className="space-y-2">
        {error && <p className="text-red-500 text-xs px-1">{error}</p>}
        <QuestionForm
          initial={{
            text: question.text,
            type: question.type,
            max_length: question.max_length?.toString() ?? '',
          }}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
          isPending={isPending}
        />
      </div>
    )
  }

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition-shadow">
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <div className="flex items-start gap-4">

        {/* Drag / reorder handle */}
        <div className="flex-shrink-0 pt-1 flex flex-col gap-0.5">
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
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
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
          </div>

          {/* Question text */}
          <p
            className="text-xl text-indigo-700 leading-snug"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            {question.text}
          </p>

        </div>

        {/* Actions — appear on hover */}
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
      </div>
    </div>
  )
}

// ─── Archive card (system questions) ──────────────────────────────────────────

function ArchiveCard({
  systemQuestions,
  customQuestions,
  onAddFromArchive,
  isPending,
}: {
  systemQuestions: Question[]
  customQuestions: Question[]
  onAddFromArchive: (q: Question) => void
  isPending: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl overflow-hidden">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex flex-col items-center text-center px-6 py-8 hover:bg-gray-100 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-3 shadow-sm">
            <span className="material-symbols-outlined text-2xl text-indigo-400">auto_awesome</span>
          </div>
          <p className="font-semibold text-gray-700 text-sm">Използвай идеи от архива</p>
          <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
            Разгледай подбрани въпроси от успешни випуски в миналото.
          </p>
        </button>
      ) : (
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-gray-700">Идеи от архива</p>
            <button
              onClick={() => setExpanded(false)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕ Затвори
            </button>
          </div>
          <div className="space-y-2">
            {systemQuestions.map((q) => {
              const added = customQuestions.some((c) => c.text === q.text)
              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-xl px-4 py-3 flex items-start gap-3 border transition-colors ${
                    added ? 'border-gray-100 opacity-50' : 'border-gray-100 hover:border-indigo-200'
                  }`}
                >
                  <p
                    className="flex-1 text-sm text-gray-700 leading-snug"
                    style={{ fontFamily: 'Noto Serif, serif' }}
                  >
                    {q.text}
                  </p>
                  <button
                    disabled={added || isPending}
                    onClick={() => onAddFromArchive(q)}
                    className="flex-shrink-0 w-7 h-7 rounded-full border border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={added ? 'Вече добавен' : 'Добави'}
                  >
                    {added ? '✓' : '+'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main editor ───────────────────────────────────────────────────────────────

export default function QuestionsEditor({ classId, systemQuestions, customQuestions: initialCustom }: Props) {
  const [customQuestions, setCustomQuestions] = useState(initialCustom)
  const [adding, setAdding] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [addError, setAddError] = useState<string | null>(null)

  function handleAdd(form: typeof EMPTY_FORM) {
    startTransition(async () => {
      const nextIndex =
        customQuestions.length > 0
          ? Math.max(...customQuestions.map((q) => q.order_index)) + 1
          : 1

      const result = await createQuestion(classId, {
        text: form.text,
        type: form.type,
        ...mediaFlagsForType(form.type),
        max_length: form.max_length ? parseInt(form.max_length as unknown as string) : null,
        order_index: nextIndex,
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
            type: form.type,
            ...mediaFlagsForType(form.type),
            max_length: form.max_length ? parseInt(form.max_length as unknown as string) : null,
            order_index: nextIndex,
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
      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="mb-10 flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">
            Настройки на албума
          </p>
          <h1
            className="text-4xl font-bold text-gray-900 leading-tight"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Редактор на въпросника
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-lg">
            Определете въпросите, на които всеки ученик трябва да отговори, за да
            създадем заедно живия архив на Вашия випуск.
          </p>
        </div>

        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex-shrink-0 flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:border-indigo-300 hover:text-indigo-700 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Нов въпрос
          </button>
        )}
      </div>

      {/* ── Add form ───────────────────────────────────────────────── */}
      {adding && (
        <div className="mb-6">
          {addError && <p className="text-red-500 text-xs mb-2 px-1">{addError}</p>}
          <QuestionForm
            initial={EMPTY_FORM}
            onSave={handleAdd}
            onCancel={() => { setAdding(false); setAddError(null) }}
            isPending={isPending}
          />
        </div>
      )}

      {/* ── Questions list ─────────────────────────────────────────── */}
      {customQuestions.length === 0 && !adding ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center mb-8">
          <span className="material-symbols-outlined text-4xl text-gray-300 block mb-3">quiz</span>
          <p className="text-gray-500 text-sm font-medium">Нямате добавени въпроси</p>
          <p className="text-gray-400 text-xs mt-1">
            Натиснете „Нов въпрос" или изберете от архива по-долу.
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {customQuestions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              classId={classId}
              onMoveUp={() => handleMove(i, 'up')}
              onMoveDown={() => handleMove(i, 'down')}
              isFirst={i === 0}
              isLast={i === customQuestions.length - 1}
            />
          ))}
        </div>
      )}

      {/* ── Bottom cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ArchiveCard
          systemQuestions={systemQuestions}
          customQuestions={customQuestions}
          onAddFromArchive={handleAddFromArchive}
          isPending={isPending}
        />

        {/* Groups card — links to polls page */}
        <a
          href={`/moderator/${classId}/polls`}
          className="relative overflow-hidden bg-indigo-700 rounded-2xl p-6 text-white hover:bg-indigo-600 transition-colors block"
        >
          <div className="relative z-10">
            <p className="text-lg font-bold mb-2">Групови въпроси</p>
            <p className="text-sm text-indigo-200 mb-5 leading-relaxed">
              Създай анкети за целия клас – „Най-голям шегаджия", „Бъдещ президент" и др.
            </p>
            <span className="text-white font-semibold text-sm border-b border-white/60 pb-0.5">
              Управлявай анкетите →
            </span>
          </div>
          <div className="absolute right-4 bottom-3 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined" style={{ fontSize: 96 }}>bar_chart</span>
          </div>
        </a>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p
            className="text-indigo-800 italic font-medium text-sm"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Един неразделен клас
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">
            © 2024 The Living Archive.
          </p>
        </div>
        <div className="flex gap-6">
          <span className="text-xs text-gray-400 uppercase tracking-widest">Privacy Policy</span>
          <span className="text-xs text-gray-400 uppercase tracking-widest">Terms of Service</span>
          <span className="text-xs text-gray-400 uppercase tracking-widest">Support</span>
        </div>
      </footer>
    </div>
  )
}
