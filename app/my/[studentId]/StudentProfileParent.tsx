'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { submitAllDrafts } from './actions'
import MessagesSection from './MessagesSection'
import PhotoUpload from './PhotoUpload'
import ClassVoiceSection from './ClassVoiceSection'
import PollsSection from './PollsSection'
import MemoriesSection from './memories/MemoriesSection'

interface Question {
  id: string
  text: string
  order_index: number
  type: string
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
  questionnaireSubmitted: boolean
  personalQuestions: Question[]
  classQuestions: Question[]
  answers: Array<{ question_id: string; status: string }>
  classVoiceQuestions: Array<{ id: string; text: string; order_index: number; poll_options?: string[] | null; is_anonymous?: boolean }>
  classId: string
  studentId: string
  classmates: Array<{ id: string; first_name: string; last_name: string; photo_url: string | null }>
  sentMessages: Array<{ recipient_student_id: string; status: string; content: string }>
  polls: Array<{ id: string; question: string; order_index: number }>
  existingVotes: Record<string, string>
  existingSurveyAnswers: Record<string, string>
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

// ── Status helpers ────────────────────────────────────────────────────────────

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

function QuestionRow({ question, status, studentId }: { question: Question; status: string | undefined; studentId: string }) {
  return (
    <Link
      href={`/my/${studentId}/question/${question.id}`}
      className="flex items-center gap-3 bg-[#faf9f8] rounded-xl px-4 py-3.5 hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-all group"
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
        status === 'approved' ? 'bg-green-500' :
        (status === 'submitted' || status === 'draft') ? 'bg-yellow-400' :
        'bg-gray-300'
      }`} />
      <span className="flex-1 text-sm text-gray-700 group-hover:text-indigo-800 leading-snug">{question.text}</span>
      {status === 'approved' && (
        <span className="text-xs text-green-600 font-medium flex-shrink-0">Одобрен</span>
      )}
      {(status === 'submitted' || status === 'draft') && (
        <span className="text-xs text-yellow-600 font-medium flex-shrink-0">За преглед</span>
      )}
      {!status && (
        <span className="material-symbols-outlined text-gray-300 group-hover:text-indigo-400 text-base">arrow_forward</span>
      )}
    </Link>
  )
}

// ── Accordion section ─────────────────────────────────────────────────────────

function Section({
  id,
  icon,
  title,
  description,
  status,
  statusLabel,
  open,
  onToggle,
  children,
  accentColor = 'indigo',
}: {
  id: string
  icon: string
  title: string
  description: string
  status: SectionStatus
  statusLabel: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
  accentColor?: 'indigo' | 'amber' | 'violet' | 'teal'
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
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors[accentColor]}`}>
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm leading-tight">{title}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusChip status={status} label={statusLabel} />
          <span className={`material-symbols-outlined text-gray-400 text-base transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          <div className="px-5 py-3 bg-[#faf9f8] flex items-start gap-2">
            <span className="material-symbols-outlined text-sm text-gray-400 mt-0.5 flex-shrink-0">info</span>
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
          </div>
          <div className="px-5 py-5">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StudentProfileParent({
  student,
  questionnaireSubmitted,
  personalQuestions,
  classQuestions,
  classVoiceQuestions,
  answers,
  classId,
  studentId,
  classmates,
  sentMessages,
  polls,
  existingVotes,
  existingSurveyAnswers,
  moderatorName,
  deadline,
  events,
}: Props) {
  const answerMap = new Map(answers.map((a) => [a.question_id, a.status]))

  const superheroQuestions = classQuestions.filter(q => q.type === 'superhero')
  const betterTogetherQuestions = classQuestions.filter(q => q.type === 'better_together')
  const videoQuestions = classQuestions.filter(q => q.type === 'video')

  // ── Per-section status computation ─────────────────────────────────────────

  const photoStatus: SectionStatus = student.photo_url ? 'done' : 'todo'

  function questionsSectionStatus(questions: Question[]): SectionStatus {
    if (questions.length === 0) return 'done'
    const approved = questions.filter(q => answerMap.get(q.id) === 'approved').length
    const filled = questions.filter(q => ['submitted', 'draft'].includes(answerMap.get(q.id) ?? '')).length
    if (approved === questions.length) return 'done'
    if (approved + filled === questions.length) return 'done'
    if (filled > 0 || approved > 0) return 'partial'
    return 'todo'
  }

  function questionsSectionLabel(questions: Question[]): string {
    if (questions.length === 0) return 'Няма въпроси'
    const approved = questions.filter(q => answerMap.get(q.id) === 'approved').length
    const filled = questions.filter(q => ['submitted', 'draft'].includes(answerMap.get(q.id) ?? '')).length
    if (approved === questions.length) return 'Всички одобрени'
    if (approved + filled === questions.length) return 'Изпратено за одобрение'
    if (filled > 0) return `${approved + filled} / ${questions.length} изпратени`
    if (approved > 0) return `${approved} / ${questions.length} одобрени`
    return 'Не е започнато'
  }

  const [localSentCount, setLocalSentCount] = useState(0)
  const [messagesFinalized, setMessagesFinalized] = useState(false)
  const effectiveSentCount = sentMessages.length + localSentCount
  const messagesStatus: SectionStatus =
    messagesFinalized && effectiveSentCount > 0 ? 'done' :
    effectiveSentCount === 0 ? 'todo' :
    effectiveSentCount < classmates.length ? 'partial' : 'done'
  const messagesLabel = classmates.length === 0 ? 'Няма съученици' :
    messagesFinalized && effectiveSentCount > 0 ? 'Изпратено за одобрение' :
    effectiveSentCount === 0 ? 'Не е започнато' : `${effectiveSentCount} / ${classmates.length} послания`

  const voteCount = Object.keys(existingVotes).length
  const pollsStatus: SectionStatus = polls.length === 0 ? 'done' :
    voteCount === 0 ? 'todo' : voteCount < polls.length ? 'partial' : 'done'
  const pollsLabel = polls.length === 0 ? 'Няма анкети' :
    voteCount === 0 ? 'Не е гласувано' : `${voteCount} / ${polls.length} гласа`

  // ── Overall progress ────────────────────────────────────────────────────────

  const memoriesStatus: SectionStatus =
    events.length === 0 ? 'done' :
    events.every(e => e.myComment) ? 'done' :
    events.some(e => e.myComment) ? 'partial' : 'todo'

  const SECTION_IDS = [
    'photo',
    'personal',
    ...(polls.length > 0 ? ['polls'] : []),
    ...(betterTogetherQuestions.length > 0 ? ['better_together'] : []),
    ...(videoQuestions.length > 0 ? ['video'] : []),
    ...(classVoiceQuestions.length > 0 ? ['voice'] : []),
    ...(classmates.length > 0 ? ['messages'] : []),
    ...(superheroQuestions.length > 0 ? ['superhero'] : []),
    ...(events.length > 0 ? ['memories'] : []),
  ]

  // Voice is localStorage-only — read on mount
  const [voiceStatus, setVoiceStatus] = useState<SectionStatus>('todo')
  useEffect(() => {
    if (classVoiceQuestions.length === 0) { setVoiceStatus('done'); return }
    const allDone = classVoiceQuestions.every(q =>
      typeof window !== 'undefined' && !!localStorage.getItem(`class_voice_${classId}_${q.id}`)
    )
    setVoiceStatus(allDone ? 'done' : 'todo')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sectionStatusMap: Record<string, SectionStatus> = {
    photo: photoStatus,
    personal: questionsSectionStatus(personalQuestions),
    polls: pollsStatus,
    better_together: questionsSectionStatus(betterTogetherQuestions),
    video: questionsSectionStatus(videoQuestions),
    voice: voiceStatus,
    messages: messagesStatus,
    superhero: questionsSectionStatus(superheroQuestions),
    memories: memoriesStatus,
  }

  const doneCount = SECTION_IDS.filter(id => sectionStatusMap[id] === 'done').length
  const totalSections = SECTION_IDS.length
  const progressPercent = totalSections > 0 ? (doneCount / totalSections) * 100 : 0

  // ── Persist open section across sessions ────────────────────────────────────

  const STORAGE_KEY = `lexicon_open_section_${student.id}`

  const allApproved = answers.length > 0 && answers.every(a => a.status === 'approved')

  const [openSection, setOpenSection] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(questionnaireSubmitted)

  useEffect(() => {
    // Keep all sections collapsed when questionnaire is submitted or fully approved
    if (questionnaireSubmitted || allApproved) {
      setOpenSection(null)
      return
    }
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SECTION_IDS.includes(saved)) {
      setOpenSection(saved)
    } else {
      const first = SECTION_IDS.find(id => sectionStatusMap[id] !== 'done') ?? SECTION_IDS[0] ?? null
      setOpenSection(first)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggle(id: string) {
    const next = openSection === id ? null : id
    setOpenSection(next)
    if (next && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next)
    }
  }

  const hasDrafts = answers.some(a => a.status === 'draft')

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

      {/* ── Sticky top bar ───────────────────────────────────────────────── */}
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
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 font-medium">{doneCount}/{totalSections} секции</span>
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

        {/* Submitted / approved banner */}
        {allApproved ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-500 text-xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              celebration
            </span>
            <div>
              <p className="text-sm font-bold text-emerald-800 mb-0.5">Въпросникът е одобрен от модератора</p>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Благодарим ти, {student.first_name}! Ти помогна за създаването на незабравим спомен!
              </p>
            </div>
          </div>
        ) : submitted ? (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-orange-500 text-xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <div>
              <p className="text-sm font-bold text-orange-800 mb-0.5">Изпратено за одобрение</p>
              <p className="text-xs text-orange-700 leading-relaxed">
                Благодарим ти, {student.first_name}! {moderatorName ? `${moderatorName} ще прегледа отговорите.` : 'Модераторът ще прегледа отговорите.'}
                {deadlineFormatted ? ` Крайният срок е ${deadlineFormatted}.` : ''}
              </p>
            </div>
          </div>
        ) : null}

        {/* All done banner */}
        {progressPercent === 100 && !submitted && !allApproved && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-500 text-xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              celebration
            </span>
            <div>
              <p className="text-sm font-bold text-amber-800 mb-0.5">Профилът е готов!</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Профилът на {student.first_name} е напълно попълнен. Изпрати към модератор за преглед и одобрение.
              </p>
            </div>
          </div>
        )}

        {/* ── 1. Снимка ──────────────────────────────────────────────────── */}
        <Section
          id="photo"
          icon="photo_camera"
          title="Снимка на детето"
          description={`Снимката ще украси личната страница на ${student.first_name} в лексикона. Може да качите портретна снимка или любима снимка на детето.`}
          status={photoStatus}
          statusLabel={student.photo_url ? 'Качена' : 'Липсва'}
          open={openSection === 'photo'}
          onToggle={() => toggle('photo')}
          accentColor="indigo"
        >
          <div className="w-full">
            <PhotoUpload
              studentId={student.id}
              photoUrl={student.photo_url}
              firstName={student.first_name}
              wizardMode
            />
          </div>
        </Section>

        {/* ── 2. Лични въпроси ───────────────────────────────────────────── */}
        {personalQuestions.length > 0 && (
          <Section
            id="personal"
            icon="person"
            title="Лични въпроси"
            description={`Въпроси за ${student.first_name} — разкажете за неговите/нейните интереси, мечти и любими моменти. Отговорите ще бъдат на личната страница в лексикона.`}
            status={questionsSectionStatus(personalQuestions)}
            statusLabel={questionsSectionLabel(personalQuestions)}
            open={openSection === 'personal'}
            onToggle={() => toggle('personal')}
            accentColor="indigo"
          >
            <div className="space-y-2">
              {personalQuestions.map(q => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  status={answerMap.get(q.id)}
                  studentId={student.id}
                />
              ))}
            </div>
          </Section>
        )}

        {/* ── 3. Анкети ──────────────────────────────────────────────────── */}
        {polls.length > 0 && (
          <Section
            id="polls"
            icon="how_to_vote"
            title="Анкети на класа"
            description="Изберете кой съученик пасва най-добре на всяко описание. Резултатите са анонимни — никой не знае кой кого е избрал."
            status={pollsStatus}
            statusLabel={pollsLabel}
            open={openSection === 'polls'}
            onToggle={() => toggle('polls')}
            accentColor="violet"
          >
            <PollsSection
              polls={polls}
              classmates={classmates}
              voterStudentId={student.id}
              existingVotes={existingVotes}
              onFinalize={() => toggle('polls')}
            />
          </Section>
        )}

        {/* ── 4. Колективни въпроси (better_together) ────────────────────── */}
        {betterTogetherQuestions.length > 0 && (
          <Section
            id="better_together"
            icon="groups"
            title="По-добре заедно"
            description={`Въпроси за живота на ${student.first_name} в класа. Отговорите описват класа като цяло и ще се появят на страниците на всички деца.`}
            status={questionsSectionStatus(betterTogetherQuestions)}
            statusLabel={questionsSectionLabel(betterTogetherQuestions)}
            open={openSection === 'better_together'}
            onToggle={() => toggle('better_together')}
            accentColor="teal"
          >
            <div className="space-y-2">
              {betterTogetherQuestions.map(q => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  status={answerMap.get(q.id)}
                  studentId={student.id}
                />
              ))}
            </div>
          </Section>
        )}

        {/* ── 5. Видео въпроси ───────────────────────────────────────────── */}
        {videoQuestions.length > 0 && (
          <Section
            id="video"
            icon="videocam"
            title="Видео въпроси"
            description={`Тези въпроси изискват видеоотговор. Запишете кратко видео с ${student.first_name}, което ще бъде включено в лексикона.`}
            status={questionsSectionStatus(videoQuestions)}
            statusLabel={questionsSectionLabel(videoQuestions)}
            open={openSection === 'video'}
            onToggle={() => toggle('video')}
            accentColor="indigo"
          >
            <div className="space-y-2">
              {videoQuestions.map(q => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  status={answerMap.get(q.id)}
                  studentId={student.id}
                />
              ))}
            </div>
          </Section>
        )}

        {/* ── 6. Анонимен глас ───────────────────────────────────────────── */}
        {classVoiceQuestions.length > 0 && (
          <Section
            id="voice"
            icon="record_voice_over"
            title="Анонимен глас на класа"
            description="Споделете мисли и спомени за класа напълно анонимно. Никой — дори модераторът — не може да разбере кой какво е написал."
            status={voiceStatus}
            statusLabel={voiceStatus === 'done' ? 'Завършено' : 'Анонимно'}
            open={openSection === 'voice'}
            onToggle={() => toggle('voice')}
            accentColor="amber"
          >
            <ClassVoiceSection
              classId={classId}
              studentId={studentId}
              questions={classVoiceQuestions}
              initialAnswers={existingSurveyAnswers}
              onFinalize={() => {
                const allDone = classVoiceQuestions.every(q =>
                  typeof window !== 'undefined' && !!localStorage.getItem(`class_voice_${classId}_${q.id}`)
                )
                if (allDone) setVoiceStatus('done')
                toggle('voice')
              }}
            />
          </Section>
        )}

        {/* ── 6. Послания до съучениците ─────────────────────────────────── */}
        {classmates.length > 0 && (
          <Section
            id="messages"
            icon="favorite"
            title="Послания до съучениците"
            description={`Напишете лично пожелание от ${student.first_name} до останалите. Не е задължително да оставяте послание за всички в лексикона. Посланията ще се появят на личните им страници след одобрение от модератора.`}
            status={messagesStatus}
            statusLabel={messagesLabel}
            open={openSection === 'messages'}
            onToggle={() => toggle('messages')}
            accentColor="amber"
          >
            <MessagesSection
              authorStudentId={student.id}
              classmates={classmates}
              sentMessages={sentMessages}
              onMessageSent={() => setLocalSentCount(c => c + 1)}
              onFinalize={() => {
                if (effectiveSentCount > 0) setMessagesFinalized(true)
                toggle('messages')
              }}
            />
          </Section>
        )}

        {/* ── 7. Супергероят ─────────────────────────────────────────────── */}
        {superheroQuestions.length > 0 && (
          <Section
            id="superhero"
            icon="auto_awesome"
            title={`Супергероят на ${student.first_name}`}
            description={`Тези отговори помагат на учителя да създаде уникален супергеройски образ за ${student.first_name}. Разкажете за неговите/нейните специални сили и таланти.`}
            status={questionsSectionStatus(superheroQuestions)}
            statusLabel={questionsSectionLabel(superheroQuestions)}
            open={openSection === 'superhero'}
            onToggle={() => toggle('superhero')}
            accentColor="violet"
          >
            <div className="space-y-2">
              {superheroQuestions.map(q => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  status={answerMap.get(q.id)}
                  studentId={student.id}
                />
              ))}
            </div>
          </Section>
        )}

        {/* ── Нашите събития ─────────────────────────────────────────────── */}
        {events.length > 0 && (
          <Section
            id="memories"
            icon="photo_album"
            title="Нашите събития"
            description="Модераторът е добавил снимки от специални моменти на класа. Оставете кратък коментар към всяка снимка — той ще се покаже в лексикона."
            status={events.every(e => e.myComment) ? 'done' : events.some(e => e.myComment) ? 'partial' : 'todo'}
            statusLabel={
              events.every(e => e.myComment) ? 'Всички коментирани' :
              events.some(e => e.myComment) ? `${events.filter(e => e.myComment).length} / ${events.length} коментара` :
              'Без коментар'
            }
            open={openSection === 'memories'}
            onToggle={() => toggle('memories')}
            accentColor="teal"
          >
            <MemoriesSection studentId={student.id} events={events} onFinalize={() => toggle('memories')} />
          </Section>
        )}

        {/* Submit button */}
        <>
          {!submitted && doneCount < totalSections && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
              <span className="material-symbols-outlined text-amber-500 text-lg flex-shrink-0 mt-0.5">warning</span>
              <p className="text-sm text-amber-800">
                Въпросникът не е завършен — попълнени са <strong>{doneCount} от {totalSections}</strong> секции. Можете да изпратите и сега, но непопълнените секции няма да се покажат в лексикона.
              </p>
            </div>
          )}
          <button
            onClick={async () => {
              setSubmitting(true)
              await submitAllDrafts(student.id)
              setSubmitting(false)
              setSubmitted(true)
            }}
            disabled={submitting || submitted}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            {submitting ? 'Изпращане...' : submitted ? `Изпратено към ${moderatorName ?? 'модератора'}` : `Изпрати към ${moderatorName ?? 'модератора'}`}
          </button>
        </>

        <p className="text-xs text-gray-400 text-center pb-4">
          Прогресът се запазва автоматично. Можете да продължите по всяко време.
        </p>

      </div>
    </div>
  )
}
