'use client'

import { useState, useTransition } from 'react'
import { updatePresetQuestion, addPresetQuestion, deletePresetQuestion, reorderPresetQuestions } from '../actions'
import CollapsibleGroup from './CollapsibleGroup'

type QuestionType = 'personal' | 'class_voice' | 'better_together' | 'superhero' | 'video' | 'photo' | 'survey'

interface PresetQuestion {
  id: string
  text: string
  description: string | null
  type: QuestionType
  allows_media: boolean
  order_index: number
  voice_display: string | null
  is_featured: boolean
  poll_options: string[] | null
}

const TYPE_LABELS: Record<QuestionType, string> = {
  personal: 'Личен',
  class_voice: 'Глас на класа',
  better_together: 'По-добри заедно',
  superhero: 'Супергерой',
  video: 'Видео въпрос',
  photo: 'Снимка',
  survey: 'Анкета с отговори',
}
const TYPE_COLOR: Record<QuestionType, string> = {
  personal: 'bg-blue-50 text-blue-600',
  class_voice: 'bg-amber-50 text-amber-600',
  better_together: 'bg-green-50 text-green-600',
  superhero: 'bg-purple-50 text-purple-600',
  video: 'bg-rose-50 text-rose-600',
  photo: 'bg-teal-50 text-teal-600',
  survey: 'bg-indigo-50 text-indigo-600',
}
const TYPE_META: Record<QuestionType, { icon: string; color: string }> = {
  personal:        { icon: 'person',              color: 'text-blue-500' },
  video:           { icon: 'videocam',             color: 'text-rose-500' },
  photo:           { icon: 'add_photo_alternate',  color: 'text-teal-500' },
  class_voice:     { icon: 'record_voice_over',    color: 'text-amber-500' },
  survey:          { icon: 'poll',                 color: 'text-indigo-500' },
  better_together: { icon: 'diversity_3',          color: 'text-green-500' },
  superhero:       { icon: 'auto_awesome',         color: 'text-purple-500' },
}
const TYPE_ORDER: QuestionType[] = ['personal', 'video', 'class_voice', 'survey', 'better_together', 'superhero']

const EMPTY_FORM = {
  text: '',
  description: '',
  type: 'personal' as QuestionType,
  voice_display: 'wordcloud' as 'wordcloud' | 'barchart',
  is_featured: false,
  poll_options: [] as string[],
}

// ─── Inline edit form ──────────────────────────────────────────────────────────

function QuestionEditForm({
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
  const set = <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const trimmedOpts = form.poll_options.map(o => o.trim().toLowerCase())
  const duplicateOptIndices = new Set<number>()
  trimmedOpts.forEach((v, i) => {
    if (v && trimmedOpts.indexOf(v) !== i) duplicateOptIndices.add(i)
    if (v && trimmedOpts.lastIndexOf(v) !== i) duplicateOptIndices.add(i)
  })
  const hasDuplicateOpts = duplicateOptIndices.size > 0

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Текст</label>
          <textarea
            value={form.text}
            onChange={e => set('text', e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-white"
            autoFocus
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Описание <span className="font-normal normal-case text-gray-400">(подсказка за родителя)</span>
          </label>
          <input
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            placeholder="по желание..."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Тип</label>
          <select
            value={form.type}
            onChange={e => set('type', e.target.value as QuestionType)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            {(Object.keys(TYPE_LABELS) as QuestionType[]).map(t => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2 cursor-pointer pb-2">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={e => set('is_featured', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
            />
            <span className="text-sm text-gray-600">Профилен</span>
            <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: form.is_featured ? "'FILL' 1" : "'FILL' 0" }}>star</span>
          </label>
        </div>
      </div>

      {form.type === 'class_voice' && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Визуализация</label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
            {(['wordcloud', 'barchart'] as const).map(v => (
              <button
                key={v}
                type="button"
                onClick={() => set('voice_display', v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                  form.voice_display === v ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                } ${v === 'barchart' ? 'border-l border-gray-200' : ''}`}
              >
                <span className="material-symbols-outlined text-sm">{v === 'barchart' ? 'bar_chart' : 'cloud'}</span>
                {v === 'barchart' ? 'Бар диаграма' : 'Облак от думи'}
              </button>
            ))}
          </div>
        </div>
      )}

      {form.type === 'survey' && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Отговори</label>
          {form.poll_options.map((opt, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={e => {
                    const next = [...form.poll_options]
                    next[i] = e.target.value
                    set('poll_options', next)
                  }}
                  placeholder={`Отговор ${i + 1}`}
                  className={`flex-1 border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 ${
                    duplicateOptIndices.has(i)
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-indigo-400'
                  }`}
                />
                {form.poll_options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => set('poll_options', form.poll_options.filter((_, j) => j !== i))}
                    className="text-gray-400 hover:text-red-500 px-1"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                )}
              </div>
              {duplicateOptIndices.has(i) && (
                <p className="text-xs text-red-500 px-1">Този отговор вече съществува.</p>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => set('poll_options', [...form.poll_options, ''])}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Добави отговор
          </button>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={isPending || !form.text.trim() || hasDuplicateOpts}
          className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? 'Запазване...' : 'Запази'}
        </button>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xs px-3 py-2">
          Отказ
        </button>
      </div>
    </div>
  )
}

// ─── Single row ────────────────────────────────────────────────────────────────

function PresetRow({
  question,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  onSaved,
}: {
  question: PresetQuestion
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: (id: string) => void
  onSaved: (id: string, data: Partial<PresetQuestion>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSave(form: typeof EMPTY_FORM) {
    const updated = {
      text: form.text,
      description: form.description || null,
      type: form.type,
      voice_display: form.type === 'class_voice' ? form.voice_display : null,
      is_featured: form.is_featured,
      poll_options: form.type === 'survey' ? form.poll_options.filter(o => o.trim()) : null,
      allows_media: form.type === 'video',
    }
    startTransition(async () => {
      const result = await updatePresetQuestion(question.id, updated)
      if (result.error) { setError(result.error); return }
      setEditing(false)
      setError(null)
      onSaved(question.id, updated)
    })
  }

  function handleDelete() {
    if (!confirm('Изтриване на въпроса от шаблона?')) return
    startTransition(async () => {
      const result = await deletePresetQuestion(question.id)
      if (!result.error) onDelete(question.id)
    })
  }

  if (editing) {
    return (
      <tr>
        <td colSpan={5} className="px-4 py-3">
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          <QuestionEditForm
            initial={{
              text: question.text,
              description: question.description ?? '',
              type: question.type,
              voice_display: (question.voice_display as 'wordcloud' | 'barchart') ?? 'wordcloud',
              is_featured: question.is_featured,
              poll_options: question.poll_options ?? [],
            }}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
            isPending={isPending}
          />
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 group">
      {/* Reorder */}
      <td className="px-3 py-3 w-8 align-top pt-4">
        <div className="flex flex-col gap-0.5">
          <button onClick={onMoveUp} disabled={isFirst || isPending} className="text-gray-300 hover:text-gray-500 disabled:opacity-20 text-xs leading-none">▲</button>
          <button onClick={onMoveDown} disabled={isLast || isPending} className="text-gray-300 hover:text-gray-500 disabled:opacity-20 text-xs leading-none">▼</button>
        </div>
      </td>
      <td className="px-2 py-3 text-xs text-gray-400 font-mono w-6 align-top pt-4">{question.order_index}</td>

      {/* Badges */}
      <td className="px-3 py-3 align-top pt-3.5 w-48">
        <div className="flex flex-col gap-1.5">
          <span className={`inline-flex items-center whitespace-nowrap text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${TYPE_COLOR[question.type] ?? 'bg-gray-50 text-gray-500'}`}>
            {TYPE_LABELS[question.type] ?? question.type}
          </span>
          {question.type === 'class_voice' && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 w-fit">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                {question.voice_display === 'barchart' ? 'bar_chart' : 'cloud'}
              </span>
              {question.voice_display === 'barchart' ? 'Бар диаграма' : 'Облак от думи'}
            </span>
          )}
          {question.allows_media && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 w-fit">
              <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>videocam</span>
              Само видео
            </span>
          )}
        </div>
      </td>

      {/* Text */}
      <td className="px-3 py-3 w-full">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="text-sm text-gray-800 leading-relaxed">{question.text}</p>
            {question.description && (
              <p className="text-xs text-gray-400 italic mt-0.5">{question.description}</p>
            )}
          </div>
          {question.is_featured && (
            <span className="material-symbols-outlined text-amber-400 text-base flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right align-top pt-3.5">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Редактирай">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
          </button>
          <button onClick={handleDelete} disabled={isPending} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40" title="Изтрий">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Main tab ──────────────────────────────────────────────────────────────────

interface BankQuestion {
  id: string
  text: string
  type: QuestionType
  voice_display: string | null
  poll_options: string[] | null
}

export default function PresetQuestionsTab({
  preset,
  initialQuestions,
  bankQuestions = [],
}: {
  preset: string
  initialQuestions: PresetQuestion[]
  bankQuestions?: BankQuestion[]
}) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [adding, setAdding] = useState(false)
  const [addMode, setAddMode] = useState<'new' | 'bank'>('new')
  const [bankFilter, setBankFilter] = useState('')
  const [isPending, startTransition] = useTransition()
  const [addError, setAddError] = useState<string | null>(null)

  function handleAdd(form: typeof EMPTY_FORM) {
    const nextIndex = questions.length > 0 ? Math.max(...questions.map(q => q.order_index)) + 1 : 0
    startTransition(async () => {
      const result = await addPresetQuestion({
        preset,
        text: form.text,
        description: form.description || null,
        type: form.type,
        voice_display: form.type === 'class_voice' ? form.voice_display : null,
        is_featured: form.is_featured,
        order_index: nextIndex,
        poll_options: form.type === 'survey' ? form.poll_options.filter(o => o.trim()) : null,
      })
      if (result.error) setAddError(result.error)
      else {
        setAdding(false)
        setAddError(null)
        setQuestions(prev => [...prev, {
          id: 'pending-' + Date.now(),
          text: form.text,
          description: form.description || null,
          type: form.type,
          allows_media: form.type === 'video',
          order_index: nextIndex,
          voice_display: form.type === 'class_voice' ? form.voice_display : null,
          is_featured: form.is_featured,
          poll_options: form.type === 'survey' ? form.poll_options.filter(o => o.trim()) : null,
        }])
      }
    })
  }

  function handleAddFromBank(bq: BankQuestion) {
    const nextIndex = questions.length > 0 ? Math.max(...questions.map(q => q.order_index)) + 1 : 0
    startTransition(async () => {
      const result = await addPresetQuestion({
        preset,
        text: bq.text,
        description: null,
        type: bq.type,
        voice_display: bq.type === 'class_voice' ? (bq.voice_display as 'wordcloud' | 'barchart' | null) : null,
        is_featured: false,
        order_index: nextIndex,
        poll_options: bq.poll_options,
      })
      if (result.error) setAddError(result.error)
      else {
        setAddError(null)
        setQuestions(prev => [...prev, {
          id: 'pending-' + Date.now(),
          text: bq.text,
          description: null,
          type: bq.type,
          allows_media: bq.type === 'video',
          order_index: nextIndex,
          voice_display: bq.type === 'class_voice' ? bq.voice_display : null,
          is_featured: false,
          poll_options: bq.poll_options,
        }])
      }
    })
  }

  function handleDelete(id: string) {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  function handleSaved(id: string, data: Partial<PresetQuestion>) {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...data } : q))
  }

  function handleMove(index: number, direction: 'up' | 'down') {
    const newList = [...questions]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]]
    const reindexed = newList.map((q, i) => ({ ...q, order_index: i }))
    setQuestions(reindexed)
    startTransition(async () => {
      await reorderPresetQuestions(reindexed.map(q => ({ id: q.id, order_index: q.order_index })))
    })
  }

  return (
    <div>
      {/* Toolbar */}
      {!adding && (
        <div className="flex justify-end px-4 py-3 border-b border-gray-50">
          <button
            onClick={() => { setAdding(true); setAddMode('new') }}
            className="flex items-center gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Добави въпрос
          </button>
        </div>
      )}

      {TYPE_ORDER.map(type => {
        const group = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.type === type)
        if (group.length === 0) return null
        const meta = TYPE_META[type] ?? { icon: 'help', color: 'text-gray-400' }
        return (
          <CollapsibleGroup key={type} icon={meta.icon} color={meta.color} label={TYPE_LABELS[type]} count={group.length}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {group.map(({ q, i }) => (
                    <PresetRow
                      key={q.id}
                      question={q}
                      isFirst={i === 0}
                      isLast={i === questions.length - 1}
                      onMoveUp={() => handleMove(i, 'up')}
                      onMoveDown={() => handleMove(i, 'down')}
                      onDelete={handleDelete}
                      onSaved={handleSaved}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleGroup>
        )
      })}

      {questions.length === 0 && !adding && (
        <p className="px-6 py-5 text-xs text-gray-400 italic">Няма въпроси в този шаблон.</p>
      )}

      {adding && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-50">
          {/* Mode toggle */}
          {bankQuestions.length > 0 && (
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-4">
              {(['new', 'bank'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAddMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    addMode === mode ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {mode === 'new' ? 'add_circle' : 'library_books'}
                  </span>
                  {mode === 'new' ? 'Нов въпрос' : 'От банката'}
                </button>
              ))}
            </div>
          )}

          {addError && <p className="text-red-500 text-xs mb-2">{addError}</p>}

          {/* New question form */}
          {addMode === 'new' && (
            <QuestionEditForm
              initial={EMPTY_FORM}
              onSave={handleAdd}
              onCancel={() => { setAdding(false); setAddError(null) }}
              isPending={isPending}
            />
          )}

          {/* Bank picker */}
          {addMode === 'bank' && (
            <div>
              <input
                type="text"
                value={bankFilter}
                onChange={e => setBankFilter(e.target.value)}
                placeholder="Търси въпрос..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                autoFocus
              />
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {bankQuestions
                  .filter(q => !bankFilter || q.text.toLowerCase().includes(bankFilter.toLowerCase()))
                  .map(bq => {
                    const alreadyAdded = questions.some(q => q.text === bq.text)
                    return (
                      <div
                        key={bq.id}
                        className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                          alreadyAdded ? 'border-gray-100 bg-gray-50 opacity-50' : 'border-gray-100 bg-white hover:border-indigo-200'
                        }`}
                      >
                        <span className={`inline-flex items-center whitespace-nowrap text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${TYPE_COLOR[bq.type] ?? 'bg-gray-50 text-gray-500'}`}>
                          {TYPE_LABELS[bq.type] ?? bq.type}
                        </span>
                        <p className="flex-1 text-gray-800 leading-snug">{bq.text}</p>
                        <button
                          type="button"
                          disabled={alreadyAdded || isPending}
                          onClick={() => handleAddFromBank(bq)}
                          className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                          {alreadyAdded ? 'Добавен' : 'Добави'}
                        </button>
                      </div>
                    )
                  })}
                {bankQuestions.filter(q => !bankFilter || q.text.toLowerCase().includes(bankFilter.toLowerCase())).length === 0 && (
                  <p className="text-xs text-gray-400 italic px-2 py-4 text-center">Няма резултати.</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => { setAdding(false); setAddError(null); setBankFilter('') }}
                className="mt-3 text-xs text-gray-400 hover:text-gray-600"
              >
                Затвори
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
