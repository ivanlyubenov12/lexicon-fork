'use client'

import { useState, useTransition } from 'react'
import { addSystemQuestion } from '../actions'

const TYPES = [
  { value: 'personal',        label: 'Личен' },
  { value: 'better_together', label: 'По-добри заедно' },
  { value: 'superhero',       label: 'Супергерой' },
  { value: 'class_voice',     label: 'Глас на класа' },
  { value: 'video',           label: 'Видео' },
] as const

export default function AddQuestionForm({ nextOrder }: { nextOrder: number }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [type, setType] = useState<typeof TYPES[number]['value']>('personal')
  const [order, setOrder] = useState(nextOrder)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!text.trim()) return
    startTransition(async () => {
      const result = await addSystemQuestion({ text: text.trim(), type, order_index: order })
      if (result.error) { setError(result.error); return }
      setText('')
      setType('personal')
      setOrder(order + 1)
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
          onChange={(e) => setType(e.target.value as typeof type)}
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
