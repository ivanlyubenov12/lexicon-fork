'use client'

import { useEffect, useRef } from 'react'
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
  student: { id: string; first_name: string; last_name: string; photo_url: string | null }
  questions: Question[]
  answers: Answer[]
  messages: Message[]
  prevStudentId: string | null
  nextStudentId: string | null
}

function AutoPauseVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) video.pause()
      },
      { threshold: 0.2 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      className="w-full rounded-xl mt-2 max-h-64"
      preload="metadata"
    />
  )
}

export default function StudentReaderView({
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
      {/* Top nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href={`/class/${classId}/home`} className="text-sm text-gray-400 hover:text-gray-600">
            ← {className}
          </Link>
          <div className="flex items-center gap-4">
            {prevStudentId && (
              <Link href={`/class/${classId}/student/${prevStudentId}`} className="text-sm text-gray-400 hover:text-indigo-600">
                ← Предишно
              </Link>
            )}
            {nextStudentId && (
              <Link href={`/class/${classId}/student/${nextStudentId}`} className="text-sm text-gray-400 hover:text-indigo-600">
                Следващо →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Profile */}
        <div className="flex flex-col items-center text-center pb-2">
          {student.photo_url ? (
            <img
              src={student.photo_url}
              alt={student.first_name}
              className="w-32 h-32 rounded-full object-cover shadow-md mb-4"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center shadow-md mb-4">
              <span className="text-indigo-400 text-5xl font-bold">{student.first_name[0]}</span>
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
              return (
                <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <p className="text-xs font-semibold text-indigo-500 mb-3">
                    {q.order_index}. {q.text}
                  </p>
                  {answer.text_content && (
                    <p className="text-sm text-gray-800 leading-relaxed">{answer.text_content}</p>
                  )}
                  {answer.media_url && answer.media_type === 'video' && (
                    <AutoPauseVideo src={answer.media_url} />
                  )}
                  {answer.media_url && answer.media_type === 'audio' && (
                    <audio src={answer.media_url} controls className="w-full mt-2" preload="metadata" />
                  )}
                  {answer.media_url && !answer.media_type && (
                    <img src={answer.media_url} alt="" className="w-full rounded-xl mt-2 object-cover max-h-80" />
                  )}
                </div>
              )
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
            <h2 className="font-semibold text-gray-800 mb-4">Очите на другите</h2>
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

        {/* Bottom nav */}
        <div className="flex justify-between pt-4 pb-8">
          {prevStudentId ? (
            <Link href={`/class/${classId}/student/${prevStudentId}`} className="text-sm text-indigo-600 hover:text-indigo-800">
              ← Предишно дете
            </Link>
          ) : <span />}
          {nextStudentId ? (
            <Link href={`/class/${classId}/student/${nextStudentId}`} className="text-sm text-indigo-600 hover:text-indigo-800">
              Следващо дете →
            </Link>
          ) : <span />}
        </div>
      </div>
    </main>
  )
}
