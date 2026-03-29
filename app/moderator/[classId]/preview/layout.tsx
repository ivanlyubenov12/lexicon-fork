export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import LexiconShell from '@/app/lexicon/[classId]/LexiconShell'

export default async function PreviewLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ classId: string }>
}) {
  noStore()
  const { classId } = await params
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()
  const { data: classData } = await admin
    .from('classes')
    .select('id, school_logo_url, template_id, theme_id, bg_pattern')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()

  if (!classData) redirect('/moderator')

  // Progress stats for banner
  const { data: students } = await admin
    .from('students')
    .select('id')
    .eq('class_id', classId)
  const studentIds = (students ?? []).map((s: { id: string }) => s.id)
  const { data: submittedAnswers } = studentIds.length > 0
    ? await admin
        .from('answers')
        .select('student_id')
        .in('student_id', studentIds)
        .in('status', ['submitted', 'approved'])
    : { data: [] as { student_id: string }[] }

  const totalStudents = studentIds.length
  const studentsWithAnswers = new Set((submittedAnswers ?? []).map(a => a.student_id)).size
  const pct = totalStudents > 0 ? Math.round((studentsWithAnswers / totalStudents) * 100) : 0

  const basePath = `/moderator/${classId}/preview`

  return (
    <>
      {/* Preview banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-indigo-900 text-white flex items-center justify-between px-5 py-2.5 text-sm shadow-lg">
        <Link
          href={`/moderator/${classId}`}
          className="flex items-center gap-1.5 text-indigo-200 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span className="hidden sm:inline">Назад към панела</span>
          <span className="sm:hidden">Назад</span>
        </Link>
        <span className="font-semibold tracking-wide text-xs uppercase text-indigo-300">
          <span className="hidden sm:inline">Превю — само ти виждаш това</span>
          <span className="sm:hidden">Преглед</span>
        </span>
        <div className="hidden sm:flex items-center gap-2 text-indigo-200">
          <div className="w-24 h-1.5 rounded-full bg-indigo-700 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs tabular-nums">{studentsWithAnswers}/{totalStudents} деца</span>
        </div>
        <div className="sm:hidden w-10" />
      </div>

      {/* Content pushed below banner */}
      <div className="pt-10">
        <LexiconShell classId={classId} logoUrl={classData.school_logo_url} themeId={classData.theme_id ?? classData.template_id} bgPattern={classData.bg_pattern} basePath={basePath}>
          {children}
        </LexiconShell>
      </div>
    </>
  )
}
