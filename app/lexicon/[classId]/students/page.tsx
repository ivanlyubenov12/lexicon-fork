export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function LexiconStudentsPage({ params }: { params: { classId: string } }) {
  noStore()
  const { classId } = params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, status')
    .eq('id', classId)
    .single()

  if (!classData || classData.status !== 'published') notFound()

  const { data: students } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url')
    .eq('class_id', classId)
    .order('last_name')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-3">
          <Link href={`/lexicon/${classId}`} className="text-gray-400 hover:text-gray-600 text-sm">
            ← {classData.name}
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Деца в класа</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(students ?? []).map((student) => (
            <Link
              key={student.id}
              href={`/lexicon/${classId}/student/${student.id}`}
              className="group bg-white rounded-2xl border border-gray-200 p-4 flex flex-col items-center text-center hover:shadow-md hover:border-indigo-200 transition-all"
            >
              {student.photo_url ? (
                <img
                  src={student.photo_url}
                  alt={student.first_name}
                  className="w-20 h-20 rounded-full object-cover mb-3"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                  <span className="text-indigo-400 text-2xl font-bold">
                    {student.first_name[0]}
                  </span>
                </div>
              )}
              <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
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
