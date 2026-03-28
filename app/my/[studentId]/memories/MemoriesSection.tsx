'use client'

import { useState, useTransition } from 'react'
import { addEventComment, deleteEventComment } from './actions'

interface EventComment {
  id: string
  comment_text: string
  created_at: string
}

interface Event {
  id: string
  title: string
  event_date: string | null
  photos: string[]
  myComment: EventComment | null
}

interface Props {
  studentId: string
  events: Event[]
}

export default function MemoriesSection({ studentId, events }: Props) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <span className="material-symbols-outlined text-4xl text-gray-300 block mb-3">photo_album</span>
        <p className="text-gray-400 text-sm">Учителят все още не е добавил спомени.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {events.map(event => (
        <EventCommentCard key={event.id} event={event} studentId={studentId} />
      ))}
    </div>
  )
}

function EventCommentCard({ event, studentId }: { event: Event; studentId: string }) {
  const [comment, setComment] = useState(event.myComment?.comment_text ?? '')
  const [saved, setSaved] = useState(!!event.myComment)
  const [savedId, setSavedId] = useState(event.myComment?.id ?? null)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const photo = event.photos?.[0] ?? null

  function handleSave() {
    setError(null)
    startTransition(async () => {
      // If already saved, delete first then re-add
      if (savedId) {
        await deleteEventComment(savedId, studentId)
        setSavedId(null)
      }
      const result = await addEventComment(event.id, studentId, comment)
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setEditing(false)
      }
    })
  }

  function handleDelete() {
    if (!savedId) return
    setError(null)
    startTransition(async () => {
      const result = await deleteEventComment(savedId, studentId)
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(false)
        setSavedId(null)
        setComment('')
        setEditing(false)
      }
    })
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Full-width photo */}
      {photo ? (
        <img src={photo} alt={event.title} className="w-full aspect-video object-cover" />
      ) : (
        <div className="w-full aspect-video bg-indigo-50 flex items-center justify-center">
          <span className="material-symbols-outlined text-indigo-300 text-4xl">event</span>
        </div>
      )}

      <div className="p-4">
        {/* Info */}
        <div className="min-w-0 mb-3">
          <p className="font-semibold text-gray-800 text-sm">{event.title}</p>
          {event.event_date && (
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(event.event_date).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}

          {/* Comment display / form */}
          <div className="mt-3">
            {saved && !editing ? (
              <div className="bg-indigo-50 rounded-xl px-3 py-2.5">
                <p className="text-sm text-indigo-800 leading-snug" style={{ fontFamily: 'Noto Serif, serif' }}>
                  „{comment}"
                </p>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-600 transition-colors"
                  >
                    Редактирай
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Изтрий
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={2}
                  maxLength={300}
                  placeholder="Напиши коментар към тази снимка..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isPending || !comment.trim()}
                    className="bg-indigo-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isPending ? 'Запазване...' : 'Запази'}
                  </button>
                  {(saved || editing) && (
                    <button
                      onClick={() => { setEditing(false); setComment(event.myComment?.comment_text ?? '') }}
                      disabled={isPending}
                      className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5"
                    >
                      Отказ
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
