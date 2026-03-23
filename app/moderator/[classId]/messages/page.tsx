// Route: /moderator/[classId]/messages — M6: Peer message approval queue
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/server'
import MessagesTable from './MessagesTable'

interface MessageRow {
  id: string
  content: string
  status: string
  created_at: string
  recipient_student_id: string
  author_student_id: string
  recipient: { first_name: string; last_name: string }
  author: { first_name: string; last_name: string }
}

export default async function MessagesPage({ params }: { params: { classId: string } }) {
  const { classId } = params
  const supabase = createServiceRoleClient()

  // Fetch student IDs for this class
  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', classId)

  const studentIds = (students ?? []).map((s) => s.id)

  let messages: MessageRow[] = []

  if (studentIds.length > 0) {
    const { data } = await supabase
      .from('peer_messages')
      .select(
        'id, content, status, created_at, recipient_student_id, author_student_id, recipient:students!recipient_student_id(first_name, last_name), author:students!author_student_id(first_name, last_name)'
      )
      .in('recipient_student_id', studentIds)
      .order('created_at', { ascending: false })

    messages = (data ?? []) as unknown as MessageRow[]
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href={`/moderator/${classId}`}
        className="text-sm text-gray-500 hover:text-gray-700 inline-block mb-6"
      >
        ← Към dashboard
      </Link>

      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Послания между деца</h1>

      {/* Table with filter tabs */}
      <MessagesTable messages={messages} classId={classId} />
    </div>
  )
}
