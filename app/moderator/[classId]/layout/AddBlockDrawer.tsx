'use client'

import type { BlockType, PageId, LayoutAssets } from '@/lib/templates/types'

const ALL_BLOCKS: Array<{ type: BlockType; label: string; icon: string; description: string }> = [
  { type: 'hero', label: 'Герой', icon: 'photo', description: 'Голяма заглавна снимка с надпис.' },
  { type: 'students_grid', label: 'Ученици', icon: 'people', description: 'Решетка с портрети на учениците.' },
  { type: 'question', label: 'Въпрос', icon: 'quiz', description: 'Отговорите на учениците на въпрос.' },
  { type: 'photo_gallery', label: 'Галерия', icon: 'photo_library', description: 'Колаж от снимки.' },
  { type: 'poll',       label: 'Анкета',     icon: 'bar_chart',    description: 'Резултати от класна анкета.' },
  { type: 'polls_grid', label: 'Победители', icon: 'emoji_events', description: 'Грид с победителите от всички анкети.' },
  { type: 'class_voice', label: 'Анонимен въпрос (облак)', icon: 'record_voice_over', description: 'Облак от думи на класа.' },
  { type: 'subjects_bar', label: 'Анонимен въпрос (графика)', icon: 'bar_chart', description: 'Хоризонтална графика с топ 3 отговора.' },
  { type: 'events', label: 'Събития', icon: 'photo_album', description: 'Снимки и бележки от събитията.' },
  { type: 'superhero', label: 'Супергерой', icon: 'bolt', description: 'AI-генерирано изображение на класа.' },
]

const COVER_BLOCKS: Array<{ type: BlockType; label: string; icon: string; description: string }> = [
  { type: 'cover_photo',      label: 'Корична снимка',       icon: 'image',          description: 'Главна снимка на корицата.' },
  { type: 'cover_logo',       label: 'Лого',                  icon: 'school',         description: 'Лого на училището.' },
  { type: 'cover_class_name', label: 'Клас / Група',          icon: 'badge',          description: 'Името на класа или групата.' },
  { type: 'cover_year',       label: 'Учебна година',         icon: 'calendar_today', description: 'Учебна година.' },
  { type: 'cover_tagline',    label: 'Слоган',                icon: 'format_quote',   description: 'Кратък слоган или мото.' },
]

const SP_STATIC_BLOCKS: Array<{ type: BlockType; label: string; icon: string; description: string }> = [
  { type: 'sp_photo',         label: 'Снимка',    icon: 'portrait', description: 'Портретна снимка на участника.' },
  { type: 'sp_name',          label: 'Име',        icon: 'badge',    description: 'Трите имена и клас.' },
  { type: 'sp_accents',       label: 'Акценти',   icon: 'star',     description: 'Въпросите с оценка (звезди) на участника.' },
  { type: 'sp_peer_messages', label: 'Послания',   icon: 'mail',     description: 'Послания от съучениците.' },
]

const MEMORIES_BLOCKS: Array<{ type: BlockType; label: string; icon: string; description: string }> = [
  { type: 'mem_photos',   label: 'Снимки',    icon: 'photo_library', description: 'Решетка от снимки на събитието.' },
  { type: 'mem_note',     label: 'Бележка',   icon: 'notes',         description: 'Текстово описание на събитието.' },
  { type: 'mem_comments', label: 'Коментари', icon: 'chat',          description: 'Коментари от участниците.' },
]

const CLOSING_BLOCKS: Array<{ type: BlockType; label: string; icon: string; description: string }> = [
  { type: 'closing_logo',          label: 'Лого',                icon: 'school',        description: 'Лого на училището.' },
  { type: 'closing_title',         label: 'Заглавие',            icon: 'title',         description: 'Името на класа.' },
  { type: 'closing_year',          label: 'Учебна година',       icon: 'calendar_today',description: 'Учебна година.' },
  { type: 'closing_quote',         label: 'Цитат',               icon: 'format_quote',  description: 'Затварящ цитат или послание.' },
  { type: 'closing_student_count', label: 'Брой участници',      icon: 'people',        description: 'Автоматично брои участниците.' },
  { type: 'closing_colophon',      label: 'Колофон',             icon: 'copyright',     description: 'Авторски права и издател.' },
]

interface Props {
  pageId: PageId
  onAdd: (type: BlockType, config?: Record<string, unknown>) => void
  onClose: () => void
  existingTypes: BlockType[]
  assets?: LayoutAssets
}

function BlockRow({ icon, label, description, badge, onClick }: {
  icon: string; label: string; description: string; badge?: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 text-left p-4 rounded-2xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group w-full"
    >
      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-none group-hover:bg-indigo-100 transition-colors">
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-800">{label}</span>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{description}</p>
      </div>
      <span className="material-symbols-outlined text-gray-200 group-hover:text-indigo-400 transition-colors">
        add_circle
      </span>
    </button>
  )
}

export default function AddBlockDrawer({ pageId, onAdd, onClose, existingTypes, assets }: Props) {
  const visibleBlocks = pageId === 'cover' ? COVER_BLOCKS : pageId === 'closing' ? CLOSING_BLOCKS : pageId === 'memories' ? MEMORIES_BLOCKS : pageId !== 'student_page' ? ALL_BLOCKS : null

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
          {visibleBlocks ? (
            visibleBlocks.map((b) => {
              const alreadyHas = existingTypes.includes(b.type)
              return (
                <BlockRow
                  key={b.type}
                  icon={b.icon}
                  label={b.label}
                  description={b.description}
                  badge={alreadyHas ? 'вече е добавен' : undefined}
                  onClick={() => onAdd(b.type)}
                />
              )
            })
          ) : (
            /* Student page: static + pickers */
            <>
              {SP_STATIC_BLOCKS.map((b) => {
                const alreadyHas = existingTypes.includes(b.type)
                return (
                  <BlockRow
                    key={b.type}
                    icon={b.icon}
                    label={b.label}
                    description={b.description}
                    badge={alreadyHas ? 'вече е добавен' : undefined}
                    onClick={() => onAdd(b.type)}
                  />
                )
              })}

              {/* Questions */}
              {assets && assets.questions.length > 0 && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-3 px-1">Въпроси</p>
                  {assets.questions.map((q) => (
                    <BlockRow
                      key={q.id}
                      icon="quiz"
                      label={q.label}
                      description="Личен въпрос от участника"
                      onClick={() => onAdd('sp_question', { questionId: q.id })}
                    />
                  ))}
                </>
              )}

              {/* Events */}
              {assets && assets.events.length > 0 && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-3 px-1">Събития</p>
                  {assets.events.map((e) => (
                    <BlockRow
                      key={e.id}
                      icon="photo_album"
                      label={e.label}
                      description="Снимка и бележка от събитие"
                      onClick={() => onAdd('sp_event', { eventId: e.id })}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
