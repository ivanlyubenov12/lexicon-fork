'use client'

import { useState } from 'react'
import Link from 'next/link'
import MessagesSection from './MessagesSection'
import PhotoUpload from './PhotoUpload'
import ClassVoiceSection from './ClassVoiceSection'

interface Question {
  id: string
  text: string
  order_index: number
  allows_text: boolean
  allows_media: boolean
}

interface Props {
  student: {
    id: string
    first_name: string
    last_name: string
    photo_url: string | null
  }
  personalQuestions: Question[]
  classQuestions: Question[]
  answers: Array<{ question_id: string; status: string }>
  classStatus: string
  classVoiceQuestions: Array<{ id: string; text: string; order_index: number }>
  classId: string
  classmates: Array<{ id: string; first_name: string; last_name: string; photo_url: string | null }>
  sentMessages: Array<{ recipient_student_id: string; status: string; content: string }>
}

type Tab = 'personal' | 'messages' | 'class'

function statusDot(status: string | undefined) {
  if (status === 'approved') return <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
  if (status === 'submitted') return <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 flex-shrink-0" />
  return <span className="w-2.5 h-2.5 rounded-full bg-gray-300 flex-shrink-0" />
}

function QuestionList({ questions, answers, studentId }: {
  questions: Question[]
  answers: Map<string, string>
  studentId: string
}) {
  if (questions.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">Няма въпроси в тази секция.</p>
  }

  return (
    <div className="space-y-3">
      {questions.map((question) => {
        const status = answers.get(question.id)
        const questionText = question.text.length > 55
          ? question.text.slice(0, 55) + '…'
          : question.text

        return (
          <Link
            key={question.id}
            href={`/my/${studentId}/question/${question.id}`}
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-4 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            {statusDot(status)}
            <span className="text-xs font-semibold text-gray-400 w-5 flex-shrink-0">
              {question.order_index}
            </span>
            <span className="flex-1 text-sm text-gray-700">{questionText}</span>
            <span className="text-gray-400 text-sm">→</span>
          </Link>
        )
      })}
    </div>
  )
}

export default function StudentProfileParent({
  student,
  personalQuestions,
  classQuestions,
  classVoiceQuestions,
  answers,
  classStatus,
  classId,
  classmates,
  sentMessages,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('personal')

  const answerMap = new Map(answers.map((a) => [a.question_id, a.status]))

  const approvedPersonal = personalQuestions.filter((q) => answerMap.get(q.id) === 'approved').length
  const approvedClass = classQuestions.filter((q) => answerMap.get(q.id) === 'approved').length
  const totalPersonal = personalQuestions.length
  const totalClass = classQuestions.length
  const totalApproved = approvedPersonal + approvedClass
  const totalAll = totalPersonal + totalClass
  const progressPercent = totalAll > 0 ? (totalApproved / totalAll) * 100 : 0

  const isClassActive = classStatus === 'active' || classStatus === 'ready_for_payment'

  const tabs: { key: Tab; label: string }[] = [
    { key: 'personal', label: 'Въпроси към мен' },
    { key: 'messages', label: 'Послания към другите' },
    { key: 'class', label: 'Моят клас и аз' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-5">
          <PhotoUpload
            studentId={student.id}
            photoUrl={student.photo_url}
            firstName={student.first_name}
          />
          <h1 className="text-xl font-bold text-gray-800 mt-2">
            {student.first_name} {student.last_name}
          </h1>
        </div>

        {/* Class inactive banner */}
        {!isClassActive && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3 rounded-lg mb-4 text-center">
            Класът все още не е активен.
          </div>
        )}

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Общ прогрес</span>
            <span className="text-xs font-semibold text-indigo-600">
              {totalApproved} / {totalAll} одобрени
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 pb-3 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'personal' && (
          <QuestionList
            questions={personalQuestions}
            answers={answerMap}
            studentId={student.id}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesSection
            authorStudentId={student.id}
            classmates={classmates}
            sentMessages={sentMessages}
          />
        )}

        {activeTab === 'class' && (
          <>
            <QuestionList
              questions={classQuestions}
              answers={answerMap}
              studentId={student.id}
            />
            <ClassVoiceSection
              classId={classId}
              questions={classVoiceQuestions}
            />
          </>
        )}
      </div>
    </div>
  )
}
