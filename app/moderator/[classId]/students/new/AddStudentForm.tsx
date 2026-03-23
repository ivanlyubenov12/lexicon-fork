'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addSingleStudent, resendInvite } from '../../actions'

interface AddStudentFormProps {
  classId: string
}

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export default function AddStudentForm({ classId }: AddStudentFormProps) {
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [parentEmail, setParentEmail] = useState('')

  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [createdStudentId, setCreatedStudentId] = useState<string | null>(null)

  const [inviteSent, setInviteSent] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormState('submitting')
    setErrorMsg(null)

    const result = await addSingleStudent(classId, {
      first_name: firstName,
      last_name: lastName,
      parent_email: parentEmail,
    })

    if (result.error) {
      setErrorMsg(result.error)
      setFormState('error')
      return
    }

    setCreatedStudentId(result.studentId)
    setFormState('success')
  }

  async function handleSendInvite() {
    if (!createdStudentId) return
    setInviteLoading(true)
    setInviteError(null)

    const result = await resendInvite(createdStudentId)
    setInviteLoading(false)

    if (result.error) {
      setInviteError(result.error)
      return
    }

    setInviteSent(true)
    setTimeout(() => {
      router.push(`/moderator/${classId}/students`)
    }, 1200)
  }

  function handleLater() {
    router.push(`/moderator/${classId}/students`)
  }

  if (formState === 'success') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Детето е добавено успешно!
          </h2>
          <p className="text-sm text-gray-500">
            {firstName} {lastName} е добавен/а в класа.
          </p>
        </div>

        {inviteSent ? (
          <p className="text-sm text-green-600 font-medium">Поканата е изпратена ✓</p>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSendInvite}
              disabled={inviteLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {inviteLoading ? 'Изпращане...' : 'Изпрати покана сега'}
            </button>
            <button
              onClick={handleLater}
              className="text-sm text-gray-500 hover:text-gray-700 text-left"
            >
              По-късно
            </button>
            {inviteError && (
              <p className="text-xs text-red-500">{inviteError}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 max-w-md">
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ime <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Напр. Иван"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Фамилия <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Напр. Петров"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Имейл на родителя <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="roditel@example.com"
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-red-500">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={formState === 'submitting'}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {formState === 'submitting' ? 'Запазване...' : 'Запази'}
        </button>
      </div>
    </form>
  )
}
