'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createEvent, updateEvent, deleteEvent, reorderEvents } from './actions'
import DateInput from '@/components/DateInput'

const MAX_PHOTOS = 5
const MAX_EVENTS = 10

interface Event {
  id: string
  title: string
  event_date: string | null
  note: string | null
  photos: string[]
  order_index: number
}

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
  return new Date(dateStr).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function compressImage(file: File, maxDim = 1600, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round(height * maxDim / width); width = maxDim }
        else { width = Math.round(width * maxDim / height); height = maxDim }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('toBlob failed')), 'image/jpeg', quality)
    }
    img.onerror = reject
    img.src = url
  })
}

// ─── Sortable photo thumbnail ──────────────────────────────────────────────

function SortablePhoto({ url, onRemove }: { url: string; onRemove: (url: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: url })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group cursor-grab active:cursor-grabbing flex-shrink-0"
      {...attributes}
      {...listeners}
    >
      <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200 select-none" />
      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={() => onRemove(url)}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
      >
        ×
      </button>
    </div>
  )
}

// ─── Event form ────────────────────────────────────────────────────────────

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
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
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
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
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
        <button onClick={onCancel} disabled={isPending} className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2">
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
  onUpdate,
  onDelete,
  dragHandleProps,
}: {
  event: Event
  classId: string
  index: number
  onUpdate: (updated: Event) => void
  onDelete: (id: string) => void
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
}) {
  const [editing, setEditing] = useState(false)
  const [photos, setPhotos] = useState<string[]>(event.photos ?? [])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const photoSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleSave(form: { title: string; event_date: string; note: string }) {
    startTransition(async () => {
      const result = await updateEvent(classId, event.id, {
        title: form.title,
        event_date: form.event_date || null,
        note: form.note || null,
      })
      if (!result.error) {
        setEditing(false)
        onUpdate({ ...event, title: form.title, event_date: form.event_date || null, note: form.note || null })
      }
    })
  }

  function handleDelete() {
    if (!confirm(`Изтриване на „${event.title}"?`)) return
    startTransition(async () => {
      await deleteEvent(classId, event.id)
      onDelete(event.id)
    })
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''
    const toUpload = files.slice(0, MAX_PHOTOS - photos.length)
    setUploading(true)
    setUploadError(null)
    try {
      const results = await Promise.all(
        toUpload.map(async (file) => {
          let blob: Blob = file
          try { blob = await compressImage(file) } catch { /* use original */ }
          const fd = new FormData()
          fd.append('file', blob, 'photo.jpg')
          const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
          const data = await res.json()
          return data.url as string | undefined
        })
      )
      const uploaded = results.filter(Boolean) as string[]
      if (uploaded.length > 0) {
        const newPhotos = [...photos, ...uploaded]
        const result = await updateEvent(classId, event.id, {
          title: event.title,
          event_date: event.event_date,
          note: event.note,
          photos: newPhotos,
        })
        if (result.error) {
          setUploadError('Снимките се качиха, но не се запазиха. Опитайте отново.')
        } else {
          setPhotos(newPhotos)
          onUpdate({ ...event, photos: newPhotos })
        }
      }
    } catch {
      setUploadError('Качването не успя. Опитайте отново.')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemovePhoto(url: string) {
    const newPhotos = photos.filter(p => p !== url)
    setPhotos(newPhotos)
    await updateEvent(classId, event.id, {
      title: event.title,
      event_date: event.event_date,
      note: event.note,
      photos: newPhotos,
    })
    onUpdate({ ...event, photos: newPhotos })
  }

  function handlePhotosDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = photos.indexOf(active.id as string)
    const newIdx = photos.indexOf(over.id as string)
    const reordered = arrayMove(photos, oldIdx, newIdx)
    setPhotos(reordered)
    updateEvent(classId, event.id, {
      title: event.title,
      event_date: event.event_date,
      note: event.note,
      photos: reordered,
    }).then(() => onUpdate({ ...event, photos: reordered }))
  }

  if (editing) {
    return (
      <EventForm
        initial={{ title: event.title, event_date: event.event_date ?? '', note: event.note ?? '' }}
        onSave={handleSave}
        onCancel={() => setEditing(false)}
        isPending={isPending}
      />
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 space-y-3">
      <div className="flex items-center gap-3">
        {/* Drag handle */}
        <button
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 flex-shrink-0 touch-none"
          tabIndex={-1}
          aria-label="Преместване"
        >
          <span className="material-symbols-outlined text-lg">drag_indicator</span>
        </button>

        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{event.title}</p>
          <div className="flex items-center gap-3 mt-0.5">
            {event.event_date && <span className="text-xs text-gray-400">{formatDate(event.event_date)}</span>}
            {event.note && <span className="text-xs text-gray-400 italic">{event.note}</span>}
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-indigo-600 transition-colors">
            Редактирай
          </button>
          <button onClick={handleDelete} disabled={isPending} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
            Изтрий
          </button>
        </div>
      </div>

      {/* Photos with DnD */}
      <div className="pl-14 flex items-center gap-3 flex-wrap">
        <DndContext sensors={photoSensors} collisionDetection={closestCenter} onDragEnd={handlePhotosDragEnd}>
          <SortableContext items={photos} strategy={horizontalListSortingStrategy}>
            {photos.map(url => (
              <SortablePhoto key={url} url={url} onRemove={handleRemovePhoto} />
            ))}
          </SortableContext>
        </DndContext>

        {photos.length < MAX_PHOTOS && (
          <label className={`w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${
            uploading ? 'border-gray-200 opacity-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
          }`}>
            {uploading ? (
              <span className="text-xs text-gray-400">...</span>
            ) : (
              <>
                <span className="text-gray-400 text-xl leading-none">+</span>
                <span className="text-xs text-gray-400 mt-0.5">Снимка</span>
              </>
            )}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
          </label>
        )}

        <span className="text-xs text-gray-400">{photos.length}/{MAX_PHOTOS}</span>
      </div>

      {uploadError && <p className="text-xs text-red-500 pl-14">{uploadError}</p>}
    </div>
  )
}

// ─── Sortable event row wrapper ────────────────────────────────────────────

function SortableEventRow(props: {
  event: Event
  classId: string
  index: number
  onUpdate: (updated: Event) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.event.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} style={style}>
      <EventRow {...props} dragHandleProps={{ ...attributes, ...listeners }} />
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

  const eventSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleEventsDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = events.findIndex(ev => ev.id === active.id)
    const newIdx = events.findIndex(ev => ev.id === over.id)
    const reordered = arrayMove(events, oldIdx, newIdx)
    setEvents(reordered)
    reorderEvents(classId, reordered.map((ev, i) => ({ id: ev.id, order_index: i + 1 })))
  }

  function handleUpdateEvent(updated: Event) {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
  }

  function handleDeleteEvent(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id))
  }

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
        setEvents(prev => [...prev, {
          id: result.id!,
          title: form.title,
          event_date: form.event_date || null,
          note: form.note || null,
          photos: [],
          order_index: prev.length + 1,
        }])
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
        setEvents(prev => [...prev, {
          id: result.id!,
          title,
          event_date: null,
          note: null,
          photos: [],
          order_index: prev.length + 1,
        }])
      }
    })
  }

  const addedTitles = new Set(events.map(e => e.title))

  return (
    <div className="space-y-8">
      {/* Current events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{events.length} от {MAX_EVENTS} събития</p>
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
            <p className="text-gray-400 text-xs mt-1">Изберете от примерите по-долу или натиснете „Добави събитие".</p>
          </div>
        ) : (
          <DndContext sensors={eventSensors} collisionDetection={closestCenter} onDragEnd={handleEventsDragEnd}>
            <SortableContext items={events.map(e => e.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {events.map((event, i) => (
                  <SortableEventRow
                    key={event.id}
                    event={event}
                    classId={classId}
                    index={i}
                    onUpdate={handleUpdateEvent}
                    onDelete={handleDeleteEvent}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
          {PREDEFINED.map(p => {
            const added = addedTitles.has(p.title)
            return (
              <button
                key={p.title}
                onClick={() => handleQuickAdd(p.title)}
                disabled={added || !canAdd || isPending}
                className={`flex items-center gap-3 border rounded-xl px-4 py-3 text-left transition-colors text-sm ${
                  added ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-default'
                  : canAdd ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
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
          {SUGGESTIONS.map(s => {
            const added = addedTitles.has(s.title)
            return (
              <button
                key={s.title}
                onClick={() => handleQuickAdd(s.title)}
                disabled={added || !canAdd || isPending}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  added ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-default'
                  : canAdd ? 'border-gray-300 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50'
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
