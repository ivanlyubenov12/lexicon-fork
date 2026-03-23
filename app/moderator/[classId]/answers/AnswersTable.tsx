'use client'

import { useState, useTransition } from 'react'
import AnswerActions from './AnswerActions'
import { bulkApproveAnswers } from '../actions'

export interface Answer {
  id: string
  status: string
  text_content: string | null
  media_url: string | null
  media_type: string | null
  updated_at: string
  student_id: string
  question_id: string
  students: { first_name: string; last_name: string }
  questions: { text: string; order_index: number }
}

interface Props {
  answers: Answer[]
  classId: string
}

type FilterTab = 'all' | 'submitted' | 'approved'

function StatusBadge({ status }: { status: string }) {
  if (status === 'submitted') {
    return <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">Чакащ</span>
  }
  if (status === 'approved') {
    return <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Одобрен</span>
  }
  return <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">Чернова</span>
}

function ContentPreview({ answer }: { answer: Answer }) {
  if (answer.media_url) {
    return (
      <a href={answer.media_url} target="_blank" rel="noopener noreferrer"
        className="text-indigo-600 hover:underline text-sm">
        ▶ Виж медия
      </a>
    )
  }
  if (answer.text_content) {
    const preview = answer.text_content.length > 100
      ? answer.text_content.slice(0, 100) + '…'
      : answer.text_content
    return <span className="text-gray-600 text-sm">{preview}</span>
  }
  return <span className="text-gray-400 text-sm">—</span>
}

export default function AnswersTable({ answers, classId }: Props) {
  const [filter, setFilter] = useState<FilterTab>('submitted')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  function handleBulkApprove(e: React.MouseEvent, submittedIds: string[]) {
    e.stopPropagation()
    startTransition(async () => {
      await bulkApproveAnswers(submittedIds, classId)
    })
  }

  function toggleExpand(studentId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  // Filter answers by tab
  const filtered = answers.filter((a) => {
    if (filter === 'all') return true
    if (filter === 'submitted') return a.status === 'submitted'
    if (filter === 'approved') return a.status === 'approved'
    return true
  })

  // Group by student
  const studentMap = new Map<string, { name: string; answers: Answer[] }>()
  for (const a of filtered) {
    const key = a.student_id
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        name: `${a.students.first_name} ${a.students.last_name}`,
        answers: [],
      })
    }
    studentMap.get(key)!.answers.push(a)
  }
  const studentGroups = Array.from(studentMap.entries()).sort((a, b) =>
    a[1].name.localeCompare(b[1].name)
  )

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'Всички', count: answers.length },
    { key: 'submitted', label: 'Чакащи', count: answers.filter(a => a.status === 'submitted').length },
    { key: 'approved', label: 'Одобрени', count: answers.filter(a => a.status === 'approved').length },
  ]

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={
              filter === tab.key
                ? 'pb-3 border-b-2 border-indigo-600 text-indigo-600 font-semibold text-sm flex items-center gap-2'
                : 'pb-3 text-gray-500 hover:text-gray-700 text-sm flex items-center gap-2'
            }
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                filter === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {studentGroups.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {filter === 'submitted' ? 'Няма чакащи отговори' : 'Няма отговори'}
        </div>
      ) : (
        <div className="space-y-2">
          {studentGroups.map(([studentId, group]) => (
            <div key={studentId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Student row */}
              {(() => {
                const submittedIds = group.answers.filter(a => a.status === 'submitted').map(a => a.id)
                return (
                  <div
                    role="button"
                    onClick={() => toggleExpand(studentId)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-semibold">
                        {group.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{group.name}</span>
                      <span className="text-xs text-gray-500">
                        {group.answers.length} {group.answers.length === 1 ? 'отговор' : 'отговора'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {submittedIds.length > 0 && (
                        <button
                          onClick={(e) => handleBulkApprove(e, submittedIds)}
                          disabled={isPending}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Одобри всички ({submittedIds.length})
                        </button>
                      )}
                      <span className={`text-gray-400 text-lg transition-transform duration-200 ${
                        expanded.has(studentId) ? 'rotate-180' : ''
                      }`}>
                        ↓
                      </span>
                    </div>
                  </div>
                )
              })()}

              {/* Expanded answers */}
              {expanded.has(studentId) && (
                <div className="border-t border-gray-100 divide-y divide-gray-100">
                  {group.answers
                    .sort((a, b) => a.questions.order_index - b.questions.order_index)
                    .map((answer) => (
                      <div key={answer.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Question */}
                            <p className="text-xs font-medium text-gray-500 mb-1">
                              Въпрос {answer.questions.order_index}
                            </p>
                            <p className="text-sm font-medium text-gray-800 mb-2">
                              {answer.questions.text}
                            </p>
                            {/* Content preview */}
                            <ContentPreview answer={answer} />
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <StatusBadge status={answer.status} />
                            <AnswerActions answer={answer} classId={classId} />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
