'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateClassInfo, addStudents, sendInvites, completeSetup } from './actions'

interface ParsedStudent {
  first_name: string
  last_name: string
  parent_email: string
}

interface Props {
  classId: string
}

function ProgressIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      <span className="text-sm text-gray-500 mr-2">Стъпка {step} от 3</span>
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`w-3 h-3 rounded-full transition-colors ${
            s < step
              ? 'bg-indigo-600'
              : s === step
              ? 'bg-indigo-600 ring-2 ring-indigo-200'
              : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

function parseStudentLines(text: string): ParsedStudent[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  return lines.flatMap((line) => {
    // Split by common delimiters: comma, pipe, tab, or multiple spaces
    const parts = line
      .split(/[,|;\t]/)
      .flatMap((p) => p.trim().split(/\s{2,}/))
      .map((p) => p.trim())
      .filter(Boolean)

    const emailPart = parts.find((p) => p.includes('@'))
    const nameParts = parts.filter((p) => !p.includes('@'))

    if (!emailPart) return []

    // Name: first word = first_name, rest = last_name
    const allNameWords = nameParts.join(' ').trim().split(/\s+/)
    const first_name = allNameWords[0] ?? ''
    const last_name = allNameWords.slice(1).join(' ')

    if (!first_name) return []

    return [{ first_name, last_name, parent_email: emailPart }]
  })
}

// ─── Step 1: Configure class ───────────────────────────────────────────────

function Step1({
  classId,
  onNext,
}: {
  classId: string
  onNext: () => void
}) {
  const [className, setClassName] = useState('')
  const [school, setSchool] = useState('')
  const [schoolYear, setSchoolYear] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setLogoUrl(data.url)
    } catch {
      setError('Качването на логото не успя.')
    } finally {
      setLogoUploading(false)
    }
  }

  function handleNext() {
    if (!className.trim() || !school.trim() || !schoolYear.trim()) {
      setError('Моля попълнете всички полета.')
      return
    }

    setError(null)
    startTransition(async () => {
      const name = `${className.trim()} — ${school.trim()}`
      const result = await updateClassInfo(classId, {
        name,
        school_year: schoolYear.trim(),
        ...(logoUrl ? { school_logo_url: logoUrl } : {}),
      })
      if (result.error) {
        setError(result.error)
      } else {
        onNext()
      }
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Настройте класа</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Клас</label>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="3А"
          className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Училище</label>
        <input
          type="text"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          placeholder="СУ Климент Охридски"
          className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Учебна година</label>
        <input
          type="text"
          value={schoolYear}
          onChange={(e) => setSchoolYear(e.target.value)}
          placeholder="2024/2025"
          className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Лого на училището <span className="text-gray-400 font-normal">(по желание)</span>
        </label>
        <div className="flex items-center gap-4">
          {logoUrl && (
            <img src={logoUrl} alt="Лого" className="w-14 h-14 rounded-lg object-contain border border-gray-200 bg-white p-1" />
          )}
          <label className="cursor-pointer inline-flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
            {logoUploading ? 'Качване...' : logoUrl ? 'Смени логото' : 'Качи лого'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
              disabled={logoUploading}
            />
          </label>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleNext}
          disabled={isPending || logoUploading}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 w-full"
        >
          {isPending ? 'Запазване...' : 'Напред →'}
        </button>
      </div>
    </div>
  )
}

// ─── Step 2: Add students ──────────────────────────────────────────────────

function Step2({
  classId,
  onNext,
  onBack,
  onStudentsAdded,
}: {
  classId: string
  onNext: () => void
  onBack: () => void
  onStudentsAdded: (students: ParsedStudent[]) => void
}) {
  const [bulkText, setBulkText] = useState('')
  const [parsed, setParsed] = useState<ParsedStudent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleBulkChange(text: string) {
    setBulkText(text)
    const students = parseStudentLines(text)
    setParsed(students)
  }

  function handleAddEmptyRow() {
    setParsed((prev) => [...prev, { first_name: '', last_name: '', parent_email: '' }])
  }

  function handleRemoveRow(index: number) {
    setParsed((prev) => prev.filter((_, i) => i !== index))
  }

  function handleUpdateRow(index: number, field: keyof ParsedStudent, value: string) {
    setParsed((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  function handleNext() {
    setError(null)
    setWarning(null)

    if (parsed.length === 0) {
      setWarning(
        'Не сте добавили деца. Можете да го направите по-късно от раздел Деца.'
      )
    }

    // Validate rows
    const invalid = parsed.filter(
      (s) => !s.first_name.trim() || !s.parent_email.trim() || !s.parent_email.includes('@')
    )
    if (invalid.length > 0) {
      setError(`${invalid.length} реда съдържат непълни или невалидни данни. Моля проверете.')`)
      return
    }

    startTransition(async () => {
      const validStudents = parsed.filter((s) => s.first_name.trim() && s.parent_email.trim())
      const result = await addStudents(classId, validStudents)
      if (result.error) {
        setError(result.error)
      } else {
        onStudentsAdded(validStudents)
        onNext()
      }
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Добавете деца</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {warning && !error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm px-4 py-3 rounded-lg">
          {warning}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Поставете списък с деца
        </label>
        <textarea
          value={bulkText}
          onChange={(e) => handleBulkChange(e.target.value)}
          rows={5}
          placeholder={'Иван Иванов ivan@example.com\nМария Петрова maria@example.com'}
          className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full font-mono"
        />
        <p className="text-xs text-gray-400 mt-1">
          Един ред = едно дете. Имейлът се разпознава автоматично по „@".
        </p>
      </div>

      {parsed.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Разпознати: {parsed.length} {parsed.length === 1 ? 'дете' : 'деца'}
          </p>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Име</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Фамилия</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Имейл родител</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {parsed.map((student, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={student.first_name}
                        onChange={(e) => handleUpdateRow(i, 'first_name', e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={student.last_name}
                        onChange={(e) => handleUpdateRow(i, 'last_name', e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="email"
                        value={student.parent_email}
                        onChange={(e) => handleUpdateRow(i, 'parent_email', e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleRemoveRow(i)}
                        className="text-gray-400 hover:text-red-500 text-sm transition-colors"
                        title="Премахни"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button
        onClick={handleAddEmptyRow}
        className="text-indigo-600 hover:text-indigo-800 text-sm underline"
      >
        + Добави ред по ред
      </button>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 text-sm px-4 py-3"
        >
          ← Назад
        </button>
        <button
          onClick={handleNext}
          disabled={isPending}
          className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? 'Запазване...' : 'Напред →'}
        </button>
      </div>
    </div>
  )
}

// ─── Step 3: Send invites ──────────────────────────────────────────────────

function Step3({
  classId,
  students,
  onBack,
}: {
  classId: string
  students: ParsedStudent[]
  onBack: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSkipping, startSkipTransition] = useTransition()
  const [result, setResult] = useState<{ sent: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleSendInvites() {
    setError(null)
    startTransition(async () => {
      const res = await sendInvites(classId)
      if (res.error) {
        setError(res.error)
      } else {
        setResult({ sent: res.sent })
      }
    })
  }

  function handleSkip() {
    startSkipTransition(async () => {
      await completeSetup(classId)
      router.push(`/moderator/${classId}`)
      router.refresh()
    })
  }

  function handleDone() {
    router.push(`/moderator/${classId}`)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Изпратете покани</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {result ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            Изпратени са покани до {result.sent} родителя.
          </div>
          <button
            onClick={handleDone}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Готово →
          </button>
        </div>
      ) : (
        <>
          {students.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600">
                {students.length} {students.length === 1 ? 'дете' : 'деца'}
              </div>
              <ul className="divide-y divide-gray-100">
                {students.map((s, i) => (
                  <li key={i} className="flex justify-between items-center px-4 py-3 text-sm">
                    <span className="font-medium text-gray-800">
                      {s.first_name} {s.last_name}
                    </span>
                    <span className="text-gray-400">{s.parent_email}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Нямате добавени деца в момента.</p>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleSendInvites}
              disabled={isPending || isSkipping}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending ? 'Изпращане...' : 'Изпрати покани до всички'}
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                disabled={isPending || isSkipping}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Назад
              </button>
              <button
                onClick={handleSkip}
                disabled={isPending || isSkipping}
                className="text-gray-500 hover:text-gray-700 text-sm ml-auto"
              >
                {isSkipping ? 'Моля изчакайте...' : 'Пропусни — ще го направя по-късно'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Wizard shell ──────────────────────────────────────────────────────────

export default function SetupWizard({ classId }: Props) {
  const [step, setStep] = useState(1)
  const [addedStudents, setAddedStudents] = useState<ParsedStudent[]>([])

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Добре дошли в Един неразделен клас</h1>
          <p className="mt-1 text-sm text-gray-500">Нека настроим вашия клас в три стъпки.</p>
        </div>

        <ProgressIndicator step={step} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {step === 1 && (
            <Step1
              classId={classId}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2
              classId={classId}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              onStudentsAdded={setAddedStudents}
            />
          )}
          {step === 3 && (
            <Step3
              classId={classId}
              students={addedStudents}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </div>
    </main>
  )
}
