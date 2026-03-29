'use client'

import { useState, useTransition, useEffect } from 'react'
import type { Block, BlockType, LayoutAssets, VoiceQuestionAsset } from '@/lib/templates/types'
import { createPoll, deletePoll, reorderPolls } from '../polls/actions'
import { createQuestion, updateQuestion } from '../questions/actions'

const BLOCK_META: Record<BlockType, { label: string; icon: string; color: string }> = {
  hero:          { label: 'Корица',           icon: 'add_a_photo',       color: 'bg-[#e2dfff] text-[#3632b7]' },
  students_grid: { label: 'Ученици',          icon: 'people',            color: 'bg-blue-50 text-blue-700'    },
  question:      { label: 'Въпрос',           icon: 'quiz',              color: 'bg-amber-50 text-amber-700'  },
  photo_gallery: { label: 'Галерия',          icon: 'photo_library',     color: 'bg-pink-50 text-pink-700'    },
  poll:          { label: 'Анкета',           icon: 'bar_chart',         color: 'bg-green-50 text-green-700'  },
  polls_grid:    { label: 'Победители',       icon: 'emoji_events',      color: 'bg-emerald-50 text-emerald-700' },
  class_voice:   { label: 'Анонимен въпрос — облак',   icon: 'record_voice_over', color: 'bg-purple-50 text-purple-700'},
  subjects_bar:  { label: 'Анонимен въпрос — графика', icon: 'bar_chart',         color: 'bg-teal-50 text-teal-700'   },
  events:        { label: 'Събития',          icon: 'photo_album',       color: 'bg-orange-50 text-orange-700'},
  superhero:     { label: 'Супергерой',       icon: 'bolt',              color: 'bg-yellow-50 text-yellow-700'},
}

interface Props {
  block: Block
  assets: LayoutAssets
  classId: string
  blockIndex: number
  blocksTotal: number
  onUpdate: (config: Record<string, unknown>) => void
  onRemove: () => void
  onMove: (dir: 'up' | 'down') => void
  onClose: () => void
}

export default function BlockConfigDrawer({ block, assets, classId, blockIndex, blocksTotal, onUpdate, onRemove, onMove, onClose }: Props) {
  const meta = BLOCK_META[block.type]
  const cfg = block.config as Record<string, unknown>

  function set(key: string, value: unknown) {
    onUpdate({ ...cfg, [key]: value })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/10 z-40" onClick={onClose} />
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[75vh] overflow-y-auto max-w-screen-sm mx-auto">

        {/* Handle + header */}
        <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-gray-50">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-none ${meta.color}`}>
              <span className="material-symbols-outlined text-base">{meta.icon}</span>
            </div>
            <p className="font-bold text-gray-800 flex-1">{meta.label}</p>

            {/* Reorder */}
            <button
              onClick={() => onMove('up')}
              disabled={blockIndex === 0}
              className="text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">arrow_upward</span>
            </button>
            <button
              onClick={() => onMove('down')}
              disabled={blockIndex === blocksTotal - 1}
              className="text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">arrow_downward</span>
            </button>

            {/* Delete */}
            <button onClick={onRemove} className="text-gray-300 hover:text-red-500 transition-colors ml-1">
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>

            {/* Close */}
            <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors ml-1">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Config body */}
        <div className="px-5 py-5 space-y-5 pb-safe-area-inset-bottom pb-8">
          <ConfigBody type={block.type} cfg={cfg} assets={assets} classId={classId} set={set} />
        </div>
      </div>
    </>
  )
}

// ── Config body ────────────────────────────────────────────────────────────

function ConfigBody({ type, cfg, assets, classId, set }: {
  type: BlockType
  cfg: Record<string, unknown>
  assets: LayoutAssets
  classId: string
  set: (key: string, value: unknown) => void
}) {
  switch (type) {

    case 'question':
      return (
        <div className="space-y-4">
          <AssetPicker
            label="Въпрос"
            value={(cfg.questionId as string) ?? ''}
            options={assets.questions}
            emptyLabel="Избери въпрос..."
            onChange={v => set('questionId', v || null)}
          />
          <SelectField
            label="Оформление на отговорите"
            value={(cfg.layout as string) ?? 'grid'}
            options={[
              { value: 'grid',    label: 'Решетка' },
              { value: 'list',    label: 'Списък' },
              { value: 'masonry', label: 'Масонри' },
            ]}
            onChange={v => set('layout', v)}
          />
        </div>
      )

    case 'poll':
      return (
        <AssetPicker
          label="Анкета"
          value={(cfg.pollId as string) ?? ''}
          options={assets.polls}
          emptyLabel="Избери анкета..."
          onChange={v => set('pollId', v || null)}
        />
      )

    case 'class_voice':
      return (
        <ClassVoiceConfig
          cfg={cfg}
          assets={{ ...assets, voiceQuestions: assets.voiceQuestions.filter(q => q.voice_display !== 'barchart') }}
          classId={classId}
          defaultDisplay="wordcloud"
          set={set}
        />
      )

    case 'subjects_bar':
      return (
        <ClassVoiceConfig
          cfg={cfg}
          assets={{ ...assets, voiceQuestions: assets.voiceQuestions.filter(q => q.voice_display === 'barchart') }}
          classId={classId}
          defaultDisplay="barchart"
          set={set}
        />
      )

    case 'photo_gallery':
      return (
        <div className="space-y-4">
          <AssetPicker
            label="Въпрос с медия отговори"
            value={(cfg.questionId as string) ?? ''}
            options={assets.questions}
            emptyLabel="Избери въпрос..."
            onChange={v => set('questionId', v || null)}
          />
          <SelectField
            label="Колони"
            value={String((cfg.columns as number) ?? 3)}
            options={[{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }]}
            onChange={v => set('columns', Number(v))}
          />
        </div>
      )

    case 'students_grid':
      return (
        <div className="space-y-4">
          <SelectField
            label="Колони"
            value={String((cfg.columns as number) ?? 4)}
            options={[{ value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }]}
            onChange={v => set('columns', Number(v))}
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={(cfg.showTeaser as boolean) ?? true}
              onChange={e => set('showTeaser', e.target.checked)}
              className="rounded w-4 h-4 accent-indigo-600"
            />
            <span className="text-sm text-gray-700">Покажи тийзър отговор</span>
          </label>
        </div>
      )

    case 'events':
      return (
        <div className="space-y-4">
          <SelectField
            label="Стил"
            value={(cfg.style as string) ?? 'polaroids'}
            options={[
              { value: 'polaroids',  label: 'Поляроиди' },
              { value: 'cards',      label: 'Карти' },
              { value: 'timeline',   label: 'Таймлайн' },
              { value: 'photo_grid', label: 'Фото грид' },
            ]}
            onChange={v => set('style', v)}
          />
          <label className="block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Брой събития</span>
            <input
              type="number" min={1} max={20}
              value={(cfg.limit as number) ?? 4}
              onChange={e => set('limit', Number(e.target.value))}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>
        </div>
      )

    case 'polls_grid':
      return <PollsGridConfig classId={classId} existingPolls={assets.polls} />

    default:
      return <p className="text-sm text-gray-400">Няма допълнителни настройки за този блок.</p>
  }
}

// ── Class voice: full question editor ─────────────────────────────────────

function ClassVoiceConfig({ cfg, assets, classId, defaultDisplay, set }: {
  cfg: Record<string, unknown>
  assets: LayoutAssets
  classId: string
  defaultDisplay: 'wordcloud' | 'barchart'
  set: (key: string, value: unknown) => void
}) {
  const selectedId = (cfg.questionId as string) ?? ''
  const [extraOptions, setExtraOptions] = useState<{ id: string; label: string }[]>([])
  const allOptions = [...assets.voiceQuestions, ...extraOptions]
  const selected = allOptions.find(q => q.id === selectedId) as VoiceQuestionAsset | undefined

  const [text,         setText]        = useState(selected?.label ?? '')
  const [description,  setDescription] = useState(selected?.description ?? '')
  const [maxLength,    setMaxLength]   = useState(selected?.max_length != null ? String(selected.max_length) : '')
  const [qType,        setQType]       = useState(selected?.type ?? 'class_voice')
  const [voiceDisplay, setVoiceDisplay] = useState<'wordcloud' | 'barchart'>(selected?.voice_display ?? defaultDisplay)
  const [isPending,    startTransition] = useTransition()
  const [saved,        setSaved]        = useState(false)

  // Create new question
  const [showCreate,  setShowCreate]  = useState(false)
  const [newText,     setNewText]     = useState('')
  const [creating,    startCreate]    = useTransition()

  useEffect(() => {
    if (selected) {
      setText(selected.label ?? '')
      setDescription(selected.description ?? '')
      setMaxLength(selected.max_length != null ? String(selected.max_length) : '')
      setQType(selected.type ?? 'class_voice')
      setVoiceDisplay(selected.voice_display ?? defaultDisplay)
      setSaved(false)
    }
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave() {
    if (!selectedId || !selected) return
    startTransition(async () => {
      const { error } = await updateQuestion(classId, selectedId, {
        text,
        description: description || null,
        type: qType as 'personal' | 'class_voice' | 'better_together' | 'superhero' | 'video',
        allows_text: true,
        allows_media: false,
        max_length: maxLength ? Number(maxLength) : null,
        order_index: selected.order_index ?? 0,
        voice_display: voiceDisplay,
      })
      if (!error) setSaved(true)
    })
  }

  function handleCreate() {
    const q = newText.trim()
    if (!q) return
    startCreate(async () => {
      const nextIndex = allOptions.length
      const { error } = await createQuestion(classId, {
        text: q,
        type: 'class_voice',
        allows_text: true,
        allows_media: false,
        max_length: null,
        order_index: nextIndex,
        voice_display: defaultDisplay,
      })
      if (!error) {
        // Re-fetch the newly created question id by fetching the questions list
        // Simplest approach: reload assets via router refresh. For now add optimistically with a temp id
        // and let the user pick it from dropdown after page reload.
        setNewText('')
        setShowCreate(false)
        // Trigger a soft-reload so the new question appears in the picker
        window.location.reload()
      }
    })
  }

  const TYPE_OPTIONS = [
    { value: 'personal',        label: 'Лично' },
    { value: 'class_voice',     label: 'Анонимен въпрос' },
    { value: 'better_together', label: 'Заедно сме по-добри' },
    { value: 'superhero',       label: 'Супергерой' },
    { value: 'video',           label: 'Видео' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <AssetPicker
          label="Анонимен въпрос"
          value={selectedId}
          options={allOptions}
          emptyLabel="Избери въпрос..."
          onChange={v => { set('questionId', v || null); setSaved(false) }}
        />
        <button
          onClick={() => setShowCreate(v => !v)}
          className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">{showCreate ? 'remove' : 'add'}</span>
          Създай нов въпрос
        </button>
        {showCreate && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Напиши въпроса..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newText.trim()}
              className="flex-none px-3 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              <span className="material-symbols-outlined text-base">check</span>
            </button>
          </div>
        )}
      </div>

      {selectedId && (
        <>
          <label className="block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Въпрос</span>
            <input
              type="text"
              value={text}
              onChange={e => { setText(e.target.value); setSaved(false) }}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Описание</span>
            <textarea
              value={description}
              onChange={e => { setDescription(e.target.value); setSaved(false) }}
              rows={2}
              placeholder="Незадължително"
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ограничение (знаци)</span>
            <input
              type="number"
              min={10} max={2000}
              value={maxLength}
              onChange={e => { setMaxLength(e.target.value); setSaved(false) }}
              placeholder="Без ограничение"
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>

          <SelectField
            label="Раздел"
            value={qType}
            options={TYPE_OPTIONS}
            onChange={v => { setQType(v); setSaved(false) }}
          />

          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Визуализация</span>
            <div className="grid grid-cols-2 gap-2">
              {([
                ['wordcloud', 'Облак думи', 'cloud'] as const,
                ['barchart',  'Стълбова',   'bar_chart'] as const,
              ]).map(([val, label, icon]) => (
                <button
                  key={val}
                  onClick={() => { setVoiceDisplay(val); setSaved(false) }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    voiceDisplay === val
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isPending || saved}
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
              saved
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isPending ? 'Запазване...' : saved ? 'Запазено ✓' : 'Запази въпроса'}
          </button>
        </>
      )}
    </div>
  )
}

// ── Polls grid: predefined suggestions ────────────────────────────────────

const POLL_SUGGESTIONS = [
  'Кой ще стане президент?',
  'Кой е бъдеща поп-звезда?',
  'Кой е винаги готов да помогне?',
  'Най-голям шегаджия в класа',
  'Бъдещ президент',
  'Най-добър спортист',
  'Душата на класа',
  'Най-усмихнат',
  'Най-мил/мила',
  'Бъдещ учен',
  'Най-голям мечтател',
  'Бъдеща поп звезда',
  'Най-добър приятел',
]

function PollsGridConfig({ classId, existingPolls }: {
  classId: string
  existingPolls: { id: string; label: string }[]
}) {
  // Ordered list of added polls (shown at top)
  const [added, setAdded] = useState<{ id: string; label: string }[]>(existingPolls)
  const addedIds = new Set(added.map(p => p.id))
  const addedLabels = new Set(added.map(p => p.label))

  const [isPending, startTransition] = useTransition()
  const [customText, setCustomText] = useState('')

  function handleRemove(id: string) {
    startTransition(async () => {
      const result = await deletePoll(classId, id)
      if (!result.error) setAdded(prev => prev.filter(p => p.id !== id))
    })
  }

  function handleAdd(question: string) {
    if (addedLabels.has(question)) return
    startTransition(async () => {
      const result = await createPoll(classId, question, added.length + 1)
      if (!result.error && result.id) {
        setAdded(prev => [...prev, { id: result.id!, label: question }])
      }
    })
  }

  function handleMove(index: number, dir: 'up' | 'down') {
    const next = [...added]
    const swap = dir === 'up' ? index - 1 : index + 1
    ;[next[index], next[swap]] = [next[swap], next[index]]
    setAdded(next)
    startTransition(async () => {
      await reorderPolls(classId, next.map(p => p.id))
    })
  }

  function handleAddCustom() {
    const q = customText.trim()
    if (!q) return
    handleAdd(q)
    setCustomText('')
  }

  return (
    <div className="space-y-4">
      {/* ── Added polls ── */}
      {added.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Избрани анкети</p>
          <div className="space-y-1.5">
            {added.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800"
              >
                <div className="flex flex-col gap-0.5 flex-none">
                  <button
                    onClick={() => handleMove(i, 'up')}
                    disabled={i === 0 || isPending}
                    className="text-emerald-400 hover:text-emerald-700 disabled:opacity-20 leading-none"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_upward</span>
                  </button>
                  <button
                    onClick={() => handleMove(i, 'down')}
                    disabled={i === added.length - 1 || isPending}
                    className="text-emerald-400 hover:text-emerald-700 disabled:opacity-20 leading-none"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_downward</span>
                  </button>
                </div>
                <span className="flex-1 leading-snug">{p.label}</span>
                <button
                  onClick={() => handleRemove(p.id)}
                  disabled={isPending}
                  className="flex-none text-emerald-400 hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Suggestions ── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Идеи за анкети</p>
        <div className="space-y-1.5">
          {POLL_SUGGESTIONS.filter(q => !addedLabels.has(q)).map(q => (
            <button
              key={q}
              onClick={() => handleAdd(q)}
              disabled={isPending}
              className="w-full flex items-center gap-3 text-left text-sm px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 transition-all disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-base flex-none text-gray-300">add_circle</span>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* ── Custom poll ── */}
      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Своя анкета</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
            placeholder="Напишете въпрос..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            onClick={handleAddCustom}
            disabled={isPending || !customText.trim()}
            className="flex-none px-3 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Field helpers ──────────────────────────────────────────────────────────

function AssetPicker({ label, value, options, emptyLabel, onChange }: {
  label: string; value: string
  options: { id: string; label: string }[]
  emptyLabel: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      {options.length === 0 ? (
        <p className="mt-2 text-xs text-gray-400 italic bg-gray-50 rounded-xl px-4 py-3">
          Няма налични елементи — добавете от съответния раздел в дашборда.
        </p>
      ) : (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">{emptyLabel}</option>
          {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      )}
    </label>
  )
}

function SelectField({ label, value, options, onChange }: {
  label: string; value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}
