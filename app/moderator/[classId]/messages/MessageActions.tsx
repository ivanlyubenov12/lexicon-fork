'use client'

import { useState, useTransition } from 'react'
import type { Message } from './MessagesTable'
import { approveMessage, rejectMessage } from '../actions'

interface Props {
  message: Message
  classId: string
}

export default function MessageActions({ message, classId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState(message.status)
  const [error, setError] = useState<string | null>(null)

  if (currentStatus === 'approved') {
    return <span className="text-gray-400 text-sm">Одобрено ✓</span>
  }

  if (currentStatus === 'rejected') {
    return <span className="text-gray-400 text-sm">Отхвърлено</span>
  }

  // pending
  function handleApprove() {
    setError(null)
    startTransition(async () => {
      const result = await approveMessage(message.id, classId)
      if (result.error) {
        setError(result.error)
      } else {
        setCurrentStatus('approved')
      }
    })
  }

  function handleReject() {
    setError(null)
    startTransition(async () => {
      const result = await rejectMessage(message.id, classId)
      if (result.error) {
        setError(result.error)
      } else {
        setCurrentStatus('rejected')
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

        {/* Reject button */}
        <button
          onClick={handleReject}
          disabled={isPending}
          className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 disabled:opacity-50"
        >
          Отхвърли
        </button>
      </div>

      {/* Inline error */}
      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}
