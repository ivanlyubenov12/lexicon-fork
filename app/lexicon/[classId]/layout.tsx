import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import LexiconShell from './LexiconShell'

export default async function LexiconLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params
  const admin = createServiceRoleClient()

  const { data: cls } = await admin
    .from('classes')
    .select('id, status, school_logo_url, template_id, theme_id, bg_pattern')
    .eq('id', classId)
    .single()

  if (!cls || cls.status !== 'published') notFound()

  return (
    <LexiconShell
      classId={classId}
      logoUrl={cls.school_logo_url}
      themeId={cls.theme_id ?? cls.template_id}
      preset={cls.template_id}
      bgPattern={cls.bg_pattern}
    >
      {children}
    </LexiconShell>
  )
}
