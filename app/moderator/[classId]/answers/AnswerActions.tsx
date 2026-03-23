'use client'

import { useState, useTransition } from 'react'
import type { Answer } from './AnswersTable'
import { approveAnswer, returnAnswer } from '../actions'

interface Props {
  answer: Answer
  classId: string
}

export default function AnswerActions({ answer, classId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [approved, setApproved] = useState(answer.status === 'approved')
  const [currentStatus, setCurrentStatus] = useState(answer.status)
  const [showReturnForm, setShowReturnForm] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [returned, setReturned] = useState(false)

  if (currentStatus === 'approved') {
    return (
      <span className="text-gray-400 text-sm">Одобрен ✓</span>
    )
  }

  if (currentStatus === 'draft') {
    return (
      <span className="text-gray-400 text-sm">Чернова</span>
    )
  }

  // submitted
  function handleApprove() {
    setError(null)
    startTransition(async () => {
      const result = await approveAnswer(answer.id, classId)
      if (result.error) {
        setError(result.error)
      } else {
        setCurrentStatus('approved')
        setApproved(true)
      }
    })
  }

  function handleReturnToggle() {
    setShowReturnForm((prev) => !prev)
    setError(null)
  }

  function handleSendNote() {
    if (!note.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await returnAnswer(answer.id, note.trim(), classId)
      if (result.error) {
        setError(result.error)
      } else {
        setCurrentStatus('draft')
        setReturned(true)
        setShowReturnForm(false)
        setNote('')
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* Approve button */}
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
        >
          Одобри
        </button>

        {/* Return button */}
        <button
          onClick={handleReturnToggle}
          disabled={isPending}
          className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
        >
          Върни
        </button>
      </div>

      {/* Rejection note form */}
      {showReturnForm && (
        <div className="flex flex-col gap-1 mt-1">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Бележка до родителя…"
            rows={2}
            className="border border-gray-300 rounded px-2 py-1 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400 w-52"
          />
          <button
            onClick={handleSendNote}
            disabled={isPending || !note.trim()}
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50 self-start"
          >
            Изпрати бележка
          </button>
        </div>
      )}

      {/* Inline error */}
      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}
