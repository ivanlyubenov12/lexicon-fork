'use client'

import { useState, useTransition } from 'react'
import { castVote, removeVote } from './polls-action'

interface Poll {
  id: string
  question: string
  order_index: number
}

interface Classmate {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
}

interface Props {
  polls: Poll[]
  classmates: Classmate[]
  voterStudentId: string
  existingVotes: Record<string, string>
  onFinalize?: () => void
}

export default function PollsSection({ polls, classmates, voterStudentId, existingVotes, onFinalize }: Props) {
  const [votes, setVotes] = useState<Record<string, string>>(existingVotes)
  const [isPending, startTransition] = useTransition()
  const [pendingPollId, setPendingPollId] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [reselecting, setReselecting] = useState<Set<string>>(new Set())

  if (polls.length === 0) return null

  const poll = polls[currentIndex]
  const selectedId = votes[poll.id] ?? null
  const loading = isPending && pendingPollId === poll.id
  const isReselecting = reselecting.has(poll.id)
  const showGrid = !selectedId || isReselecting
  const selectedClassmate = selectedId ? classmates.find(c => c.id === selectedId) : null

  function handleSelect(pollId: string, nomineeId: string) {
    const current = votes[pollId]
    if (current === nomineeId) {
      setPendingPollId(pollId)
      startTransition(async () => {
        const result = await removeVote(pollId, voterStudentId)
        if (!result.error) {
          setVotes(prev => { const next = { ...prev }; delete next[pollId]; return next })
        }
        setPendingPollId(null)
      })
    } else {
      setPendingPollId(pollId)
      startTransition(async () => {
        const result = await castVote(pollId, voterStudentId, nomineeId)
        if (!result.error) {
          setVotes(prev => ({ ...prev, [pollId]: nomineeId }))
          setReselecting(prev => { const next = new Set(prev); next.delete(pollId); return next })
        }
        setPendingPollId(null)
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Step counter */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{currentIndex + 1} от {polls.length}</span>
        {Object.keys(votes).length > 0 && (
          <span className="text-emerald-600 font-medium">{Object.keys(votes).length} / {polls.length} гласа</span>
        )}
      </div>

      {/* Poll card */}
      <div className="bg-[#faf9f8] rounded-2xl p-5">
        <div className="flex items-start gap-3 mb-5">
          {selectedId && !isReselecting ? (
            <span className="material-symbols-outlined text-emerald-500 flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          ) : (
            <span className="material-symbols-outlined text-gray-300 flex-shrink-0 mt-0.5">radio_button_unchecked</span>
          )}
          <p className="font-semibold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
            {poll.question}
          </p>
        </div>

        {/* Collapsed: show selected child */}
        {selectedId && !isReselecting && selectedClassmate && (
          <div className="flex items-center gap-3 pl-8">
            {selectedClassmate.photo_url ? (
              <img
                src={selectedClassmate.photo_url}
                alt={selectedClassmate.first_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm bg-indigo-600 text-white border-2 border-indigo-600 flex-shrink-0">
                {selectedClassmate.first_name?.[0] ?? ''}{selectedClassmate.last_name?.[0] ?? ''}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-indigo-800">
                {selectedClassmate.first_name} {selectedClassmate.last_name}
              </p>
              <button
                onClick={() => setReselecting(prev => new Set([...prev, poll.id]))}
                className="text-xs text-indigo-400 hover:text-indigo-600 underline underline-offset-2 transition-colors mt-0.5 block"
              >
                Избери отново
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        {showGrid && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {classmates.map(cm => {
              const isSelected = selectedId === cm.id
              const initials = `${cm.first_name?.[0] ?? ''}${cm.last_name?.[0] ?? ''}`.toUpperCase()
              return (
                <button
                  key={cm.id}
                  onClick={() => handleSelect(poll.id, cm.id)}
                  disabled={loading}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
                    isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:border-indigo-200 hover:bg-white'
                  } ${loading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {cm.photo_url ? (
                    <img
                      src={cm.photo_url}
                      alt={cm.first_name}
                      className={`w-12 h-12 rounded-full object-cover border-2 transition-all ${isSelected ? 'border-indigo-400' : 'border-gray-100'}`}
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                      isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-100 text-indigo-600 border-transparent'
                    }`}>{initials}</div>
                  )}
                  <p className={`text-xs font-semibold leading-tight ${isSelected ? 'text-indigo-700' : 'text-gray-600'}`}>
                    {cm.first_name}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex-none px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          ← Назад
        </button>
        {currentIndex < polls.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(i => i + 1)}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Напред →
          </button>
        ) : (
          <button
            onClick={onFinalize}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Финализирай секцията ✓
          </button>
        )}
      </div>
    </div>
  )
}
