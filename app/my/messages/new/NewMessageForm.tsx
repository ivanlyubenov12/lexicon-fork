'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitMessage } from '../../[studentId]/actions'

interface Props {
  authorStudentId: string
  recipient: {
    id: string
    first_name: string
    last_name: string
    photo_url: string | null
  }
  existingMessage: { content: string; status: string } | null
  backHref: string
}

export default function NewMessageForm({ authorStudentId, recipient, existingMessage, backHref }: Props) {
  const router = useRouter()
  const [text, setText] = useState(existingMessage?.status === 'pending' ? existingMessage.content : '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const isApproved = existingMessage?.status === 'approved'
  const isPending = existingMessage?.status === 'pending'

  const initials = `${recipient.first_name?.[0] ?? ''}${recipient.last_name?.[0] ?? ''}`.toUpperCase()

  async function handleSubmit() {
    if (!text.trim()) return
    setError(null)
    setSubmitting(true)
    const result = await submitMessage(authorStudentId, recipient.id, text)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="text-center py-16 px-6">
        <span className="material-symbols-outlined text-5xl text-green-500 block mb-4">check_circle</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Noto Serif, serif' }}>
          Посланието е изпратено
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          Ще се покаже на {recipient.first_name} след одобрение от модератора.
        </p>
        <button
          onClick={() => router.push(backHref)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Назад
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Назад
      </button>

      {/* Recipient card */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
        {recipient.photo_url ? (
          <img
            src={recipient.photo_url}
            alt={`${recipient.first_name} ${recipient.last_name}`}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
            {initials}
          </div>
        )}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-0.5">Послание до</p>
          <p className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
            {recipient.first_name} {recipient.last_name}
          </p>
        </div>
      </div>

      {isApproved ? (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-green-600 text-base">check_circle</span>
            <span className="text-sm font-semibold text-green-700">Посланието е одобрено</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed italic">„{existingMessage.content}"</p>
        </div>
      ) : (
        <div className="space-y-4">
          {isPending && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-base">schedule</span>
              Имате послание, което чака одобрение. Можете да го редактирате преди да бъде прегледано.
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Вашето послание
            </label>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Напишете нещо топло за ${recipient.first_name}…`}
              maxLength={300}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-white shadow-sm"
            />
            <div className="flex justify-between mt-1.5">
              <span className={`text-xs ${text.length >= 270 ? 'text-amber-500' : 'text-gray-400'}`}>
                {text.length}/300
              </span>
              {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow"
          >
            <span className="material-symbols-outlined text-base">send</span>
            {submitting ? 'Изпращане...' : isPending ? 'Обнови посланието' : 'Изпрати послание'}
          </button>

          <p className="text-xs text-center text-gray-400">
            Посланието ще бъде видимо след одобрение от модератора.
          </p>
        </div>
      )}
    </div>
  )
}
