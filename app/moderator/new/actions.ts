'use server'

import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

interface State {
  error: string | null
  classId: string | null
}

export async function createClass(prevState: State, formData: FormData): Promise<State> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не сте влезли в системата.', classId: null }

  const parallel      = (formData.get('parallel') as string)?.trim()
  const school        = (formData.get('school') as string)?.trim()
  const city          = (formData.get('city') as string)?.trim() ?? ''
  const moderatorName = (formData.get('moderator_name') as string)?.trim() ?? ''
  const teacherName   = (formData.get('teacher_name') as string)?.trim() ?? ''
  const schoolYear    = (formData.get('school_year') as string)?.trim() ?? ''
  const coverImageUrl = (formData.get('cover_image_url') as string) || null
  const schoolLogoUrl = (formData.get('school_logo_url') as string) || null
  const expectedStudentCount = parseInt(formData.get('expected_student_count') as string) || null
  const deadline = (formData.get('deadline') as string) || null

  if (!parallel || !school) {
    return { error: 'Паралелката и училището са задължителни.', classId: null }
  }

  const name = `${parallel} — ${school}`
  const admin = createServiceRoleClient()

  // Save moderator name to user metadata so all future invites use it
  if (moderatorName) {
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { full_name: moderatorName },
    })
  }

  // Create class — layout seeded separately via the template picker
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
      template_id: 'primary',
      layout: [],
      expected_student_count: expectedStudentCount,
      deadline: deadline || null,
    })
    .select('id')
    .single()

  if (classErr || !inserted) {
    return { error: 'Неуспешно създаване на класа. Опитайте отново.', classId: null }
  }

  return { error: null, classId: inserted.id }
}
