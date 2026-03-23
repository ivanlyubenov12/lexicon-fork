'use client'

import { useState } from 'react'
import { submitMessage } from './actions'

interface Classmate {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
}

interface SentMessage {
  recipient_student_id: string
  status: string
  content: string
}

interface Props {
  authorStudentId: string
  classmates: Classmate[]
  sentMessages: SentMessage[]
}

function MessageStatusBadge({ status }: { status: string }) {
  if (status === 'approved') {
    return <span className="text-xs text-green-600 font-medium">Одобрено ✓</span>
  }
  if (status === 'pending') {
    return <span className="text-xs text-yellow-600 font-medium">Чака одобрение</span>
  }
  return <span className="text-xs text-red-500 font-medium">Върнато</span>
}

function ClassmateRow({
  classmate,
  authorStudentId,
  existingMessage,
}: {
  classmate: Classmate
  authorStudentId: string
  existingMessage: SentMessage | undefined
}) {
  const [expanded, setExpanded] = useState(false)
  const [text, setText] = useState(existingMessage?.status === 'pending' ? existingMessage.content : '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const currentStatus = existingMessage?.status
  const canEdit = !currentStatus || currentStatus === 'rejected'
  const isPending = currentStatus === 'pending'
  const isApproved = currentStatus === 'approved'

  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    const result = await submitMessage(authorStudentId, classmate.id, text)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSent(true)
      setExpanded(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {classmate.photo_url ? (
            <img
              src={classmate.photo_url}
              alt={`${classmate.first_name} ${classmate.last_name}`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-semibold">
              {classmate.first_name.charAt(0)}
            </div>
          )}
          <span className="text-sm font-medium text-gray-800">
            {classmate.first_name} {classmate.last_name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {(sent || currentStatus) && (
            <MessageStatusBadge status={sent ? 'pending' : currentStatus!} />
          )}
          {!isApproved && (
            <span className={`text-gray-400 text-sm transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
              ↓
            </span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4">
          {isApproved ? (
            <p className="text-sm text-gray-500">Посланието е одобрено и не може да се редактира.</p>
          ) : (
            <div className="space-y-3">
              <textarea
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Напишете послание до ${classmate.first_name}…`}
                maxLength={300}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{text.length}/300</span>
                {error && <span className="text-xs text-red-500">{error}</span>}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !text.trim()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Изпращане...' : isPending ? 'Обнови' : 'Изпрати'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MessagesSection({ authorStudentId, classmates, sentMessages }: Props) {
  const messageMap = new Map(sentMessages.map((m) => [m.recipient_student_id, m]))

  if (classmates.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-400">
        Няма други деца в класа.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {classmates.map((classmate) => (
        <ClassmateRow
          key={classmate.id}
          classmate={classmate}
          authorStudentId={authorStudentId}
          existingMessage={messageMap.get(classmate.id)}
        />
      ))}
    </div>
  )
}
