'use client'

import { useState, useTransition } from 'react'
import { deleteVoiceAnswer, updateVoiceAnswer } from './voiceActions'

export interface VoiceAnswer {
  id: string
  content: string
  question_id: string
  questions: { text: string }
}

interface Props {
  answers: VoiceAnswer[]
  classId: string
}

function VoiceAnswerRow({ answer, classId }: { answer: VoiceAnswer; classId: string }) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(answer.content)
  const [deleted, setDeleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (deleted) return null

  function handleDelete() {
    if (!confirm(`Изтрий „${answer.content}"?`)) return
    startTransition(async () => {
      const res = await deleteVoiceAnswer(answer.id, classId)
      if (res.error) setError(res.error)
      else setDeleted(true)
    })
  }

  function handleSave() {
    if (!value.trim() || value.trim() === answer.content) { setEditing(false); return }
    startTransition(async () => {
      const res = await updateVoiceAnswer(answer.id, value.trim(), classId)
      if (res.error) setError(res.error)
      else setEditing(false)
    })
  }

  return (
    <div className={`flex items-center gap-3 py-2 px-3 rounded-lg group hover:bg-gray-50 transition-colors ${isPending ? 'opacity-50' : ''}`}>
      {editing ? (
        <>
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setValue(answer.content); setEditing(false) } }}
            autoFocus
            className="flex-1 border border-indigo-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button onClick={handleSave} disabled={isPending} className="text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
            Запази
          </button>
          <button onClick={() => { setValue(answer.content); setEditing(false) }} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5">
            Откажи
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm text-gray-800">{value}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditing(true)}
              title="Редактирай"
              className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              <span className="material-symbols-outlined text-base">edit</span>
            </button>
            <button
              onClick={handleDelete}
              title="Изтрий"
              disabled={isPending}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        </>
      )}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}

export default function VoiceAnswersTable({ answers, classId }: Props) {
  // Group by question
  const grouped: Record<string, { text: string; answers: VoiceAnswer[] }> = {}
  for (const a of answers) {
    if (!grouped[a.question_id]) {
      grouped[a.question_id] = { text: a.questions.text, answers: [] }
    }
    grouped[a.question_id].answers.push(a)
  }

  const groups = Object.entries(grouped)

  if (groups.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <span className="material-symbols-outlined text-4xl mb-3 block">record_voice_over</span>
        <p className="text-sm">Няма гласувания още</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {groups.map(([qId, group]) => (
        <div key={qId} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">{group.text}</h3>
            <span className="text-xs text-gray-400">{group.answers.length} отговора</span>
          </div>
          <div className="px-2 py-2 divide-y divide-gray-50">
            {group.answers.map(a => (
              <VoiceAnswerRow key={a.id} answer={a} classId={classId} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
