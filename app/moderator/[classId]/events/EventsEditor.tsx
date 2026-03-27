'use client'

import { useState, useTransition } from 'react'
import { createEvent, updateEvent, deleteEvent } from './actions'
import DateInput from '@/components/DateInput'

const MAX_PHOTOS = 5

interface Event {
  id: string
  title: string
  event_date: string | null
  note: string | null
  photos: string[]
  order_index: number
}

const MAX_EVENTS = 10

const PREDEFINED = [
  { title: 'Откриване на учебната година', emoji: '🎒' },
  { title: 'Коледно тържество', emoji: '🎄' },
  { title: 'Край на учебната година', emoji: '🎓' },
]

const SUGGESTIONS = [
  { title: 'Зелено училище', emoji: '🌿' },
  { title: 'Екскурзия', emoji: '🚌' },
  { title: 'Ски училище', emoji: '⛷️' },
  { title: 'Празник на буквите', emoji: '📖' },
  { title: 'Спортен ден', emoji: '⚽' },
  { title: 'Карнавал', emoji: '🎭' },
  { title: 'Патронен празник', emoji: '🏫' },
  { title: 'Коледарско тържество', emoji: '🎅' },
  { title: 'Театър', emoji: '🎪' },
  { title: 'Баба Марта', emoji: '🪡' },
]

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── Inline event form ─────────────────────────────────────────────────────

function EventForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial: { title: string; event_date: string; note: string }
  onSave: (data: { title: string; event_date: string; note: string }) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [form, setForm] = useState(initial)

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Название</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Напр. Коледно тържество"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Дата <span className="text-gray-400 font-normal">(по желание)</span>
          </label>
          <DateInput
            value={form.event_date}
            onChange={v => setForm(f => ({ ...f, event_date: v }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Бележка <span className="text-gray-400 font-normal">(по желание)</span>
          </label>
          <input
            type="text"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="Напр. Актова зала"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={isPending || !form.title.trim()}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Запазване...' : 'Запази'}
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2"
        >
          Отказ
        </button>
      </div>
    </div>
  )
}

// ─── Single event row ──────────────────────────────────────────────────────

function EventRow({
  event,
  classId,
  index,
}: {
  event: Event
  classId: string
  index: number
}) {
  const [editing, setEditing] = useState(false)
  const [photos, setPhotos] = useState<string[]>(event.photos ?? [])
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave(form: { title: string; event_date: string; note: string }) {
    startTransition(async () => {
      const result = await updateEvent(classId, event.id, {
        title: form.title,
        event_date: form.event_date || null,
        note: form.note || null,
      })
      if (!result.error) setEditing(false)
    })
  }

  function handleDelete() {
    if (!confirm(`Изтриване на „${event.title}"?`)) return
    startTransition(async () => {
      await deleteEvent(classId, event.id)
    })
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''
    const slots = MAX_PHOTOS - photos.length
    const toUpload = files.slice(0, slots)
    setUploading(true)
    try {
      // Upload all files in parallel
      const results = await Promise.all(
        toUpload.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          const res = await fetch('/api/media/upload', { method: 'POST', body: formData })
          const data = await res.json()
          return data.url as string | undefined
        })
      )
      const uploaded = results.filter(Boolean) as string[]
      if (uploaded.length > 0) {
        const newPhotos = [...photos, ...uploaded]
        setPhotos(newPhotos)
        await updateEvent(classId, event.id, {
          title: event.title,
          event_date: event.event_date,
          note: event.note,
          photos: newPhotos,
        })
      }
    } finally {
      setUploading(false)
    }
  }

  async function handleRemovePhoto(url: string) {
    const newPhotos = photos.filter((p) => p !== url)
    setPhotos(newPhotos)
    await updateEvent(classId, event.id, {
      title: event.title,
      event_date: event.event_date,
      note: event.note,
      photos: newPhotos,
    })
  }

  if (editing) {
    return (
      <EventForm
        initial={{
          title: event.title,
          event_date: event.event_date ?? '',
          note: event.note ?? '',
        }}
        onSave={handleSave}
        onCancel={() => setEditing(false)}
        isPending={isPending}
      />
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 space-y-3">
      <div className="flex items-center gap-4">
        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{event.title}</p>
          <div className="flex items-center gap-3 mt-0.5">
            {event.event_date && (
              <span className="text-xs text-gray-400">{formatDate(event.event_date)}</span>
            )}
            {event.note && (
              <span className="text-xs text-gray-400 italic">{event.note}</span>
            )}
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-400 hover:text-indigo-600 transition-colors"
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

      {/* Photos */}
      <div className="flex items-center gap-3 pl-11 flex-wrap">
        {photos.map((url) => (
          <div key={url} className="relative group">
            <img
              src={url}
              alt=""
              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={() => handleRemovePhoto(url)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <label className={`w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${uploading ? 'border-gray-200 opacity-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'}`}>
            {uploading ? (
              <span className="text-xs text-gray-400">...</span>
            ) : (
              <>
                <span className="text-gray-400 text-xl leading-none">+</span>
                <span className="text-xs text-gray-400 mt-0.5">Снимка</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
          </label>
        )}

        <span className="text-xs text-gray-400">{photos.length}/{MAX_PHOTOS}</span>
      </div>
    </div>
  )
}

// ─── Main editor ───────────────────────────────────────────────────────────

export default function EventsEditor({
  classId,
  initialEvents,
}: {
  classId: string
  initialEvents: Event[]
}) {
  const [events, setEvents] = useState(initialEvents)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const canAdd = events.length < MAX_EVENTS

  function handleAdd(form: { title: string; event_date: string; note: string }) {
    setAddError(null)
    startTransition(async () => {
      const result = await createEvent(classId, {
        title: form.title,
        event_date: form.event_date || null,
        note: form.note || null,
        order_index: events.length + 1,
      })
      if (result.error) {
        setAddError(result.error)
      } else if (result.id) {
        setAdding(false)
        setEvents((prev) => [
          ...prev,
          {
            id: 'pending-' + Date.now(),
            title: form.title,
            event_date: form.event_date || null,
            note: form.note || null,
            photos: [],
            order_index: prev.length + 1,
          },
        ])
      }
    })
  }

  function handleQuickAdd(title: string) {
    if (!canAdd) return
    startTransition(async () => {
      const result = await createEvent(classId, {
        title,
        event_date: null,
        note: null,
        order_index: events.length + 1,
      })
      if (!result.error && result.id) {
        setEvents((prev) => [
          ...prev,
          {
            id: 'pending-' + Date.now(),
            title,
            event_date: null,
            note: null,
            photos: [],
            order_index: prev.length + 1,
          },
        ])
      }
    })
  }

  const addedTitles = new Set(events.map((e) => e.title))

  return (
    <div className="space-y-8">
      {/* Current events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {events.length} от {MAX_EVENTS} събития
          </p>
          {canAdd && !adding && (
            <button
              onClick={() => setAdding(true)}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Добави събитие
            </button>
          )}
        </div>

        {adding && (
          <div className="mb-4">
            {addError && <p className="text-red-500 text-xs mb-2 px-1">{addError}</p>}
            <EventForm
              initial={{ title: '', event_date: '', note: '' }}
              onSave={handleAdd}
              onCancel={() => { setAdding(false); setAddError(null) }}
              isPending={isPending}
            />
          </div>
        )}

        {events.length === 0 && !adding ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-gray-500 text-sm font-medium">Няма добавени събития</p>
            <p className="text-gray-400 text-xs mt-1">
              Изберете от примерите по-долу или натиснете „Добави събитие".
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, i) => (
              <EventRow key={event.id} event={event} classId={classId} index={i} />
            ))}
          </div>
        )}

        {!canAdd && (
          <p className="text-xs text-gray-400 text-center mt-3">
            Достигнат е максимумът от {MAX_EVENTS} събития.
          </p>
        )}
      </div>

      {/* Predefined */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Основни събития</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PREDEFINED.map((p) => {
            const added = addedTitles.has(p.title)
            return (
              <button
                key={p.title}
                onClick={() => handleQuickAdd(p.title)}
                disabled={added || !canAdd || isPending}
                className={`flex items-center gap-3 border rounded-xl px-4 py-3 text-left transition-colors text-sm ${
                  added
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-default'
                    : canAdd
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="text-xl">{p.emoji}</span>
                <span className="font-medium leading-snug">{p.title}</span>
                {added && <span className="ml-auto text-xs text-gray-400">✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Други идеи</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => {
            const added = addedTitles.has(s.title)
            return (
              <button
                key={s.title}
                onClick={() => handleQuickAdd(s.title)}
                disabled={added || !canAdd || isPending}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  added
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-default'
                    : canAdd
                    ? 'border-gray-300 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50'
                    : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>{s.emoji}</span>
                {s.title}
                {added && <span className="text-xs text-gray-400 ml-0.5">✓</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
