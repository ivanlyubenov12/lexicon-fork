import Link from 'next/link'

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
  studentId: string
  classmates: Classmate[]
  sentMessages: SentMessage[]
}

export default function MessagesSection({ studentId, classmates, sentMessages }: Props) {
  const messageMap = new Map(sentMessages.map(m => [m.recipient_student_id, m]))

  if (classmates.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-400">
        Няма други участници.
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {classmates.map((classmate, i) => {
        const msg = messageMap.get(classmate.id)
        const status = msg?.status

        const dotColor =
          status === 'approved' ? 'bg-green-500' :
          status === 'pending' ? 'bg-yellow-400' :
          'bg-gray-200 group-hover:bg-indigo-300'

        const statusLabel =
          status === 'approved' ? <span className="text-xs text-green-600 font-medium flex-shrink-0">✓</span> :
          status === 'pending' ? <span className="text-xs text-yellow-600 font-medium flex-shrink-0">За преглед</span> :
          <span className="material-symbols-outlined text-gray-300 group-hover:text-indigo-400 text-base">arrow_forward</span>

        return (
          <Link
            key={classmate.id}
            href={`/my/${studentId}/message/${classmate.id}`}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-indigo-50 transition-colors group"
          >
            <span className="text-xs font-bold text-gray-300 w-5 text-center flex-shrink-0">{i + 1}</span>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
            <span className="material-symbols-outlined text-sm text-gray-300 group-hover:text-indigo-400 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <span className="flex-1 text-sm text-gray-700 group-hover:text-indigo-800 leading-snug truncate">
              {classmate.first_name}{classmate.last_name ? ` ${classmate.last_name}` : ''}
            </span>
            {statusLabel}
          </Link>
        )
      })}
    </div>
  )
}
