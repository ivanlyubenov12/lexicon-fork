export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import LexiconShell from '@/app/lexicon/[classId]/LexiconShell'
import StudentCard from '@/app/lexicon/[classId]/students/StudentCard'

export default async function AdminPreviewStudentsPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/login')

  const admin = createServiceRoleClient()
  const { data: classData } = await admin.from('classes').select('id, name, school_logo_url, template_id, theme_id, bg_pattern').eq('id', classId).single()
  if (!classData) redirect('/admin/classes')

  const { data: students } = await admin.from('students').select('id, first_name, last_name, photo_url').eq('class_id', classId).order('last_name')
  const studentList = students ?? []
  const basePath = `/admin/classes/${classId}/preview`

  return (
    <LexiconShell classId={classId} logoUrl={classData.school_logo_url} themeId={classData.theme_id ?? classData.template_id} bgPattern={classData.bg_pattern} basePath={basePath}>
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl text-[#3632b7]" style={{ fontFamily: 'Noto Serif, serif' }}>Всички ученици</h3>
          <span className="text-[#855300] font-semibold text-sm tracking-widest uppercase">{studentList.length} ученици</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {studentList.map(student => (
            <StudentCard key={student.id} student={student} classId={classId} basePath={basePath} />
          ))}
        </div>
      </section>
    </LexiconShell>
  )
}
