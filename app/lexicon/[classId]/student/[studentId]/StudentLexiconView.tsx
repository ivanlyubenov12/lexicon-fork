'use client'

import Link from 'next/link'

interface Question {
  id: string
  text: string
  order_index: number
  type: string
}

interface Answer {
  question_id: string
  text_content: string | null
  media_url: string | null
  media_type: string | null
}

interface Message {
  id: string
  content: string
  authorName: string
}

interface Props {
  classId: string
  className: string
  student: {
    id: string
    first_name: string
    last_name: string
    photo_url: string | null
  }
  questions: Question[]
  answers: Answer[]
  messages: Message[]
  prevStudentId: string | null
  nextStudentId: string | null
}

function AnswerCard({ question, answer }: { question: Question; answer: Answer }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-xs font-semibold text-indigo-500 mb-2">
        {question.order_index}. {question.text}
      </p>
      {answer.text_content && (
        <p className="text-sm text-gray-800 leading-relaxed">{answer.text_content}</p>
      )}
      {answer.media_url && answer.media_type === 'video' && (
        <video
          src={answer.media_url}
          controls
          className="w-full rounded-xl mt-2 max-h-64"
          preload="metadata"
        />
      )}
      {answer.media_url && answer.media_type === 'audio' && (
        <audio src={answer.media_url} controls className="w-full mt-2" preload="metadata" />
      )}
      {answer.media_url && !answer.media_type && (
        <img src={answer.media_url} alt="" className="w-full rounded-xl mt-2 object-cover max-h-80" />
      )}
    </div>
  )
}

export default function StudentLexiconView({
  classId,
  className,
  student,
  questions,
  answers,
  messages,
  prevStudentId,
  nextStudentId,
}: Props) {
  const answerMap = new Map(answers.map((a) => [a.question_id, a]))
  const answeredQuestions = questions.filter((q) => answerMap.has(q.id))

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href={`/lexicon/${classId}/students`} className="text-gray-400 hover:text-gray-600 text-sm">
            ← {className}
          </Link>
          <div className="flex items-center gap-3">
            {prevStudentId && (
              <Link
                href={`/lexicon/${classId}/student/${prevStudentId}`}
                className="text-gray-400 hover:text-indigo-600 text-sm"
              >
                ←
              </Link>
            )}
            {nextStudentId && (
              <Link
                href={`/lexicon/${classId}/student/${nextStudentId}`}
                className="text-gray-400 hover:text-indigo-600 text-sm"
              >
                →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Profile header */}
        <div className="flex flex-col items-center text-center pb-2">
          {student.photo_url ? (
            <img
              src={student.photo_url}
              alt={student.first_name}
              className="w-28 h-28 rounded-full object-cover shadow-md mb-3"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center mb-3 shadow-md">
              <span className="text-indigo-400 text-4xl font-bold">{student.first_name[0]}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {student.first_name} {student.last_name}
          </h1>
        </div>

        {/* Answers */}
        {answeredQuestions.length > 0 ? (
          <div className="space-y-4">
            {answeredQuestions.map((q) => {
              const answer = answerMap.get(q.id)!
              return <AnswerCard key={q.id} question={q} answer={answer} />
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">Все още няма одобрени отговори.</p>
          </div>
        )}

        {/* Peer messages */}
        {messages.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Послания от съучениците</h2>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-sm text-gray-800 leading-relaxed mb-2">{msg.content}</p>
                  <p className="text-xs text-indigo-400 text-right">— {msg.authorName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom navigation */}
        <div className="flex justify-between pt-4">
          {prevStudentId ? (
            <Link
              href={`/lexicon/${classId}/student/${prevStudentId}`}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              ← Предишно дете
            </Link>
          ) : <span />}
          {nextStudentId ? (
            <Link
              href={`/lexicon/${classId}/student/${nextStudentId}`}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Следващо дете →
            </Link>
          ) : <span />}
        </div>
      </div>
    </main>
  )
}
