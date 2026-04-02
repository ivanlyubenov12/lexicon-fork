'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { submitAllDrafts } from './actions'
import MessagesSection from './MessagesSection'
import PhotoUpload from './PhotoUpload'
import MemoriesSection from './memories/MemoriesSection'
import { buildSeq, seqUrl, type SeqItem } from './sequence'

interface Question {
  id: string
  text: string
  order_index: number
  type: string
  allows_text: boolean
  allows_media: boolean
  poll_options?: string[] | null
  is_anonymous?: boolean | null
}

interface Props {
  student: {
    id: string
    first_name: string
    last_name: string
    photo_url: string | null
  }
  questionnaireSubmitted: boolean
  personalQuestions: Question[]
  classQuestions: Question[]
  classVoiceQuestions: Array<{ id: string; text: string; type: string; order_index: number; poll_options?: string[] | null; is_anonymous?: boolean | null }>
  answers: Array<{ question_id: string; status: string }>
  classId: string
  studentId: string
  classmates: Array<{ id: string; first_name: string; last_name: string; photo_url: string | null }>
  sentMessages: Array<{ recipient_student_id: string; status: string; content: string }>
  polls: Array<{ id: string; question: string; order_index: number }>
  existingVotes: Record<string, string>
  existingVoiceAnswers: Record<string, string>
  moderatorName: string | null
  deadline: string | null
  events: Array<{
    id: string
    title: string
    event_date: string | null
    photos: string[]
    myComment: { id: string; comment_text: string; created_at: string } | null
  }>
}

type SectionStatus = 'done' | 'partial' | 'pending' | 'todo'

function StatusChip({ status, label }: { status: SectionStatus; label: string }) {
  const styles: Record<SectionStatus, string> = {
    done: 'bg-green-50 text-green-700 border-green-200',
    partial: 'bg-amber-50 text-amber-700 border-amber-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    todo: 'bg-gray-50 text-gray-400 border-gray-200',
  }
  const dots: Record<SectionStatus, string> = {
    done: 'bg-green-500',
    partial: 'bg-amber-500',
    pending: 'bg-yellow-400',
    todo: 'bg-gray-300',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {label}
    </span>
  )
}

function Section({
  icon, title, description, status, statusLabel, open, onToggle, children, accentColor = 'indigo',
}: {
  icon: string; title: string; description: string; status: SectionStatus; statusLabel: string
  open: boolean; onToggle: () => void; children: React.ReactNode; accentColor?: 'indigo' | 'amber' | 'violet' | 'teal'
}) {
  const iconColors: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-600',
    amber: 'bg-amber-100 text-amber-700',
    violet: 'bg-violet-100 text-violet-600',
    teal: 'bg-teal-100 text-teal-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors[accentColor]}`}>
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm leading-tight">{title}</p>
          <div className="mt-1.5">
            <StatusChip status={status} label={statusLabel} />
          </div>
        </div>
        <span className={`material-symbols-outlined text-gray-400 text-base transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      {open && (
        <div className="border-t border-gray-100">
          <div className="px-5 py-3 bg-[#faf9f8] flex items-start gap-2">
            <span className="material-symbols-outlined text-sm text-gray-400 mt-0.5 flex-shrink-0">info</span>
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
          </div>
          <div className="px-5 py-5">{children}</div>
        </div>
      )}
    </div>
  )
}

// ── Question list row ──────────────────────────────────────────────────────────

const KIND_ICON: Record<string, string> = {
  personal: 'article', superhero: 'auto_awesome', better_together: 'groups',
  video: 'videocam', photo: 'add_photo_alternate', survey: 'poll', poll: 'how_to_vote',
}

function QuestionListRow({
  num, item, answered, pendingReview, isDraft, studentId,
}: {
  num: number
  item: SeqItem & { questionType?: string }
  answered: boolean
  pendingReview?: boolean
  isDraft?: boolean
  studentId: string
}) {
  const url = seqUrl(item, studentId)
  const icon = KIND_ICON[item.questionType ?? item.kind] ?? 'help_outline'

  const dotColor = answered
    ? pendingReview ? 'bg-yellow-400' : isDraft ? 'bg-gray-300' : 'bg-green-500'
    : 'bg-gray-200 group-hover:bg-indigo-300'

  return (
    <Link
      href={url}
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-indigo-50 transition-colors group"
    >
      <span className="text-xs font-bold text-gray-300 w-5 text-center flex-shrink-0">{num}</span>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
      <span className="material-symbols-outlined text-sm text-gray-300 group-hover:text-indigo-400 flex-shrink-0">{icon}</span>
      <span className="flex-1 text-sm text-gray-700 group-hover:text-indigo-800 leading-snug truncate">{item.text}</span>
      {answered && pendingReview && (
        <span className="text-xs text-yellow-600 font-medium flex-shrink-0">За преглед</span>
      )}
      {answered && isDraft && !pendingReview && (
        <span className="text-xs text-gray-400 font-medium flex-shrink-0">Чернова</span>
      )}
      {answered && !pendingReview && !isDraft && (
        <span className="text-xs text-green-600 font-medium flex-shrink-0">✓</span>
      )}
      {!answered && (
        <span className="material-symbols-outlined text-gray-300 group-hover:text-indigo-400 text-base">arrow_forward</span>
      )}
    </Link>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function StudentProfileParent({
  student, questionnaireSubmitted, personalQuestions, classQuestions, classVoiceQuestions,
  answers, classId, studentId, classmates, sentMessages, polls,
  existingVotes, existingVoiceAnswers, moderatorName, deadline, events,
}: Props) {
  const answerMap = new Map(answers.map(a => [a.question_id, a.status]))

  // ── Build global sequence ──────────────────────────────────────────────────
  const allQRaw = [
    ...personalQuestions,
    ...classQuestions,
    ...classVoiceQuestions.map(q => ({ ...q, allows_text: true, allows_media: false })),
  ].sort((a, b) => a.order_index - b.order_index)

  const seqItems: Array<SeqItem & { questionType: string }> = buildSeq(
    allQRaw.map(q => ({ id: q.id, text: q.text, type: q.type, order_index: q.order_index, is_anonymous: q.is_anonymous })),
    polls.map(p => ({ id: p.id, question: p.question, order_index: p.order_index })),
  ).map((item, _, arr) => {
    const raw = allQRaw.find(q => q.id === item.id)
    return { ...item, questionType: raw?.type ?? item.kind }
  })

  const totalQuestions = seqItems.length

  // ── Answered counts ────────────────────────────────────────────────────────
  function isAnswered(item: SeqItem): boolean {
    if (item.kind === 'question') {
      return ['draft', 'submitted', 'approved'].includes(answerMap.get(item.id) ?? '')
    }
    if (item.kind === 'voice') return !!existingVoiceAnswers[item.id]
    if (item.kind === 'poll') return !!existingVotes[item.id]
    return false
  }

  const answeredCount = seqItems.filter(isAnswered).length
  const firstUnansweredUrl = seqItems.find(item => !isAnswered(item))
    ? seqUrl(seqItems.find(item => !isAnswered(item))!, studentId)
    : null

  const progressPct = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0
  const allQuestionsAnswered = answeredCount >= totalQuestions

  // ── Questionnaire section status ──────────────────────────────────────────
  const hasPending = seqItems.some(item => item.kind === 'question' && answerMap.get(item.id) === 'submitted')
  const questionnaireStatus: SectionStatus =
    totalQuestions === 0 ? 'done' :
    allQuestionsAnswered ? (hasPending ? 'pending' : 'done') :
    answeredCount > 0 ? 'partial' : 'todo'
  const questionnaireLabel =
    totalQuestions === 0 ? 'Няма въпроси' :
    allQuestionsAnswered && hasPending ? 'За преглед от модератора' :
    allQuestionsAnswered ? 'Всички попълнени' :
    answeredCount > 0 ? `${answeredCount} / ${totalQuestions} въпроса` : 'Не е започнат'

  // ── Optional sections status ───────────────────────────────────────────────
  const photoStatus: SectionStatus = student.photo_url ? 'done' : 'todo'
  const sentCount = sentMessages.length
  const messagesStatus: SectionStatus =
    sentCount === 0 ? 'todo' :
    sentCount < classmates.length ? 'partial' : 'done'
  const messagesLabel = classmates.length === 0 ? 'Няма съученици' :
    sentCount === 0 ? 'Не е започнато' : `${sentCount} / ${classmates.length} послания`
  const memoriesStatus: SectionStatus =
    events.length === 0 ? 'done' :
    events.every(e => e.myComment) ? 'done' :
    events.some(e => e.myComment) ? 'partial' : 'todo'

  // ── Sections open state (photo / messages / memories) ─────────────────────
  const [openSection, setOpenSection] = useState<string | null>(null)
  function toggle(id: string) {
    setOpenSection(s => s === id ? null : id)
  }

  // ── Finalize logic ─────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(questionnaireSubmitted)
  const [showDialog, setShowDialog] = useState(false)

  type MissingItem = { key: string; label: string; url: string }

  function getMissingOptional(): MissingItem[] {
    const missing: MissingItem[] = []
    if (!student.photo_url) {
      missing.push({ key: 'photo', label: 'Снимка', url: '' }) // opens section
    }
    if (events.length > 0 && events.some(e => !e.myComment)) {
      const count = events.filter(e => !e.myComment).length
      missing.push({ key: 'memories', label: `Коментари към ${count} ${count === 1 ? 'спомен' : 'спомена'}`, url: '' })
    }
    if (classmates.length > 0 && sentCount === 0) {
      missing.push({ key: 'messages', label: 'Послания до съученици', url: '' })
    }
    return missing
  }

  function handleFinalizeClick() {
    const missing = getMissingOptional()
    if (missing.length > 0) {
      setShowDialog(true)
    } else {
      doFinalize()
    }
  }

  async function doFinalize() {
    setSubmitting(true)
    setShowDialog(false)
    await submitAllDrafts(student.id)
    setSubmitting(false)
    setSubmitted(true)
  }

  const allApproved = answers.length > 0 && answers.every(a => a.status === 'approved')
  const deadlineFormatted = deadline
    ? new Date(deadline).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-[#f4f3f2]" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* ── Sticky top bar ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          {student.photo_url ? (
            <img src={student.photo_url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-indigo-100" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
              {student.first_name[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 leading-tight truncate">
              {student.first_name} {student.last_name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[140px]">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 font-medium">{answeredCount}/{totalQuestions} въпроса</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/my/${student.id}/preview`}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              <span className="hidden sm:inline">Преглед</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="hidden sm:inline">Изход</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-3">

        {/* ── Deadline banner ─────────────────────────────────────────────── */}
        {deadlineFormatted && !submitted && !allApproved && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
            <span className="material-symbols-outlined text-amber-500 text-lg flex-shrink-0">event</span>
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Краен срок за попълване:</span> {deadlineFormatted}
            </p>
          </div>
        )}

        {/* ── Banners ─────────────────────────────────────────────────────── */}
        {allApproved ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-500 text-xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
            <div>
              <p className="text-sm font-bold text-emerald-800 mb-0.5">Въпросникът е одобрен от модератора</p>
              <p className="text-xs text-emerald-700 leading-relaxed">Благодарим ти, {student.first_name}! Ти помогна за създаването на незабравим спомен!</p>
            </div>
          </div>
        ) : submitted ? (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-orange-500 text-xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <div>
              <p className="text-sm font-bold text-orange-800 mb-0.5">Изпратено за одобрение</p>
              <p className="text-xs text-orange-700 leading-relaxed">
                Благодарим ти, {student.first_name}! {moderatorName ? `${moderatorName} ще прегледа отговорите.` : 'Модераторът ще прегледа отговорите.'}
                {deadlineFormatted ? ` Крайният срок е ${deadlineFormatted}.` : ''}
              </p>
            </div>
          </div>
        ) : null}

        {/* ── Continue card ────────────────────────────────────────────────── */}
        {!submitted && !allApproved && totalQuestions > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">
                {allQuestionsAnswered ? 'Всички въпроси са попълнени!' : `${totalQuestions - answeredCount} ${totalQuestions - answeredCount === 1 ? 'въпрос остава' : 'въпроса остават'}`}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{answeredCount} от {totalQuestions} въпроса попълнени</p>
            </div>
            {!allQuestionsAnswered && firstUnansweredUrl && (
              <Link
                href={firstUnansweredUrl}
                className="flex-shrink-0 bg-indigo-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5"
              >
                {answeredCount === 0 ? 'Започни' : 'Продължи'}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            )}
          </div>
        )}

        {/* ── Photo ───────────────────────────────────────────────────────── */}
        <Section
          icon="photo_camera"
          title="Снимка"
          description="Снимката ще украси личната страница в лексикона. Може да направите снимка, или да изберете от галерията си."
          status={photoStatus}
          statusLabel={student.photo_url ? 'Качена' : 'Липсва'}
          open={openSection === 'photo'}
          onToggle={() => toggle('photo')}
          accentColor="indigo"
        >
          <PhotoUpload
            studentId={student.id}
            photoUrl={student.photo_url}
            firstName={student.first_name}
            wizardMode
          />
        </Section>

        {/* ── Questionnaire section ────────────────────────────────────────── */}
        {seqItems.length > 0 && (
          <Section
            icon="quiz"
            title="Въпросник"
            description="Отговорете на въпросите по-долу. Прогресът се запазва автоматично — може да продължите по всяко време."
            status={questionnaireStatus}
            statusLabel={questionnaireLabel}
            open={openSection === 'questionnaire'}
            onToggle={() => toggle('questionnaire')}
            accentColor="indigo"
          >
            <div className="-mx-5 -my-5 divide-y divide-gray-50">
              {seqItems.map((item, idx) => {
                const answered = isAnswered(item)
                const pendingReview = item.kind === 'question' &&
                  answerMap.get(item.id) === 'submitted'
                const isDraft = item.kind === 'question' &&
                  answerMap.get(item.id) === 'draft'
                return (
                  <QuestionListRow
                    key={item.id}
                    num={idx + 1}
                    item={item}
                    answered={answered}
                    pendingReview={pendingReview}
                    isDraft={isDraft}
                    studentId={studentId}
                  />
                )
              })}
            </div>
          </Section>
        )}

        {/* ── Послания ────────────────────────────────────────────────────── */}
        {classmates.length > 0 && (
          <Section
            icon="favorite"
            title="Послания към другите"
            description={`Напишете лично пожелание от ${student.first_name} до останалите. Не е задължително да оставяте послание за всички. Посланията ще се появят на личните им страници след одобрение от модератора.`}
            status={messagesStatus}
            statusLabel={messagesLabel}
            open={openSection === 'messages'}
            onToggle={() => toggle('messages')}
            accentColor="amber"
          >
            <MessagesSection
              studentId={student.id}
              classmates={classmates}
              sentMessages={sentMessages}
            />
          </Section>
        )}

        {/* ── Спомени ─────────────────────────────────────────────────────── */}
        {events.length > 0 && (
          <Section
            icon="photo_album"
            title="Нашите събития"
            description="Модераторът е добавил снимки от специални моменти на класа. Оставете кратък коментар към всяка снимка — той ще се покаже в лексикона."
            status={memoriesStatus}
            statusLabel={
              events.every(e => e.myComment) ? 'Всички коментирани' :
              events.some(e => e.myComment) ? `${events.filter(e => e.myComment).length} / ${events.length} коментара` :
              'Без коментар'
            }
            open={openSection === 'memories'}
            onToggle={() => toggle('memories')}
            accentColor="teal"
          >
            <MemoriesSection studentId={student.id} events={events} />
          </Section>
        )}

        {/* ── Finalize ────────────────────────────────────────────────────── */}
        {!submitted && !allApproved && (
          <button
            onClick={handleFinalizeClick}
            disabled={submitting || !allQuestionsAnswered}
            title={!allQuestionsAnswered ? `Трябва да отговорите на всички въпроси (${totalQuestions - answeredCount} остават)` : undefined}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            {submitting
              ? 'Изпращане...'
              : !allQuestionsAnswered
                ? `Попълни всички въпроси (${totalQuestions - answeredCount} остават)`
                : `Финализирай и изпрати към ${moderatorName ?? 'модератора'}`
            }
          </button>
        )}

        <p className="text-xs text-gray-400 text-center pb-4">
          Прогресът се запазва автоматично. Можете да продължите по всяко време.
        </p>

      </div>

      {/* ── Warning dialog ─────────────────────────────────────────────────── */}
      {showDialog && (() => {
        const missing = getMissingOptional()
        return (
          <>
            <div className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm" onClick={() => setShowDialog(false)} />
            <div className="fixed inset-x-0 bottom-0 z-[51] bg-white rounded-t-3xl shadow-2xl p-6 max-w-sm mx-auto">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-2xl mx-auto mb-4">
                <span className="material-symbols-outlined text-amber-600 text-xl">warning</span>
              </div>
              <h3 className="font-bold text-gray-900 text-center mb-1">Не си попълнил всичко</h3>
              <p className="text-sm text-gray-500 text-center mb-4">Следните неща липсват:</p>
              <ul className="space-y-2 mb-6">
                {missing.map(m => (
                  <li key={m.key} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    {m.label}
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDialog(false)}
                  className="py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Ще ги попълня
                </button>
                <button
                  onClick={doFinalize}
                  disabled={submitting}
                  className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Изпращане...' : 'Пропусни и финализирай'}
                </button>
              </div>
            </div>
          </>
        )
      })()}

    </div>
  )
}
