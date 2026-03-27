'use client'

import { useState } from 'react'
import JoinRegisterForm from './JoinRegisterForm'
import JoinLoginForm from './JoinLoginForm'

interface Props {
  studentId: string
  studentName: string
  parentEmail: string
  defaultMode: 'register' | 'login'
}

export default function JoinAuthForms({ studentId, studentName, parentEmail, defaultMode }: Props) {
  const [mode, setMode] = useState<'register' | 'login'>(defaultMode)

  return (
    <div>
      {mode === 'register' ? (
        <JoinRegisterForm
          studentId={studentId}
          studentName={studentName}
          parentEmail={parentEmail}
          emailEditable={!parentEmail}
        />
      ) : (
        <JoinLoginForm
          studentId={studentId}
          studentName={studentName}
          parentEmail={parentEmail}
        />
      )}

      <p className="text-center text-xs text-gray-400 mt-5 pt-4 border-t border-gray-100">
        {mode === 'register' ? (
          <>
            Вече имате профил?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Влезте тук
            </button>
          </>
        ) : (
          <>
            Нямате профил?{' '}
            <button
              onClick={() => setMode('register')}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Регистрирайте се
            </button>
          </>
        )}
      </p>
    </div>
  )
}
