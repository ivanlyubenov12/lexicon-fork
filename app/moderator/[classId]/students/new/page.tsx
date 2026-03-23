// Route: /moderator/[classId]/students/new — M4: Add student
import Link from 'next/link'
import AddStudentForm from './AddStudentForm'

export default function NewStudentPage({ params }: { params: { classId: string } }) {
  const { classId } = params

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href={`/moderator/${classId}/students`}
        className="text-sm text-gray-500 hover:text-gray-700 inline-block mb-6"
      >
        ← Към списъка с деца
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Добави дете</h1>

      <AddStudentForm classId={classId} />
    </div>
  )
}
