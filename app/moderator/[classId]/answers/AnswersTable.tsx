'use client'

import { useState, useTransition } from 'react'
import AnswerActions from './AnswerActions'
import MessageActions from '../messages/MessageActions'
import { bulkApproveAnswers, bulkApproveMessages } from '../actions'
import VoiceAnswersTable, { type VoiceAnswer } from './VoiceAnswersTable'

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

export interface Message {
  id: string
  content: string
  status: string
  created_at: string
  recipient_student_id: string
  author_student_id: string
  recipient: { first_name: string; last_name: string }
  author: { first_name: string; last_name: string }
}

interface Props {
  answers: Answer[]
  messages: Message[]
  voiceAnswers: VoiceAnswer[]
  classId: string
}

type FilterTab = 'all' | 'pending' | 'approved'

function StatusBadge({ status }: { status: string }) {
  if (status === 'submitted' || status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-700">
        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>schedule</span>
        Чакащ
      </span>
    )
  }
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-green-100 text-green-700">
        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span>
        Одобрен
      </span>
    )
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-100 text-red-600">
        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>cancel</span>
        Отхвърлен
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-500">
      Чернова
    </span>
  )
}

// ── Answers section ──────────────────────────────────────────────────────────

function AnswersSection({ answers, classId, filter }: { answers: Answer[]; classId: string; filter: FilterTab }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  function handleBulkApprove(e: React.MouseEvent, submittedIds: string[]) {
    e.stopPropagation()
    startTransition(async () => { await bulkApproveAnswers(submittedIds, classId) })
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const filtered = answers.filter(a => {
    if (filter === 'all') return true
    if (filter === 'pending') return a.status === 'submitted'
    if (filter === 'approved') return a.status === 'approved'
    return true
  })

  if (filtered.length === 0) return null

  const studentMap = new Map<string, { name: string; answers: Answer[] }>()
  for (const a of filtered) {
    if (!studentMap.has(a.student_id)) {
      studentMap.set(a.student_id, { name: `${a.students.first_name} ${a.students.last_name}`, answers: [] })
    }
    studentMap.get(a.student_id)!.answers.push(a)
  }
  const groups = Array.from(studentMap.entries()).sort((a, b) => a[1].name.localeCompare(b[1].name))

  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-base">quiz</span>
        Отговори на въпроси
        <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">{filtered.length}</span>
      </h2>
      <div className="space-y-3">
        {groups.map(([studentId, group]) => {
          const submittedIds = group.answers.filter(a => a.status === 'submitted').map(a => a.id)
          const isOpen = expanded.has(studentId)
          return (
            <div key={studentId} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div
                role="button"
                onClick={() => toggleExpand(studentId)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold flex-shrink-0">
                    {group.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{group.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {group.answers.length} {group.answers.length === 1 ? 'отговор' : 'отговора'}
                      {submittedIds.length > 0 && (
                        <span className="ml-2 text-amber-500 font-medium">· Очакващи одобрение: {submittedIds.length}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {submittedIds.length > 0 && (
                    <button
                      onClick={(e) => handleBulkApprove(e, submittedIds)}
                      disabled={isPending}
                      className="text-xs font-semibold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      Одобри всички ({submittedIds.length})
                    </button>
                  )}
                  <span className={`material-symbols-outlined text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {group.answers
                    .sort((a, b) => a.questions.order_index - b.questions.order_index)
                    .map(answer => (
                      <div key={answer.id} className="px-6 py-5">
                        <div className="flex items-start gap-6">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                              Въпрос {answer.questions.order_index}
                            </p>
                            <p className="text-base text-indigo-700 font-medium mb-3 leading-snug" style={{ fontFamily: 'Noto Serif, serif' }}>
                              {answer.questions.text}
                            </p>
                            {answer.media_url ? (
                              <a href={answer.media_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                <span className="material-symbols-outlined text-base">play_circle</span>
                                Виж медия
                              </a>
                            ) : answer.text_content ? (
                              <p className="text-gray-600 text-sm leading-relaxed italic" style={{ fontFamily: 'Noto Serif, serif' }}>
                                „{answer.text_content.length > 120 ? answer.text_content.slice(0, 120) + '…' : answer.text_content}"
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-col items-end gap-3 flex-shrink-0 pt-1">
                            <StatusBadge status={answer.status} />
                            <AnswerActions answer={answer} classId={classId} />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Messages section ─────────────────────────────────────────────────────────

function MessagesSection({ messages, classId, filter }: { messages: Message[]; classId: string; filter: FilterTab }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleBulkApprove(e: React.MouseEvent, ids: string[]) {
    e.stopPropagation()
    startTransition(async () => { await bulkApproveMessages(ids, classId) })
  }

  const filtered = messages.filter(m => {
    if (filter === 'all') return true
    if (filter === 'pending') return m.status === 'pending'
    if (filter === 'approved') return m.status === 'approved'
    return true
  })

  if (filtered.length === 0) return null

  // Group by author
  const authorMap = new Map<string, { name: string; messages: Message[] }>()
  for (const m of filtered) {
    if (!authorMap.has(m.author_student_id)) {
      authorMap.set(m.author_student_id, {
        name: `${m.author.first_name} ${m.author.last_name}`,
        messages: [],
      })
    }
    authorMap.get(m.author_student_id)!.messages.push(m)
  }
  const groups = Array.from(authorMap.entries()).sort((a, b) => a[1].name.localeCompare(b[1].name))

  function initials(name: string) {
    const [f = '', l = ''] = name.split(' ')
    return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase()
  }

  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-base">favorite</span>
        Послания между участници
        <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">{filtered.length}</span>
      </h2>
      <div className="space-y-3">
        {groups.map(([authorId, group]) => {
          const pendingIds = group.messages.filter(m => m.status === 'pending').map(m => m.id)
          const isOpen = expanded.has(authorId)
          return (
            <div key={authorId} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div
                role="button"
                onClick={() => toggleExpand(authorId)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-sm font-bold flex-shrink-0">
                    {initials(group.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{group.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {group.messages.length} {group.messages.length === 1 ? 'послание' : 'послания'}
                      {pendingIds.length > 0 && (
                        <span className="ml-2 text-amber-500 font-medium">· Очакващи одобрение: {pendingIds.length}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {pendingIds.length > 0 && (
                    <button
                      onClick={(e) => handleBulkApprove(e, pendingIds)}
                      disabled={isPending}
                      className="text-xs font-semibold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      Одобри всички ({pendingIds.length})
                    </button>
                  )}
                  <span className={`material-symbols-outlined text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {group.messages.map(message => (
                    <div key={message.id} className="px-6 py-5">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 mb-1.5">
                            → <span className="font-semibold text-gray-700">{message.recipient.first_name} {message.recipient.last_name}</span>
                          </p>
                          <p className="text-sm text-gray-600 leading-relaxed italic" style={{ fontFamily: 'Noto Serif, serif' }}>
                            „{message.content.length > 200 ? message.content.slice(0, 200) + '…' : message.content}"
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-3 flex-shrink-0">
                          <StatusBadge status={message.status} />
                          <MessageActions message={message} classId={classId} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main table ───────────────────────────────────────────────────────────────

type TypeFilter = 'all' | 'answers' | 'messages' | 'voice'

export default function AnswersTable({ answers, messages, voiceAnswers, classId }: Props) {
  const [statusFilter, setStatusFilter] = useState<FilterTab>('pending')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const pendingCount = answers.filter(a => a.status === 'submitted').length + messages.filter(m => m.status === 'pending').length
  const approvedCount = answers.filter(a => a.status === 'approved').length + messages.filter(m => m.status === 'approved').length
  const totalCount = answers.length + messages.length

  const statusTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'Всички', count: totalCount },
    { key: 'pending', label: 'Чакащи', count: pendingCount },
    { key: 'approved', label: 'Одобрени', count: approvedCount },
  ]

  const typeTags: { key: TypeFilter; label: string; icon: string; count: number }[] = [
    { key: 'all', label: 'Всичко', icon: 'apps', count: totalCount },
    { key: 'answers', label: 'Въпроси', icon: 'quiz', count: answers.length },
    { key: 'messages', label: 'Послания', icon: 'favorite', count: messages.length },
    { key: 'voice', label: 'Групов глас', icon: 'record_voice_over', count: voiceAnswers.length },
  ]

  const isVoiceTab = typeFilter === 'voice'
  const showAnswers = !isVoiceTab && (typeFilter === 'all' || typeFilter === 'answers')
  const showMessages = !isVoiceTab && (typeFilter === 'all' || typeFilter === 'messages')

  const filteredAnswers = showAnswers
    ? answers.filter(a => statusFilter === 'all' || (statusFilter === 'pending' ? a.status === 'submitted' : a.status === 'approved'))
    : []
  const filteredMessages = showMessages
    ? messages.filter(m => statusFilter === 'all' || (statusFilter === 'pending' ? m.status === 'pending' : m.status === 'approved'))
    : []
  const isEmpty = !isVoiceTab && filteredAnswers.length === 0 && filteredMessages.length === 0

  return (
    <div>
      {/* Type tags */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {typeTags.map(tag => (
          <button
            key={tag.key}
            onClick={() => setTypeFilter(tag.key)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              typeFilter === tag.key
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tag.icon}</span>
            {tag.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${typeFilter === tag.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {tag.count}
            </span>
          </button>
        ))}
      </div>

      {/* Voice tab — no status filter needed */}
      {isVoiceTab ? (
        <VoiceAnswersTable answers={voiceAnswers} classId={classId} />
      ) : (
        <>
          {/* Status tabs */}
          <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit mb-8 shadow-sm">
            {statusTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === tab.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {isEmpty ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-16 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-200 block mb-3">volunteer_activism</span>
              <p className="text-gray-500 text-sm font-medium">
                {statusFilter === 'pending' ? 'Няма чакащи елементи' : 'Няма елементи'}
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {showAnswers && <AnswersSection answers={answers} classId={classId} filter={statusFilter} />}
              {showMessages && <MessagesSection messages={messages} classId={classId} filter={statusFilter} />}
            </div>
          )}
        </>
      )}
    </div>
  )
}
