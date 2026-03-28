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
    setTimeout(() => router.push(`/moderator/${classId}/students`), 1200)
  }

  if (formState === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md shadow-sm">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Детето е добавено!</h2>
        <p className="text-sm text-gray-500 mb-6">
          {firstName} {lastName} е добавен/а в класа.
        </p>

        {inviteSent ? (
          <p className="inline-flex items-center gap-2 text-sm text-green-600 font-medium">
            <span className="material-symbols-outlined text-base">check_circle</span>
            Поканата е изпратена
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {parentEmail && (
              <button
                onClick={handleSendInvite}
                disabled={inviteLoading}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">send</span>
                {inviteLoading ? 'Изпращане...' : 'Изпрати покана сега'}
              </button>
            )}
            <button
              onClick={() => router.push(`/moderator/${classId}/students`)}
              className="text-sm text-gray-400 hover:text-gray-600 text-left"
            >
              {parentEmail ? 'По-късно' : 'Към учениците'}
            </button>
            {inviteError && <p className="text-xs text-red-500">{inviteError}</p>}
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md shadow-sm">
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Име на детето <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Напр. Иван"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Фамилия на детето <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Напр. Петров"
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
          <p className="text-xs text-gray-400 mt-1.5">
            Незадължително. Родителят ще получи линк с въпросник за попълване.
          </p>
        </div>

        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

        <button
          type="submit"
          disabled={formState === 'submitting'}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {formState === 'submitting' ? 'Запазване...' : 'Запази'}
        </button>
      </div>
    </form>
  )
}
