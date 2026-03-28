export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'
import ModeratorSidebar from '../ModeratorSidebar'
import PollsEditor from './PollsEditor'

export default async function PollsPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, school_logo_url')
    .eq('id', classId)
    .single()

  const { data: polls } = await admin
    .from('class_polls')
    .select('id, question, order_index')
    .eq('class_id', classId)
    .order('order_index')

  // Vote counts per poll per nominee
  const { data: votes } = await admin
    .from('class_poll_votes')
    .select('poll_id, nominee_student_id, students!class_poll_votes_nominee_student_id_fkey(first_name, last_name)')
    .in('poll_id', (polls ?? []).map((p) => p.id))

  // Aggregate vote counts per poll
  const voteMap: Record<string, Record<string, { name: string; count: number }>> = {}
  for (const vote of votes ?? []) {
    if (!voteMap[vote.poll_id]) voteMap[vote.poll_id] = {}
    const student = (vote as any).students
    const name = student ? `${student.first_name} ${student.last_name}` : 'Неизвестен'
    if (!voteMap[vote.poll_id][vote.nominee_student_id]) {
      voteMap[vote.poll_id][vote.nominee_student_id] = { name, count: 0 }
    }
    voteMap[vote.poll_id][vote.nominee_student_id].count++
  }

  const pollsWithCounts = (polls ?? []).map((poll) => {
    const counts = Object.values(voteMap[poll.id] ?? {})
      .sort((a, b) => b.count - a.count)
      .map((v) => ({ nominee_name: v.name, votes: v.count }))
    return { ...poll, vote_counts: counts }
  })

  const { count: studentCount } = await admin
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('class_id', classId)

  const [namePart] = classData?.name?.includes(' — ')
    ? classData.name.split(' — ')
    : [classData?.name ?? '']

  return (
    <div className="flex min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <ModeratorSidebar
        classId={classId}
        namePart={namePart}
        schoolYear={classData?.school_year ?? null}
        logoUrl={classData?.school_logo_url ?? null}
        active="polls"
      />
      <main className="md:ml-64 flex-1 p-4 pt-20 md:p-8 lg:p-12">
        <PollsEditor
          classId={classId}
          initialPolls={pollsWithCounts}
          studentCount={studentCount ?? 0}
        />
      </main>
    </div>
  )
}
