'use server'

import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { seedDefaultClass } from '@/lib/templates/defaultSeed'

interface State {
  error: string | null
  classId: string | null
}

export async function createClass(prevState: State, formData: FormData): Promise<State> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не сте влезли в системата.', classId: null }

  const parallel     = (formData.get('parallel') as string)?.trim()
  const school       = (formData.get('school') as string)?.trim()
  const city         = (formData.get('city') as string)?.trim() ?? ''
  const teacherName  = (formData.get('teacher_name') as string)?.trim() ?? ''
  const schoolYear   = (formData.get('school_year') as string)?.trim() ?? ''
  const coverImageUrl = (formData.get('cover_image_url') as string) || null
  const schoolLogoUrl = (formData.get('school_logo_url') as string) || null

  if (!parallel || !school) {
    return { error: 'Паралелката и училището са задължителни.', classId: null }
  }

  const name = `${parallel} — ${school}`
  const admin = createServiceRoleClient()

  // Create class with empty layout first
  const { data: inserted, error: classErr } = await admin
    .from('classes')
    .insert({
      moderator_id: user.id,
      name,
      school_year: schoolYear,
      city: city || null,
      teacher_name: teacherName || null,
      cover_image_url: coverImageUrl,
      school_logo_url: schoolLogoUrl,
      status: 'draft',
      template_id: 'classic',
      layout: [],
    })
    .select('id')
    .single()

  if (classErr || !inserted) {
    return { error: 'Неуспешно създаване на класа. Опитайте отново.', classId: null }
  }

  // Seed default questions, polls, events and get wired-up layout
  const { blocks, error: seedErr } = await seedDefaultClass(inserted.id, admin)
  if (seedErr) {
    // Class was created — still redirect, moderator can set up manually
    return { error: null, classId: inserted.id }
  }

  // Update layout with real question/poll IDs
  await admin
    .from('classes')
    .update({ layout: blocks })
    .eq('id', inserted.id)

  return { error: null, classId: inserted.id }
}
