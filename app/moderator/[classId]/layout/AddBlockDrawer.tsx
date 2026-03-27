'use client'

import type { BlockType } from '@/lib/templates/types'

const ALL_BLOCKS: Array<{ type: BlockType; label: string; icon: string; description: string }> = [
  { type: 'hero', label: 'Герой', icon: 'photo', description: 'Голяма заглавна снимка с надпис.' },
  { type: 'students_grid', label: 'Ученици', icon: 'people', description: 'Решетка с портрети на учениците.' },
  { type: 'question', label: 'Въпрос', icon: 'quiz', description: 'Отговорите на учениците на въпрос.' },
  { type: 'photo_gallery', label: 'Галерия', icon: 'photo_library', description: 'Колаж от снимки.' },
  { type: 'poll',       label: 'Анкета',     icon: 'bar_chart',    description: 'Резултати от класна анкета.' },
  { type: 'polls_grid', label: 'Победители', icon: 'emoji_events', description: 'Грид с победителите от всички анкети.' },
  { type: 'class_voice', label: 'Гласът на класа', icon: 'record_voice_over', description: 'Облак от думи на класа.' },
  { type: 'subjects_bar', label: 'Предмети (графика)', icon: 'bar_chart', description: 'Хоризонтална графика с топ 3 отговора.' },
  { type: 'events', label: 'Спомени', icon: 'photo_album', description: 'Снимки и бележки от събитията.' },
  { type: 'superhero', label: 'Супергерой', icon: 'bolt', description: 'AI-генерирано изображение на класа.' },
]

interface Props {
  onAdd: (type: BlockType) => void
  onClose: () => void
  existingTypes: BlockType[]
}

export default function AddBlockDrawer({ onAdd, onClose, existingTypes }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[70vh] overflow-y-auto max-w-screen-sm mx-auto">
        <div className="sticky top-0 bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Добави блок</h3>
            <p className="text-xs text-gray-400 mt-0.5">Избери тип блок за добавяне в лексикона</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 gap-2">
          {ALL_BLOCKS.map((b) => {
            const alreadyHas = existingTypes.includes(b.type)
            return (
              <button
                key={b.type}
                onClick={() => onAdd(b.type)}
                className="flex items-center gap-4 text-left p-4 rounded-2xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-none group-hover:bg-indigo-100 transition-colors">
                  <span className="material-symbols-outlined text-lg">{b.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-800">{b.label}</span>
                    {alreadyHas && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-full">
                        вече е добавен
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{b.description}</p>
                </div>
                <span className="material-symbols-outlined text-gray-200 group-hover:text-indigo-400 transition-colors">
                  add_circle
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
