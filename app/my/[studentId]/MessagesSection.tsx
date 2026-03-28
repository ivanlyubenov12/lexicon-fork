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
  onMessageSent?: () => void
  onFinalize?: () => void
}

function ClassmateMessageCard({
  classmate,
  authorStudentId,
  existingMessage,
  onMessageSent,
}: {
  classmate: Classmate
  authorStudentId: string
  existingMessage: SentMessage | undefined
  onMessageSent?: () => void
}) {
  const [text, setText] = useState(
    existingMessage?.status === 'pending' || existingMessage?.status === 'rejected'
      ? existingMessage.content
      : ''
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const currentStatus = sent ? 'pending' : existingMessage?.status
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
      onMessageSent?.()
    }
  }

  return (
    <div className="bg-[#faf9f8] rounded-2xl p-5 space-y-4">
      {/* Classmate header */}
      <div className="flex items-center gap-3">
        {classmate.photo_url ? (
          <img
            src={classmate.photo_url}
            alt={`${classmate.first_name} ${classmate.last_name}`}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-semibold flex-shrink-0">
            {classmate.first_name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-bold text-gray-800">{classmate.first_name} {classmate.last_name}</p>
          {currentStatus === 'approved' && (
            <span className="text-xs text-emerald-600 font-medium">Одобрено ✓</span>
          )}
          {currentStatus === 'pending' && (
            <span className="text-xs text-amber-600 font-medium">Чака одобрение</span>
          )}
        </div>
      </div>

      {isApproved ? (
        <div className="bg-white rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-sm text-gray-600 italic">„{existingMessage?.content}"</p>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            rows={3}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Напишете послание до ${classmate.first_name}…`}
            maxLength={300}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-white"
          />
          {sent ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium py-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
              Изпратено за одобрение ✓
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{text.length}/300</span>
              {error && <span className="text-xs text-red-500">{error}</span>}
              <button
                onClick={handleSubmit}
                disabled={submitting || !text.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Изпращане...' : existingMessage?.status === 'pending' ? 'Обнови' : 'Изпрати'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MessagesSection({ authorStudentId, classmates, sentMessages, onMessageSent, onFinalize }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const messageMap = new Map(sentMessages.map(m => [m.recipient_student_id, m]))

  if (classmates.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-400">
        Няма други деца в класа.
      </div>
    )
  }

  const classmate = classmates[currentIndex]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{currentIndex + 1} от {classmates.length}</span>
        {sentMessages.length > 0 && (
          <span className="text-emerald-600 font-medium">{sentMessages.length} / {classmates.length} послания</span>
        )}
      </div>

      <ClassmateMessageCard
        key={classmate.id}
        classmate={classmate}
        authorStudentId={authorStudentId}
        existingMessage={messageMap.get(classmate.id)}
        onMessageSent={onMessageSent}
      />

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex-none px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          ← Назад
        </button>
        {currentIndex < classmates.length - 1 ? (
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
