export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LexiconShell from '../LexiconShell'

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
    <LexiconShell classId={classId} logoUrl={classData.school_logo_url}>
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl text-[#3632b7]" style={{ fontFamily: 'Noto Serif, serif' }}>
            Всички ученици
          </h3>
          <span className="text-[#855300] font-semibold text-sm tracking-widest uppercase">
            {studentList.length} ученика
          </span>
        </div>
        {studentList.length === 0 ? (
          <div className="py-32 text-center">
            <span className="material-symbols-outlined text-5xl text-[#e9e8e7] block mb-4">group</span>
            <p className="text-stone-400 font-medium">Все още няма ученици в класа.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {studentList.map(student => {
              const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase()
              return (
                <Link key={student.id} href={`/lexicon/${classId}/student/${student.id}`} className="group">
                  <div className="bg-white p-5 rounded-[2.5rem] text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-4 border-4 border-[#f4f3f2] ring-2 ring-[#3632b7]/10">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.first_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#e2dfff] flex items-center justify-center">
                          <span className="text-[#3632b7] font-bold text-xl" style={{ fontFamily: 'Noto Serif, serif' }}>
                            {initials}
                          </span>
                        </div>
                      )}
                    </div>
                    <h4 className="text-base font-semibold text-[#3632b7] leading-tight" style={{ fontFamily: 'Noto Serif, serif' }}>
                      {student.first_name}
                    </h4>
                    <p className="text-xs text-stone-400 mt-0.5">{student.last_name}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </LexiconShell>
  )
}
