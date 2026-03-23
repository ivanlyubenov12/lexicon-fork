'use client'

import Link from 'next/link'

interface Props {
  classData: { id: string; name: string; school_year: string; status: string }
  students: Array<{ id: string; first_name: string; last_name: string; invite_accepted_at: string | null }>
  pendingAnswers: number
  pendingMessages: number
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Чернова',
  active: 'Активен',
  ready_for_payment: 'Готов за плащане',
  pending_payment: 'Очаква плащане',
  published: 'Публикуван',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  ready_for_payment: 'bg-blue-100 text-blue-700',
  pending_payment: 'bg-yellow-100 text-yellow-700',
  published: 'bg-indigo-100 text-indigo-700',
}

export default function Dashboard({ classData, students, pendingAnswers, pendingMessages }: Props) {
  const totalStudents = students.length
  const acceptedStudents = students.filter((s) => s.invite_accepted_at !== null).length
  const progressPercent = totalStudents > 0 ? Math.round((acceptedStudents / totalStudents) * 100) : 0

  const statusLabel = STATUS_LABELS[classData.status] ?? classData.status
  const statusColor = STATUS_COLORS[classData.status] ?? 'bg-gray-100 text-gray-600'

  const baseUrl = `/moderator/${classData.id}`
  const isPublished = classData.status === 'published'

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
              <p className="text-sm text-gray-500 mt-1">Учебна година: {classData.school_year}</p>
              {isPublished && (
                <Link
                  href={`/lexicon/${classData.id}`}
                  className="inline-block mt-2 text-xs text-indigo-600 hover:underline"
                >
                  Виж публикувания →
                </Link>
              )}
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Прогрес на класа</span>
            <span className="text-sm text-gray-500">
              {acceptedStudents} от {totalStudents} деца са попълнили профила си
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{progressPercent}%</p>
        </div>

        {/* 2x2 card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Answers */}
          <Link href={`${baseUrl}/answers`} className="group">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Отговори за одобрение</p>
                  {pendingAnswers > 0 && (
                    <span className="inline-flex items-center justify-center bg-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6">
                      {pendingAnswers}
                    </span>
                  )}
                  {pendingAnswers === 0 && (
                    <span className="text-xs text-gray-400">Няма нови</span>
                  )}
                </div>
                <span className="text-gray-300 group-hover:text-indigo-400 transition-colors text-xl">→</span>
              </div>
            </div>
          </Link>

          {/* Messages */}
          <Link href={`${baseUrl}/messages`} className="group">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Послания за одобрение</p>
                  {pendingMessages > 0 && (
                    <span className="inline-flex items-center justify-center bg-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6">
                      {pendingMessages}
                    </span>
                  )}
                  {pendingMessages === 0 && (
                    <span className="text-xs text-gray-400">Няма нови</span>
                  )}
                </div>
                <span className="text-gray-300 group-hover:text-indigo-400 transition-colors text-xl">→</span>
              </div>
            </div>
          </Link>

          {/* Students */}
          <Link href={`${baseUrl}/students`} className="group">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Деца</p>
                  <span className="text-lg font-semibold text-gray-800">{totalStudents}</span>
                </div>
                <span className="text-gray-300 group-hover:text-indigo-400 transition-colors text-xl">→</span>
              </div>
            </div>
          </Link>

          {/* Superhero */}
          <Link href={`${baseUrl}/superhero`} className="group">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Супергерой</p>
                  <p className="text-xs text-gray-400 mt-1">Генерирай образа на класната</p>
                </div>
                <span className="text-gray-300 group-hover:text-indigo-400 transition-colors text-xl">→</span>
              </div>
            </div>
          </Link>

          {/* Finalize */}
          <Link href={`${baseUrl}/finalize`} className="group">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Финализирай</p>
                  <p className="text-xs text-gray-400 mt-1">Заключи и публикувай</p>
                </div>
                <span className="text-gray-300 group-hover:text-indigo-400 transition-colors text-xl">→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
