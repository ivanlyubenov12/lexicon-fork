export interface PdfBgOption {
  id: string
  name: string
  description: string
  /** Tailwind gradient classes for the UI preview swatch */
  previewGradient: string
  /** Image URL for the actual PDF background (null = plain white) */
  imageUrl: string | null
}

export const PDF_BG_OPTIONS: PdfBgOption[] = [
  {
    id: 'none',
    name: 'Без украса',
    description: 'Чист бял фон — класически и четим',
    previewGradient: 'from-gray-50 to-gray-100',
    imageUrl: null,
  },
  {
    id: 'school_supplies',
    name: 'Ученически пособия',
    description: 'Моливи, тетрадки и линии — подходящо за начален курс',
    previewGradient: 'from-indigo-100 to-blue-100',
    imageUrl: null, // TODO: добави URL на изображение
  },
  {
    id: 'kindergarten',
    name: 'Детска градина',
    description: 'Цветни играчки и балони — весело и топло',
    previewGradient: 'from-orange-100 to-yellow-100',
    imageUrl: null, // TODO: добави URL на изображение
  },
  {
    id: 'stars',
    name: 'Звезди и мечти',
    description: 'Нежни звезди и блясък — вдъхновяващо за горен курс',
    previewGradient: 'from-violet-100 to-purple-100',
    imageUrl: null, // TODO: добави URL на изображение
  },
  {
    id: 'nature',
    name: 'Природа',
    description: 'Листа, цветя и зеленина — свежо и успокояващо',
    previewGradient: 'from-green-100 to-emerald-100',
    imageUrl: null, // TODO: добави URL на изображение
  },
]

export function getPdfBgOption(id: string | null | undefined): PdfBgOption {
  return PDF_BG_OPTIONS.find(o => o.id === id) ?? PDF_BG_OPTIONS[0]
}
