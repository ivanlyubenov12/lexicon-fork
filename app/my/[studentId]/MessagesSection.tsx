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

export default function MessagesSection({ authorStudentId, classmates, sentMessages, onMessageSent, onFinalize }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [localMessages, setLocalMessages] = useState<Map<string, { status: string; content: string }>>(
    new Map(sentMessages.map(m => [m.recipient_student_id, { status: m.status, content: m.content }]))
  )
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (classmates.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-400">
        Няма други участници.
      </div>
    )
  }

  const classmate = classmates[currentIndex]
  const existing = localMessages.get(classmate.id)
  const isApproved = existing?.status === 'approved'
  const isPending = existing?.status === 'pending'

  function goTo(index: number) {
    setCurrentIndex(index)
    const next = classmates[index]
    const nextMsg = localMessages.get(next.id)
    setText(nextMsg && nextMsg.status !== 'approved' ? nextMsg.content : '')
    setError(null)
  }

  async function handleSubmit() {
    const value = text.trim()
    if (!value) return
    setError(null)
    setSubmitting(true)
    const result = await submitMessage(authorStudentId, classmate.id, value)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
    } else {
      setLocalMessages(prev => new Map(prev).set(classmate.id, { status: 'pending', content: value }))
      onMessageSent?.()
    }
  }

  const sentCount = [...localMessages.values()].filter(m => m.status === 'pending' || m.status === 'approved').length

  return (
    <div className="min-h-screen bg-[#f4f3f2]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            Послание {currentIndex + 1} / {classmates.length}
          </span>
        </div>

        {/* Person */}
        <div className="flex items-center gap-4 mb-6">
          {classmate.photo_url ? (
            <img
              src={classmate.photo_url}
              alt={classmate.first_name}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold flex-shrink-0">
              {classmate.first_name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-indigo-900 leading-snug" style={{ fontFamily: 'Noto Serif, serif' }}>
              {classmate.first_name}{classmate.last_name ? ` ${classmate.last_name}` : ''}
            </h1>
            {sentCount > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">{sentCount} / {classmates.length} послания изпратени</p>
            )}
          </div>
        </div>

        {/* Status banner */}
        {isApproved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-5">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            Одобрено
          </div>
        )}
        {isPending && !isApproved && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl mb-5">
            <span className="material-symbols-outlined text-base">schedule</span>
            Чака одобрение
          </div>
        )}

        {/* Approved message display */}
        {isApproved && (
          <div className="bg-white rounded-2xl px-5 py-4 border border-gray-100 mb-6">
            <p className="text-base text-gray-700 italic leading-relaxed">„{existing?.content}"</p>
          </div>
        )}

        {/* Input */}
        {!isApproved && (
          <div className="space-y-3 mb-6">
            <textarea
              rows={5}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Напишете послание до ${classmate.first_name}…`}
              maxLength={300}
              className="w-full border border-gray-200 rounded-2xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-white shadow-sm"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{text.length}/300</span>
              {error && <span className="text-xs text-red-500">{error}</span>}
              <button
                onClick={handleSubmit}
                disabled={submitting || !text.trim()}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {submitting ? 'Изпращане...' : isPending ? 'Обнови' : 'Изпрати'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="flex-none px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            ← Назад
          </button>
          {currentIndex < classmates.length - 1 ? (
            <button
              onClick={() => goTo(currentIndex + 1)}
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
    </div>
  )
}
