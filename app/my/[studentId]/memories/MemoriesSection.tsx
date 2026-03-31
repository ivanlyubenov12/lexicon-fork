import Link from 'next/link'

interface Event {
  id: string
  title: string
  event_date: string | null
  photos: string[]
  myComment: { id: string; comment_text: string; created_at: string } | null
}

interface Props {
  studentId: string
  events: Event[]
}

export default function MemoriesSection({ studentId, events }: Props) {
  if (events.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-400">
        Няма добавени събития.
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {events.map((event, i) => {
        const hasComment = !!event.myComment
        const dotColor = hasComment ? 'bg-green-500' : 'bg-gray-200 group-hover:bg-indigo-300'

        return (
          <Link
            key={event.id}
            href={`/my/${studentId}/event/${event.id}`}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-indigo-50 transition-colors group"
          >
            <span className="text-xs font-bold text-gray-300 w-5 text-center flex-shrink-0">{i + 1}</span>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
            <span className="material-symbols-outlined text-sm text-gray-300 group-hover:text-indigo-400 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>photo_album</span>
            <span className="flex-1 text-sm text-gray-700 group-hover:text-indigo-800 leading-snug truncate">
              {event.title}
            </span>
            {hasComment ? (
              <span className="text-xs text-green-600 font-medium flex-shrink-0">✓</span>
            ) : (
              <span className="material-symbols-outlined text-gray-300 group-hover:text-indigo-400 text-base">arrow_forward</span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
