export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ClassHomePage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, status, superhero_image_url, school_logo_url')
    .eq('id', classId)
    .single()

  if (!classData || classData.status !== 'published') notFound()

  const { data: students } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url')
    .eq('class_id', classId)
    .order('last_name')

  const base = `/class/${classId}`

  const sections = [
    { href: '#students', label: 'Децата в класа', icon: '👦', count: students?.length ?? 0 },
    { href: `${base}/voice`, label: 'Гласът на класа', icon: '💬', count: null },
    { href: `${base}/together`, label: 'По-добри заедно', icon: '🌱', count: null },
    { href: `${base}/superhero`, label: 'Супергероят', icon: '🦸', count: null },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-20">
      {/* Sticky PDF download button */}
      <div className="fixed bottom-4 right-4 z-50">
        <a
          href={`/api/pdf/${classId}`}
          download
          className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
        >
          ↓ Свали PDF
        </a>
      </div>
      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-8 text-center">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">Един неразделен клас</p>
        <div className="flex items-center justify-center gap-4 mb-2">
          {classData.school_logo_url && (
            <img
              src={classData.school_logo_url}
              alt="Лого"
              className="w-14 h-14 object-contain rounded-lg bg-white shadow-sm p-1 border border-gray-100"
            />
          )}
          <div className="text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{classData.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Учебна година {classData.school_year}</p>
          </div>
        </div>
      </div>

      {/* Section cards */}
      <div className="max-w-2xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-2 gap-4">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-indigo-200 transition-all text-center"
            >
              <div className="text-4xl mb-3">{s.icon}</div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                {s.label}
              </p>
              {s.count !== null && (
                <p className="text-xs text-gray-400 mt-1">{s.count} деца</p>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Student grid */}
      <div id="students" className="max-w-2xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Децата в класа</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {(students ?? []).map((student) => (
            <Link
              key={student.id}
              href={`${base}/student/${student.id}`}
              className="group flex flex-col items-center text-center"
            >
              {student.photo_url ? (
                <img
                  src={student.photo_url}
                  alt={student.first_name}
                  className="w-16 h-16 rounded-full object-cover shadow group-hover:ring-2 group-hover:ring-indigo-400 transition-all"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center shadow group-hover:ring-2 group-hover:ring-indigo-400 transition-all">
                  <span className="text-indigo-400 text-xl font-bold">{student.first_name[0]}</span>
                </div>
              )}
              <p className="text-xs font-medium text-gray-700 mt-2 group-hover:text-indigo-600 transition-colors">
                {student.first_name}
              </p>
              <p className="text-xs text-gray-400">{student.last_name}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
