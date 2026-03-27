'use client'

import { useState, useTransition } from 'react'
import { updateSystemQuestion, deleteSystemQuestion } from '../actions'

interface Props {
  id: string
  text: string
  type: string
  orderIndex: number
  voiceDisplay: string | null
  allowsMedia: boolean
}

const TYPE_LABEL: Record<string, string> = {
  personal: 'Личен',
  better_together: 'По-добри заедно',
  superhero: 'Супергерой',
  class_voice: 'Глас на класа',
  video: 'Видео въпрос',
}
const TYPE_COLOR: Record<string, string> = {
  personal: 'bg-blue-50 text-blue-600',
  better_together: 'bg-green-50 text-green-600',
  superhero: 'bg-purple-50 text-purple-600',
  class_voice: 'bg-amber-50 text-amber-600',
  video: 'bg-rose-50 text-rose-600',
}

export default function QuestionRow({ id, text, type, orderIndex, voiceDisplay, allowsMedia }: Props) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(text)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    if (!value.trim()) return
    startTransition(async () => {
      const result = await updateSystemQuestion(id, value.trim())
      if (result.error) { setError(result.error); return }
      setEditing(false)
      setError(null)
    })
  }

  function handleDelete() {
    if (!confirm('Сигурни ли сте, че искате да изтриете този въпрос?')) return
    startTransition(async () => {
      await deleteSystemQuestion(id)
    })
  }

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 group">
      {/* Order index */}
      <td className="px-4 py-3 text-xs text-gray-400 font-mono w-8 align-top pt-4">{orderIndex}</td>

      {/* Badges: type + format */}
      <td className="px-4 py-3 align-top pt-3.5 w-52">
        <div className="flex flex-col gap-1.5">
          <span className={`inline-flex items-center whitespace-nowrap text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${TYPE_COLOR[type] ?? 'bg-gray-50 text-gray-500'}`}>
            {TYPE_LABEL[type] ?? type}
          </span>
          {type === 'class_voice' && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 w-fit">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                {voiceDisplay === 'barchart' ? 'bar_chart' : 'cloud'}
              </span>
              {voiceDisplay === 'barchart' ? 'Бар диаграма' : 'Облак от думи'}
            </span>
          )}
          {allowsMedia && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 w-fit">
              <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>videocam</span>
              Само видео
            </span>
          )}
          {!allowsMedia && type !== 'class_voice' && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-400 w-fit">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>article</span>
              Само текст
            </span>
          )}
        </div>
      </td>

      {/* Question text */}
      <td className="px-4 py-3 w-full">
        {editing ? (
          <div className="flex flex-col gap-1.5">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border border-indigo-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoFocus
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="text-xs font-semibold bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isPending ? 'Запазване…' : 'Запази'}
              </button>
              <button
                onClick={() => { setEditing(false); setValue(text) }}
                className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1"
              >
                Отказ
              </button>
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-800 leading-relaxed">{value}</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right align-top pt-3.5">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Редактирай"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
            title="Изтрий"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
          </button>
        </div>
      </td>
    </tr>
  )
}
