'use client'

import { useState } from 'react'
import { addEventComment, deleteEventComment } from '../../memories/actions'

interface Props {
  studentId: string
  event: {
    id: string
    title: string
    event_date: string | null
    photos: string[]
    note: string | null
  }
  existingComment: { id: string; comment_text: string } | null
  prevUrl: string | null
  nextUrl: string | null
  eventNumber: number
  totalEvents: number
}

export default function EventCommentForm({
  studentId,
  event,
  existingComment,
  prevUrl,
  nextUrl,
  eventNumber,
  totalEvents,
}: Props) {
  const [text, setText] = useState(existingComment?.comment_text ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedCommentId, setSavedCommentId] = useState<string | null>(existingComment?.id ?? null)
  const [submitted, setSubmitted] = useState(false)

  const photo = event.photos?.[0] ?? null

  function navigateTo(url: string) {
    window.location.href = url
  }

  async function handleSubmit() {
    const value = text.trim()
    if (!value) return
    setError(null)
    setSubmitting(true)

    if (savedCommentId) {
      await deleteEventComment(savedCommentId, studentId)
      setSavedCommentId(null)
    }

    const result = await addEventComment(event.id, studentId, value)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSubmitted(true)
      navigateTo(nextUrl ?? `/my/${studentId}`)
    }
  }

  const dateFormatted = event.event_date
    ? new Date(event.event_date).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

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
          <span className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>photo_album</span>
            Събитие {eventNumber} / {totalEvents}
          </span>
        </div>

        {/* Event photo */}
        {photo ? (
          <img
            src={photo}
            alt={event.title}
            className="w-full aspect-video object-cover rounded-2xl mb-5 shadow-sm"
          />
        ) : (
          <div className="w-full aspect-video bg-teal-50 rounded-2xl flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-teal-300 text-4xl">event</span>
          </div>
        )}

        {/* Event heading */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900 leading-snug" style={{ fontFamily: 'Noto Serif, serif' }}>
            {event.title}
          </h1>
          {dateFormatted && (
            <p className="text-sm text-gray-400 mt-0.5">{dateFormatted}</p>
          )}
          {event.note && (
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{event.note}</p>
          )}
        </div>

        {/* Status banner */}
        {submitted && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-5">
            <span className="material-symbols-outlined text-base">check_circle</span>
            Коментарът е изпратен
          </div>
        )}

        {/* Textarea */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <textarea
              rows={5}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Напишете коментар към това събитие…"
              maxLength={300}
              className="w-full border border-gray-200 rounded-2xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none bg-white shadow-sm"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-300">
              {text.length}/300
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
          )}

          {/* Primary action */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {submitting ? 'Изпращане...' : existingComment && !submitted ? 'Обнови' : 'Изпрати'}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          {prevUrl ? (
            <button
              onClick={() => navigateTo(prevUrl)}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Предишно
            </button>
          ) : <span />}
          {nextUrl ? (
            <button
              onClick={() => navigateTo(nextUrl)}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Следващо
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={() => navigateTo(`/my/${studentId}`)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Готово ✓
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
