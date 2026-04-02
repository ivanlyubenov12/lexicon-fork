'use client'

import { useState, useTransition } from 'react'
import { addSystemQuestion } from '../actions'

const TYPES = [
  { value: 'personal',        label: 'Въпрос за мен' },
  { value: 'video',           label: 'Видео' },
  { value: 'photo',           label: 'Снимка' },
  { value: 'class_voice',     label: 'Анонимен' },
  { value: 'survey',          label: 'Анкета с отговори' },
  { value: 'better_together', label: 'По-добри заедно' },
  { value: 'superhero',       label: 'Супергерой' },
] as const

type TypeValue = typeof TYPES[number]['value']

const DEFAULT_MAX_LENGTH = 150

export default function AddQuestionForm({ nextOrder }: { nextOrder: number }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [type, setType] = useState<TypeValue>('personal')
  const [order, setOrder] = useState(nextOrder)
  const [maxLength, setMaxLength] = useState<string>(String(DEFAULT_MAX_LENGTH))
  const [pollOptions, setPollOptions] = useState<string[]>(['', ''])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const hasTextInput = type !== 'video' && type !== 'survey' && type !== 'better_together' && type !== 'superhero'

  function handleSubmit() {
    if (!text.trim()) return
    const options = type === 'survey' ? pollOptions.filter(o => o.trim()) : null
    if (type === 'survey' && (!options || options.length < 2)) {
      setError('Добави поне 2 отговора за анкетата.')
      return
    }
    const parsedMax = hasTextInput && maxLength ? parseInt(maxLength) : null
    startTransition(async () => {
      const result = await addSystemQuestion({
        text: text.trim(),
        type,
        order_index: order,
        poll_options: options,
        max_length: parsedMax,
      })
      if (result.error) { setError(result.error); return }
      setText('')
      setType('personal')
      setOrder(order + 1)
      setMaxLength(String(DEFAULT_MAX_LENGTH))
      setPollOptions(['', ''])
      setOpen(false)
      setError(null)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 px-4 py-2.5 border border-dashed border-indigo-200 rounded-xl hover:border-indigo-400 transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
        Добави въпрос
      </button>
    )
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-3">
      <p className="text-sm font-bold text-indigo-800">Нов системен въпрос</p>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Текст на въпроса..."
        className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        autoFocus
      />
      <div className="flex gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TypeValue)}
          className="border border-indigo-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
          className="w-20 border border-indigo-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          title="Пореден номер"
          min={1}
        />
      </div>

      {hasTextInput && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-indigo-700 whitespace-nowrap">Макс. знаци</label>
          <input
            type="number"
            min={10}
            max={2000}
            value={maxLength}
            onChange={(e) => setMaxLength(e.target.value)}
            placeholder="без ограничение"
            className="w-28 border border-indigo-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      )}

      {type === 'survey' && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Отговори</p>
          {pollOptions.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={opt}
                onChange={e => {
                  const next = [...pollOptions]
                  next[i] = e.target.value
                  setPollOptions(next)
                }}
                placeholder={`Отговор ${i + 1}`}
                className="flex-1 border border-indigo-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {pollOptions.length > 2 && (
                <button
                  type="button"
                  onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-500 px-2"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPollOptions([...pollOptions, ''])}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Добави отговор
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={isPending || !text.trim()}
          className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? 'Добавяне…' : 'Добави'}
        </button>
        <button
          onClick={() => { setOpen(false); setError(null) }}
          className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
        >
          Отказ
        </button>
      </div>
    </div>
  )
}
