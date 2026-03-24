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
  existingVotes: Record<string, string> // pollId → nomineeStudentId
}

export default function PollsSection({ polls, classmates, voterStudentId, existingVotes }: Props) {
  const [votes, setVotes] = useState<Record<string, string>>(existingVotes)
  const [isPending, startTransition] = useTransition()
  const [pendingPollId, setPendingPollId] = useState<string | null>(null)

  function handleSelect(pollId: string, nomineeId: string) {
    const current = votes[pollId]

    // If clicking the same nominee → remove vote
    if (current === nomineeId) {
      setPendingPollId(pollId)
      startTransition(async () => {
        const result = await removeVote(pollId, voterStudentId)
        if (!result.error) {
          setVotes((prev) => {
            const next = { ...prev }
            delete next[pollId]
            return next
          })
        }
        setPendingPollId(null)
      })
    } else {
      // Cast or change vote
      setPendingPollId(pollId)
      startTransition(async () => {
        const result = await castVote(pollId, voterStudentId, nomineeId)
        if (!result.error) {
          setVotes((prev) => ({ ...prev, [pollId]: nomineeId }))
        }
        setPendingPollId(null)
      })
    }
  }

  if (polls.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Poll cards */}
      {polls.map((poll) => {
        const selectedId = votes[poll.id] ?? null
        const loading = isPending && pendingPollId === poll.id

        return (
          <div
            key={poll.id}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-start gap-3 mb-5">
              {selectedId ? (
                <span
                  className="material-symbols-outlined text-green-500 flex-shrink-0 mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              ) : (
                <span className="material-symbols-outlined text-gray-300 flex-shrink-0 mt-0.5">
                  radio_button_unchecked
                </span>
              )}
              <p
                className="font-semibold text-gray-900"
                style={{ fontFamily: 'Noto Serif, serif' }}
              >
                {poll.question}
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {classmates.map((cm) => {
                const isSelected = selectedId === cm.id
                const initials = `${cm.first_name[0]}${cm.last_name[0]}`.toUpperCase()

                return (
                  <button
                    key={cm.id}
                    onClick={() => handleSelect(poll.id, cm.id)}
                    disabled={loading}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-transparent hover:border-indigo-200 hover:bg-gray-50'
                    } ${loading ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {cm.photo_url ? (
                      <img
                        src={cm.photo_url}
                        alt={cm.first_name}
                        className={`w-12 h-12 rounded-full object-cover border-2 transition-all ${
                          isSelected ? 'border-indigo-400' : 'border-gray-100'
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-indigo-100 text-indigo-600 border-transparent'
                        }`}
                      >
                        {initials}
                      </div>
                    )}
                    <p className={`text-xs font-semibold leading-tight ${isSelected ? 'text-indigo-700' : 'text-gray-600'}`}>
                      {cm.first_name}
                    </p>
                  </button>
                )
              })}
            </div>

            {selectedId && (
              <p className="text-xs text-indigo-500 mt-3 text-right">
                Избрано · натиснете отново за промяна
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
