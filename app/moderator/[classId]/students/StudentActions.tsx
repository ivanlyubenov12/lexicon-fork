'use client'

import Link from 'next/link'
import { useState } from 'react'
import { resendInvite } from '../actions'

interface StudentActionsProps {
  studentId: string
  parentEmail: string | null
  inviteAccepted: boolean
  classId: string
  inviteToken: string
}

export default function StudentActions({
  studentId,
  parentEmail,
  inviteAccepted,
  classId,
  inviteToken,
}: StudentActionsProps) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleResend() {
    setLoading(true)
    setError(null)
    const result = await resendInvite(studentId)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSent(true)
    }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/join/${inviteToken}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Link
        href={`/moderator/${classId}/students/${studentId}/edit`}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Редактирай
      </Link>

      {!inviteAccepted && (
        <button
          onClick={handleCopyLink}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          {copied ? 'Копирано ✓' : 'Копирай линк'}
        </button>
      )}

      {parentEmail && !inviteAccepted && (
        <div className="flex items-center gap-2">
          {sent ? (
            <span className="text-sm text-green-600 font-medium">Изпратено ✓</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {loading ? 'Изпращане...' : 'Препрати имейл'}
            </button>
          )}
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
      )}
    </div>
  )
}
