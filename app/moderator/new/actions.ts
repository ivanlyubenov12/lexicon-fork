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
  const preset = (formData.get('preset') as string) || 'primary'

  if (!parallel || !school) {
    return { error: 'Задължителните полета са попълнени непълно.', classId: null }
  }

  const name = school ? `${parallel} — ${school}` : parallel
  const admin = createServiceRoleClient()

  // Save moderator name to user metadata
  if (moderatorName) {
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { full_name: moderatorName },
    })
  }

  // Fetch template defaults for this preset
  const { data: tpl } = await admin
    .from('template_defaults')
    .select('theme_id, bg_pattern, member_label, group_label, memories_label')
    .eq('preset_id', preset)
    .single()

  // Create class
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
      template_id: preset,
      theme_id: tpl?.theme_id ?? null,
      bg_pattern: tpl?.bg_pattern ?? 'school',
      member_label: tpl?.member_label ?? null,
      group_label: tpl?.group_label ?? null,
      memories_label: tpl?.memories_label ?? null,
      layout: [],
      expected_student_count: expectedStudentCount,
      deadline: deadline || null,
    })
    .select('id')
    .single()

  if (classErr || !inserted) {
    return { error: 'Неуспешно създаване. Опитайте отново.', classId: null }
  }

  // Auto-seed questions and layout for chosen preset
  const { blocks } = await seedDefaultClass(inserted.id, admin, preset as any)
  if (blocks.length > 0) {
    await admin.from('classes').update({ layout: blocks }).eq('id', inserted.id)
  }

  return { error: null, classId: inserted.id }
}
