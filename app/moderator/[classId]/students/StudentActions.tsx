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
    if (result.error) setError(result.error)
    else setSent(true)
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/join/${inviteToken}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link
        href={`/moderator/${classId}/students/${studentId}/preview`}
        className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>auto_stories</span>
        Профил
      </Link>

      <Link
        href={`/moderator/${classId}/students/${studentId}/questionnaire`}
        className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>assignment</span>
        Въпросник
      </Link>

      <Link
        href={`/moderator/${classId}/students/${studentId}/edit`}
        className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
        Редактирай
      </Link>

      {!inviteAccepted && (
        <button
          onClick={handleCopyLink}
          className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
            copied ? 'text-green-600' : 'text-gray-400 hover:text-indigo-600'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            {copied ? 'check' : 'link'}
          </span>
          {copied ? 'Копирано' : 'Копирай линк'}
        </button>
      )}

      {parentEmail && !inviteAccepted && (
        sent ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
            Изпратено
          </span>
        ) : (
          <button
            onClick={handleResend}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>forward_to_inbox</span>
            {loading ? 'Изпращане...' : 'Препрати имейл'}
          </button>
        )
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
