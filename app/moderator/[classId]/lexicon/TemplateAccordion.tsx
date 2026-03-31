'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { applyTemplate } from '../template/actions'
import type { QuestionPreset } from '@/lib/templates/defaultSeed'

interface PresetItem {
  id: string
  label: string
  emoji: string
  description: string
  examples: string[]
}

interface Props {
  classId: string
  presets: PresetItem[]
  activePresetId: string | null
  isCustomized: boolean
}

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
      checked ? 'border-indigo-600' : 'border-gray-300'
    }`}>
      {checked && <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
    </span>
  )
}

function PresetCard({
  preset,
  isOpen,
  isActive,
  isCustomized,
  classId,
  onExpand,
}: {
  preset: PresetItem
  isOpen: boolean
  isActive: boolean
  isCustomized: boolean
  classId: string
  onExpand: () => void
}) {
  const [isPending, startTransition] = useTransition()

  function handleApply() {
    if (isActive && !isCustomized) return
    if (isCustomized) {
      const ok = window.confirm(
        'Ако приложиш нов шаблон, ще загубиш всички персонализирани промени — въпросник, наредба на блоковете, цветова палитра и фон.\n\nПродължаваш ли?'
      )
      if (!ok) return
    }
    startTransition(() => applyTemplate(classId, preset.id as QuestionPreset))
  }

  return (
    <div className={`bg-white border-2 rounded-2xl overflow-hidden transition-all ${
      isActive && !isCustomized ? 'border-indigo-500 shadow-md' : 'border-gray-200'
    }`}>
      {/* Header — always visible */}
      <button
        type="button"
        onClick={onExpand}
        className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <RadioDot checked={isActive && !isCustomized} />
        <span className="text-2xl leading-none">{preset.emoji}</span>
        <span className="font-bold text-gray-900 flex-1">{preset.label}</span>
        {isActive && !isCustomized && (
          <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Текущ</span>
        )}
        <span className={`material-symbols-outlined text-base text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-3">{preset.description}</p>
            <div className="flex flex-wrap gap-2">
              {preset.examples.map(ex => (
                <span key={ex} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{ex}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            {isActive && !isCustomized ? (
              <span className="text-xs text-gray-400">Приложен към твоя лексикон</span>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                disabled={isPending}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-base">{isPending ? 'progress_activity' : 'download'}</span>
                {isPending ? 'Зареждане...' : `Зареди ${preset.label}`}
              </button>
            )}
            <Link
              href={`/moderator/${classId}/preview`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              Прегледай
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TemplateAccordion({ classId, presets, activePresetId, isCustomized }: Props) {
  const initialOpen = activePresetId && !isCustomized ? activePresetId : ''
  const [expanded, setExpanded] = useState<string>(initialOpen)

  return (
    <div className="space-y-3">
      {presets.map(preset => (
        <PresetCard
          key={preset.id}
          preset={preset}
          isOpen={expanded === preset.id}
          isActive={activePresetId === preset.id}
          isCustomized={isCustomized}
          classId={classId}
          onExpand={() => setExpanded(preset.id)}
        />
      ))}
    </div>
  )
}
