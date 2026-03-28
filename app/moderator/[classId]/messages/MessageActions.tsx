'use client'

import { useState, useTransition } from 'react'
import { approveMessage, rejectMessage } from '../actions'

interface Props {
  message: { id: string; status: string }
  classId: string
}

export default function MessageActions({ message, classId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState(message.status)
  const [error, setError] = useState<string | null>(null)

  if (currentStatus === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
        <span className="material-symbols-outlined text-sm">check_circle</span>
        Одобрено
      </span>
    )
  }

  if (currentStatus === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
        <span className="material-symbols-outlined text-sm">cancel</span>
        Отхвърлено
      </span>
    )
  }

  function handleApprove() {
    setError(null)
    startTransition(async () => {
      const result = await approveMessage(message.id, classId)
      if (result.error) setError(result.error)
      else setCurrentStatus('approved')
    })
  }

  function handleReject() {
    setError(null)
    startTransition(async () => {
      const result = await rejectMessage(message.id, classId)
      if (result.error) setError(result.error)
      else setCurrentStatus('rejected')
    })
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">check</span>
          Одобри
        </button>
        <button
          onClick={handleReject}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-300 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">close</span>
          Отхвърли
        </button>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}
