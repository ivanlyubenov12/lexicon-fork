'use client'

import { useState, useTransition, useRef } from 'react'
import { createPoll, deletePoll, reorderPolls } from './actions'

const SUGGESTIONS = [
  'Най-голям шегаджия в класа',
  'Бъдещ президент',
  'Най-добър спортист',
  'Душата на класа',
  'Най-усмихнат',
  'Най-мил/мила',
  'Бъдещ учен',
  'Най-голям мечтател',
  'Бъдеща поп звезда',
  'Най-добър приятел',
]

interface Poll {
  id: string
  question: string
  order_index: number
  vote_counts: Array<{ nominee_name: string; votes: number }>
}

interface Props {
  classId: string
  initialPolls: Poll[]
  studentCount: number
}

export default function PollsEditor({ classId, initialPolls, studentCount }: Props) {
  const [polls, setPolls] = useState(initialPolls)
  const [adding, setAdding] = useState(false)
  const [customText, setCustomText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const dragIndex = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const MAX_POLLS = 10

  function handleAdd(question: string) {
    if (!question.trim() || polls.length >= MAX_POLLS) return
    const nextIndex = polls.length > 0 ? Math.max(...polls.map((p) => p.order_index)) + 1 : 1
    startTransition(async () => {
      const result = await createPoll(classId, question.trim(), nextIndex)
      if (result.error) {
        setError(result.error)
      } else {
        setPolls((prev) => [
          ...prev,
          { id: 'pending-' + Date.now(), question: question.trim(), order_index: nextIndex, vote_counts: [] },
        ])
        setCustomText('')
        setAdding(false)
        setError(null)
      }
    })
  }

  function handleDragStart(index: number) {
    dragIndex.current = index
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setDragOverIndex(index)
  }

  function handleDrop(index: number) {
    const from = dragIndex.current
    if (from === null || from === index) {
      dragIndex.current = null
      setDragOverIndex(null)
      return
    }
    const reordered = [...polls]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(index, 0, moved)
    setPolls(reordered)
    dragIndex.current = null
    setDragOverIndex(null)
    startTransition(async () => {
      await reorderPolls(classId, reordered.map((p) => p.id))
    })
  }

  function handleDragEnd() {
    dragIndex.current = null
    setDragOverIndex(null)
  }

  function handleDelete(pollId: string) {
    if (!confirm('Изтриване на анкетата?')) return
    startTransition(async () => {
      const result = await deletePoll(classId, pollId)
      if (!result.error) {
        setPolls((prev) => prev.filter((p) => p.id !== pollId))
      }
    })
  }

  const alreadyAdded = new Set(polls.map((p) => p.question))

  return (
    <div>
      {/* ── Actions bar ───────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-end gap-2">
        {polls.length < MAX_POLLS && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl hover:border-indigo-300 hover:text-indigo-700 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Нова анкета
          </button>
        )}
      </div>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <div className="flex gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
          <span className="material-symbols-outlined text-indigo-400 text-xl">poll</span>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Анкети</p>
            <p className="text-lg font-bold text-gray-800">{polls.length} / {MAX_POLLS}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
          <span className="material-symbols-outlined text-amber-400 text-xl">group</span>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Деца</p>
            <p className="text-lg font-bold text-gray-800">{studentCount}</p>
          </div>
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────── */}
      {error && (
        <p className="text-red-500 text-sm mb-4 px-1">{error}</p>
      )}

      {/* ── Add form ──────────────────────────────────────────────── */}
      {adding && (
        <div className="bg-white border border-indigo-200 rounded-2xl p-6 shadow-sm mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-4">
            Нова анкета
          </p>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 mb-5">
            {SUGGESTIONS.filter((s) => !alreadyAdded.has(s)).map((s) => (
              <button
                key={s}
                onClick={() => handleAdd(s)}
                disabled={isPending}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                + {s}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd(customText)}
              placeholder="Или напиши свой въпрос..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={() => handleAdd(customText)}
              disabled={isPending || !customText.trim()}
              className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? '...' : 'Добави'}
            </button>
            <button
              onClick={() => { setAdding(false); setCustomText('') }}
              className="text-gray-400 hover:text-gray-600 text-sm px-3"
            >
              Отказ
            </button>
          </div>
        </div>
      )}

      {/* ── Polls list ────────────────────────────────────────────── */}
      {polls.length === 0 && !adding ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center mb-8">
          <span className="material-symbols-outlined text-4xl text-gray-300 block mb-3">poll</span>
          <p className="text-gray-500 text-sm font-medium">Няма добавени анкети</p>
          <p className="text-gray-400 text-xs mt-1">
            Натиснете „Нова анкета" или изберете от предложенията по-горе.
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {polls.map((poll, i) => {
            const totalVotes = poll.vote_counts.reduce((s, v) => s + v.votes, 0)
            const topWinner = poll.vote_counts[0] ?? null

            return (
              <div
                key={poll.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                className={`group bg-white border rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                  dragOverIndex === i ? 'border-indigo-400 scale-[1.01]' : 'border-gray-100'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="material-symbols-outlined text-gray-300 group-hover:text-gray-400 text-base transition-colors select-none">
                      drag_indicator
                    </span>
                    <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-sm">
                      {i + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-lg text-indigo-700 font-semibold leading-snug"
                      style={{ fontFamily: 'Noto Serif, serif' }}
                    >
                      {poll.question}
                    </p>

                    {totalVotes > 0 ? (
                      <div className="mt-2 space-y-1">
                        {poll.vote_counts.slice(0, 3).map((v) => (
                          <div key={v.nominee_name} className="flex items-center gap-2">
                            <div
                              className="h-1.5 bg-indigo-400 rounded-full"
                              style={{ width: `${Math.round((v.votes / totalVotes) * 100)}%`, minWidth: 8 }}
                            />
                            <span className="text-xs text-gray-500">
                              {v.nominee_name} · {v.votes} гл.
                            </span>
                          </div>
                        ))}
                        <p className="text-xs text-gray-400 mt-1">{totalVotes} гласа общо</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">Все още няма гласове</p>
                    )}
                  </div>

                  {topWinner && (
                    <div className="flex-shrink-0 text-center hidden sm:block">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Лидер</p>
                      <p className="text-sm font-bold text-indigo-700">{topWinner.nominee_name}</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleDelete(poll.id)}
                    disabled={isPending}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 disabled:opacity-20"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Info box ──────────────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-4">
        <span className="material-symbols-outlined text-amber-500 text-xl flex-shrink-0 mt-0.5">info</span>
        <div className="text-sm text-amber-800 leading-relaxed">
          <p className="font-semibold mb-1">Как работи гласуването?</p>
          <p>
            Родителите гласуват от профилната страница на детето си. Всяко дете дава по един глас за всяка анкета, избирайки съученик от класа. Резултатите са видими тук в реално време.
          </p>
        </div>
      </div>
    </div>
  )
}
