'use client'

import { useState, useTransition } from 'react'
import { castVote, removeVote } from '../../polls-action'

interface Classmate {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
}

interface Props {
  studentId: string
  poll: { id: string; question: string }
  classmates: Classmate[]
  existingVote: string | null
  prevUrl: string | null
  nextUrl: string | null
  questionNumber: number
  totalQuestions: number
}

export default function PollAnswerPage({
  studentId, poll, classmates, existingVote,
  prevUrl, nextUrl, questionNumber, totalQuestions,
}: Props) {
  const [vote, setVote] = useState<string | null>(existingVote)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSelect(nomineeId: string) {
    if (isPending) return
    const isReselect = vote === nomineeId
    if (isReselect) {
      startTransition(async () => {
        const result = await removeVote(poll.id, studentId)
        if (result.error) setError(result.error)
        else setVote(null)
      })
    } else {
      const wasFirstVote = !vote
      startTransition(async () => {
        const result = await castVote(poll.id, studentId, nomineeId)
        if (result.error) { setError(result.error); return }
        setVote(nomineeId)
        if (wasFirstVote) {
          window.location.href = nextUrl ?? `/my/${studentId}`
        }
      })
    }
  }

  const selectedClassmate = vote ? classmates.find(c => c.id === vote) : null

  return (
    <div className="min-h-screen bg-[#f4f3f2]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Back */}
        <button
          onClick={() => { window.location.href = `/my/${studentId}` }}
          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors mb-6 font-medium"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Назад
        </button>

        {/* Question header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              <span className="material-symbols-outlined text-xs">how_to_vote</span>
              Въпрос {questionNumber} / {totalQuestions}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-indigo-900 leading-snug" style={{ fontFamily: 'Noto Serif, serif' }}>
            {poll.question}
          </h1>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">lock</span>
            Резултатите са анонимни — никой не знае кой кого е избрал
          </p>
        </div>

        {/* Selected indicator */}
        {vote && selectedClassmate && (
          <div className="bg-violet-50 border border-violet-200 text-violet-800 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-3">
            {selectedClassmate.photo_url ? (
              <img src={selectedClassmate.photo_url} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-violet-300 flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 font-bold text-xs flex-shrink-0">
                {selectedClassmate.first_name?.[0] ?? ''}{selectedClassmate.last_name?.[0] ?? ''}
              </div>
            )}
            <span className="font-semibold flex-1">{selectedClassmate.first_name} {selectedClassmate.last_name}</span>
            <span className="material-symbols-outlined text-violet-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
        )}

        {/* Classmate grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
          {classmates.map(cm => {
            const isSelected = vote === cm.id
            const initials = `${cm.first_name?.[0] ?? ''}${cm.last_name?.[0] ?? ''}`.toUpperCase()
            return (
              <button
                key={cm.id}
                onClick={() => handleSelect(cm.id)}
                disabled={isPending}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
                  isSelected ? 'border-violet-500 bg-violet-50' : 'border-transparent hover:border-violet-200 hover:bg-white'
                } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
              >
                {cm.photo_url ? (
                  <img
                    src={cm.photo_url}
                    alt={cm.first_name}
                    className={`w-12 h-12 rounded-full object-cover border-2 transition-all ${isSelected ? 'border-violet-400' : 'border-gray-100'}`}
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                    isSelected ? 'bg-violet-600 text-white border-violet-600' : 'bg-violet-100 text-violet-600 border-transparent'
                  }`}>{initials}</div>
                )}
                <p className={`text-xs font-semibold leading-tight ${isSelected ? 'text-violet-700' : 'text-gray-600'}`}>
                  {cm.first_name}
                </p>
              </button>
            )
          })}
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">{error}</div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-5 border-t border-gray-200">
          {prevUrl ? (
            <button
              onClick={() => { window.location.href = prevUrl }}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Предишен
            </button>
          ) : <span />}
          {nextUrl ? (
            <button
              onClick={() => { window.location.href = nextUrl }}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Следващ
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={() => { window.location.href = `/my/${studentId}` }}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Готово ✓
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
