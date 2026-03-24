export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/server'
import ModeratorSidebar from '../ModeratorSidebar'
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

export default async function MessagesPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params
  const supabase = createServiceRoleClient()

  const { data: classData } = await supabase
    .from('classes')
    .select('id, name, school_year, school_logo_url')
    .eq('id', classId)
    .single()

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

  const [namePart] = classData?.name?.includes(' — ')
    ? classData.name.split(' — ')
    : [classData?.name ?? '']

  const pendingCount = messages.filter((m) => m.status === 'pending').length
  const approvedCount = messages.filter((m) => m.status === 'approved').length

  return (
    <div className="flex min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <ModeratorSidebar
        classId={classId}
        namePart={namePart}
        schoolYear={classData?.school_year ?? null}
        logoUrl={classData?.school_logo_url ?? null}
        active="messages"
      />

      <main className="ml-64 flex-1 p-8 lg:p-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">
            Преглед на съдържанието
          </p>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1
                className="text-4xl font-bold text-gray-900 leading-tight"
                style={{ fontFamily: 'Noto Serif, serif' }}
              >
                Послания между деца
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Прегледайте и одобрете посланията, написани от учениците един към друг.
              </p>
            </div>
            {pendingCount > 0 && (
              <div className="flex-shrink-0 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                <span className="material-symbols-outlined text-amber-500 text-base">pending</span>
                <span className="text-sm font-semibold text-amber-700">{pendingCount} чакащи</span>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="flex gap-4 mt-6">
            <div className="bg-white border border-gray-100 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-slate-400 text-xl">forum</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Общо</p>
                <p className="text-lg font-bold text-gray-800">{messages.length}</p>
              </div>
            </div>
            <div className="bg-white border border-amber-100 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-amber-400 text-xl">schedule</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Чакащи</p>
                <p className="text-lg font-bold text-amber-600">{pendingCount}</p>
              </div>
            </div>
            <div className="bg-white border border-green-100 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Одобрени</p>
                <p className="text-lg font-bold text-green-600">{approvedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <MessagesTable messages={messages} classId={classId} />
      </main>
    </div>
  )
}
