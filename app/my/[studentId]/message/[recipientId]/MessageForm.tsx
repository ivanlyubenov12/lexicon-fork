'use client'

import { useState } from 'react'
import { submitMessage } from '../../actions'

interface Props {
  studentId: string
  recipient: { id: string; first_name: string; last_name: string; photo_url: string | null }
  existingMessage: { content: string; status: string } | null
  prevUrl: string | null
  nextUrl: string | null
  messageNumber: number
  totalMessages: number
}

export default function MessageForm({
  studentId,
  recipient,
  existingMessage,
  prevUrl,
  nextUrl,
  messageNumber,
  totalMessages,
}: Props) {
  const isApproved = existingMessage?.status === 'approved'
  const isPending = existingMessage?.status === 'pending'

  const [text, setText] = useState(
    existingMessage && !isApproved ? existingMessage.content : ''
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localStatus, setLocalStatus] = useState<string | null>(existingMessage?.status ?? null)

  const currentStatus = localStatus

  function navigateTo(url: string) {
    window.location.href = url
  }

  async function handleSubmit() {
    const value = text.trim()
    if (!value) return
    setError(null)
    setSubmitting(true)
    const result = await submitMessage(studentId, recipient.id, value)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
    } else {
      setLocalStatus('pending')
      navigateTo(`/my/${studentId}`)
    }
  }

  const initials = [recipient.first_name?.[0], recipient.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-[#f4f3f2]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Back */}
        <button
          onClick={() => navigateTo(`/my/${studentId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors mb-6 font-medium"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Назад
        </button>

        {/* Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            Послание {messageNumber} / {totalMessages}
          </span>
        </div>

        {/* Recipient heading */}
        <div className="flex items-center gap-4 mb-6">
          {recipient.photo_url ? (
            <img
              src={recipient.photo_url}
              alt={recipient.first_name}
              className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold flex-shrink-0">
              {initials}
            </div>
          )}
          <h1 className="text-2xl font-bold text-indigo-900 leading-snug" style={{ fontFamily: 'Noto Serif, serif' }}>
            {recipient.first_name}{recipient.last_name ? ` ${recipient.last_name}` : ''}
          </h1>
        </div>

        {/* Status banner */}
        {currentStatus === 'approved' && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-5">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            Одобрено
          </div>
        )}
        {currentStatus === 'pending' && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-5">
            <span className="material-symbols-outlined text-base">check_circle</span>
            Изпратено за одобрение
          </div>
        )}

        {/* Approved — read-only */}
        {isApproved && (
          <div className="bg-white rounded-2xl px-5 py-4 border border-gray-100 mb-6">
            <p className="text-base text-gray-700 italic leading-relaxed">„{existingMessage?.content}"</p>
          </div>
        )}

        {/* Editable textarea */}
        {!isApproved && (
          <div className="space-y-3 mb-6">
            <div className="relative">
              <textarea
                rows={5}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={`Напишете послание до ${recipient.first_name}…`}
                maxLength={300}
                className={`w-full border rounded-2xl px-4 py-4 text-base focus:outline-none focus:ring-2 resize-none bg-white shadow-sm ${
                  text.length >= 300 ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-indigo-400'
                }`}
              />
              <div className={`absolute bottom-3 right-3 text-xs ${text.length >= 300 ? 'text-red-500 font-semibold' : 'text-gray-300'}`}>
                {text.length}/300
              </div>
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}
            <button
              onClick={handleSubmit}
              disabled={submitting || !text.trim() || text.length > 300}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {submitting ? 'Изпращане...' : isPending ? 'Обнови' : 'Изпрати'}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => prevUrl ? navigateTo(prevUrl) : navigateTo(`/my/${studentId}`)}
            className="flex-none px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            ← Назад
          </button>
          {nextUrl ? (
            <button
              onClick={() => navigateTo(nextUrl)}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Следващ →
            </button>
          ) : (
            <button
              onClick={() => navigateTo(`/my/${studentId}`)}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Готово ✓
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
