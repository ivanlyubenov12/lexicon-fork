export interface BgPatternOption {
  id: string
  name: string
  description: string
  /** Tailwind classes for the preview swatch */
  previewClass: string
}

export const BG_PATTERN_OPTIONS: BgPatternOption[] = [
  {
    id: 'school',
    name: 'Ученически пособия',
    description: 'Моливи, линии, триъгълници — за начален курс',
    previewClass: 'bg-gradient-to-br from-indigo-100 to-blue-50',
  },
  {
    id: 'kindergarten',
    name: 'Детска градина',
    description: 'Мечета, коли, слънца и балони — за малки деца',
    previewClass: 'bg-gradient-to-br from-orange-100 to-yellow-50',
  },
  {
    id: 'teens',
    name: 'Горен курс',
    description: 'Формули, лаптоп, шапка и баскетбол — за ученици 5–12 клас',
    previewClass: 'bg-gradient-to-br from-violet-100 to-slate-50',
  },
  {
    id: 'none',
    name: 'Без украса',
    description: 'Чист фон — минималистичен и четим',
    previewClass: 'bg-white border border-gray-200',
  },
]

export function getBgPatternOption(id: string | null | undefined): BgPatternOption {
  return BG_PATTERN_OPTIONS.find(o => o.id === id) ?? BG_PATTERN_OPTIONS[0]
}
