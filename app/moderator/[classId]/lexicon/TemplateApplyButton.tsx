'use client'

import { useTransition } from 'react'

interface Props {
  action: () => Promise<void>
  isActive: boolean
  isCustomized: boolean
  children: React.ReactNode
}

export default function TemplateApplyButton({ action, isActive, isCustomized, children }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (isActive) return // already applied, do nothing

    if (isCustomized) {
      const ok = window.confirm(
        'Ако приложиш нов шаблон, ще загубиш всички персонализирани промени — въпросник, наредба на блоковете, цветова палитра и фон.\n\nПродължаваш ли?'
      )
      if (!ok) return
    }

    startTransition(() => action())
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || isActive}
      className={`w-full text-left p-4 sm:p-6 flex items-start gap-4 sm:gap-5 transition-colors group ${
        isActive ? 'cursor-default' : 'hover:bg-gray-50 disabled:opacity-60'
      }`}
    >
      {children}
      {!isActive && (
        <span className={`material-symbols-outlined transition-colors mt-1 flex-shrink-0 ${
          isPending ? 'text-indigo-400 animate-spin' : 'text-gray-300 group-hover:text-indigo-500'
        }`}>
          {isPending ? 'progress_activity' : 'arrow_forward'}
        </span>
      )}
    </button>
  )
}
