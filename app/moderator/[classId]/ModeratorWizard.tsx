'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { revertClassToDraft } from './actions'

interface WizardProps {
  classId: string
  hasEvents: boolean
  hasLayout: boolean
  hasQuestionnaire: boolean
  hasStudents: boolean
  classStatus: string
}

interface Step {
  id: number
  label: string
  detail: string
  href: string
  cta: string
}

const STEPS: Step[] = [
  { id: 1, label: 'Създай клас',         detail: 'Клас, училище и учебна година',          href: '',              cta: 'Готово' },
  { id: 2, label: 'Добави спомени',       detail: 'Снимки и спомени от годината',           href: '/events',       cta: 'Добави спомени' },
  { id: 3, label: 'Избери шаблон',        detail: 'Визия и оформление на лексикона',        href: '/template',     cta: 'Избери шаблон' },
  { id: 4, label: 'Настрой въпросник',    detail: 'Въпросите, на които децата отговарят',   href: '/questions',    cta: 'Настрой въпросник' },
  { id: 5, label: 'Изпрати покани',       detail: 'Добави деца и изпрати линкове за попълване', href: '/students', cta: 'Добави деца' },
  { id: 6, label: 'Финализирай',          detail: 'Прегледай и одобри всички отговори',     href: '/finalize',     cta: 'Финализирай лексикона' },
  { id: 7, label: 'Публикувай',           detail: 'Плащане и разпращане на лексикона',      href: '/finalize',     cta: 'Към публикуване' },
]

function stepDone(step: number, props: WizardProps): boolean {
  switch (step) {
    case 1: return true
    case 2: return props.hasEvents
    case 3: return props.hasLayout
    case 4: return props.hasQuestionnaire
    case 5: return props.hasStudents
    case 6: return props.classStatus === 'unpublished' || props.classStatus === 'published'
    case 7: return props.classStatus === 'published'
    default: return false
  }
}

export default function ModeratorWizard(props: WizardProps) {
  const { classId } = props
  const [isPending, startTransition] = useTransition()

  const currentStep = STEPS.find(s => !stepDone(s.id, props)) ?? null
  const allDone = currentStep === null

  const completedCount = STEPS.filter(s => stepDone(s.id, props)).length

  function handleRevertToDraft() {
    startTransition(async () => {
      await revertClassToDraft(classId)
    })
  }

  return (
    <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm overflow-hidden mb-10">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-indigo-500 text-xl">route</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Напредък</p>
            <p className="text-sm font-bold text-gray-800">
              {allDone ? `Всички ${STEPS.length} стъпки завършени` : `Стъпка ${completedCount + 1} от ${STEPS.length} — ${currentStep?.label}`}
            </p>
          </div>
        </div>
        <span className="text-xs text-gray-400 font-semibold">
          {completedCount}/{STEPS.length} завършени
        </span>
      </div>

      {/* Steps strip — horizontally scrollable on mobile */}
      <div className="px-4 py-4 overflow-x-auto hide-scrollbar">
        <div className="flex items-start gap-0" style={{ minWidth: 480 }}>
          {STEPS.map((step, i) => {
            const done = stepDone(step.id, props)
            const isCurrent = currentStep?.id === step.id

            return (
              <div key={step.id} className="flex items-start flex-1">
                {/* Step */}
                <div className="flex flex-col items-center flex-1">
                  {/* Circle */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs transition-all ${
                    done
                      ? 'bg-emerald-100 text-emerald-600'
                      : isCurrent
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-4 ring-indigo-50'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {done
                      ? <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      : step.id
                    }
                  </div>

                  {/* Label */}
                  <p className={`mt-1.5 text-[10px] font-semibold text-center leading-tight px-0.5 ${
                    done ? 'text-emerald-600' : isCurrent ? 'text-indigo-700' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </div>

                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <div className={`h-[2px] flex-shrink-0 w-6 mt-4 ${
                    stepDone(step.id + 1, props) || stepDone(step.id, props)
                      ? 'bg-emerald-200'
                      : isCurrent
                        ? 'bg-indigo-200'
                        : 'bg-gray-100'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      {allDone ? (
        <div className="mx-4 mb-4 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-500 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <div>
              <p className="text-sm font-bold text-emerald-900">Лексиконът е публикуван!</p>
              <p className="text-xs text-emerald-700 mt-0.5">Родителите вече имат достъп до него.</p>
            </div>
          </div>
          <button
            onClick={handleRevertToDraft}
            disabled={isPending}
            className="self-start sm:self-auto flex items-center gap-2 border border-gray-200 bg-white text-gray-600 text-sm font-semibold px-4 py-2 rounded-xl hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">undo</span>
            {isPending ? 'Връщане...' : 'Върни в чернова'}
          </button>
        </div>
      ) : (
        <div className="mx-4 mb-4 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-0.5">Следваща стъпка</p>
            <p className="text-sm font-bold text-indigo-900">{currentStep?.label}</p>
            <p className="text-xs text-indigo-600 mt-0.5">{currentStep?.detail}</p>
          </div>
          {currentStep?.href && (
            <Link
              href={`/moderator/${classId}${currentStep.href}`}
              className="self-start sm:self-auto flex items-center gap-2 bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {currentStep.cta}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
