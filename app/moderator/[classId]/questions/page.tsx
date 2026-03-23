import { notFound } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/server'
import QuestionsEditor from './QuestionsEditor'

export default async function QuestionsPage({ params }: { params: { classId: string } }) {
  noStore()
  const { classId } = params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name')
    .eq('id', classId)
    .single()

  if (!classData) notFound()

  // System questions (reference)
  const { data: systemQuestions } = await admin
    .from('questions')
    .select('id, text, type, allows_text, allows_media, max_length, order_index')
    .is('class_id', null)
    .eq('is_system', true)
    .order('order_index')

  // Class-specific custom questions
  const { data: customQuestions } = await admin
    .from('questions')
    .select('id, text, type, allows_text, allows_media, max_length, order_index')
    .eq('class_id', classId)
    .eq('is_system', false)
    .order('order_index')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-3">
          <Link href={`/moderator/${classId}`} className="text-sm text-gray-400 hover:text-gray-600">
            ← {classData.name}
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Въпросник</h1>
          <p className="text-sm text-gray-500 mt-1">
            Управлявайте въпросите, на които децата ще отговарят.
          </p>
        </div>

        <QuestionsEditor
          classId={classId}
          systemQuestions={systemQuestions ?? []}
          customQuestions={customQuestions ?? []}
        />
      </div>
    </main>
  )
}
