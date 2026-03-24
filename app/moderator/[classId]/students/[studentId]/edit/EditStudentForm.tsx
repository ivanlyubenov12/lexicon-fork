'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateStudent } from '../../../actions'

interface Props {
  classId: string
  student: {
    id: string
    first_name: string
    last_name: string
    parent_email: string | null
  }
}

export default function EditStudentForm({ classId, student }: Props) {
  const router = useRouter()
  const [firstName, setFirstName] = useState(student.first_name)
  const [lastName, setLastName] = useState(student.last_name)
  const [parentEmail, setParentEmail] = useState(student.parent_email ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const result = await updateStudent(classId, student.id, {
      first_name: firstName,
      last_name: lastName,
      parent_email: parentEmail,
    })

    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    router.push(`/moderator/${classId}/students`)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md shadow-sm">
      <div className="flex flex-col gap-5">

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Име <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Фамилия <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Имейл на родителя
          </label>
          <input
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="roditel@example.com"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {submitting ? 'Запазване...' : 'Запази промените'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/moderator/${classId}/students`)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Отказ
          </button>
        </div>

      </div>
    </form>
  )
}
