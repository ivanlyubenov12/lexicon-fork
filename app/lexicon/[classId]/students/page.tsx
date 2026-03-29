export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import StudentCard from './StudentCard'

export default async function LexiconStudentsPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, status, school_logo_url')
    .eq('id', classId)
    .single()

  if (!classData || classData.status !== 'published') notFound()

  const { data: students } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url')
    .eq('class_id', classId)
    .order('last_name')

  const studentList = students ?? []

  return (
    <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl text-[#3632b7]" style={{ fontFamily: 'Noto Serif, serif' }}>
            Всички ученици
          </h3>
          <span className="text-[#855300] font-semibold text-sm tracking-widest uppercase">
            {studentList.length} ученици
          </span>
        </div>
        {studentList.length === 0 ? (
          <div className="py-32 text-center">
            <span className="material-symbols-outlined text-5xl text-[#e9e8e7] block mb-4">group</span>
            <p className="text-stone-400 font-medium">Все още няма ученици в класа.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {studentList.map(student => (
              <StudentCard key={student.id} student={student} classId={classId} basePath={`/lexicon/${classId}`} />
            ))}
          </div>
        )}
      </section>
  )
}
