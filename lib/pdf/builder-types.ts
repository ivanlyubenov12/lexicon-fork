export interface PDFTheme {
  accentColor: string  // default '#3632b7'
  coverBg: string      // default '#12082e'
}

export const DEFAULT_THEME: PDFTheme = {
  accentColor: '#3632b7',
  coverBg: '#12082e',
}

export const THEME_PRESETS: Array<{ label: string; theme: PDFTheme }> = [
  { label: 'Индиго', theme: { accentColor: '#3632b7', coverBg: '#12082e' } },
  { label: 'Мидъл',  theme: { accentColor: '#1d4ed8', coverBg: '#0f172a' } },
  { label: 'Тийл',   theme: { accentColor: '#0f766e', coverBg: '#042f2e' } },
  { label: 'Рубин',  theme: { accentColor: '#be123c', coverBg: '#1c0b0e' } },
  { label: 'Злато',  theme: { accentColor: '#a16207', coverBg: '#1c1204' } },
]

export interface CoverOptions {
  showLogo: boolean
  showQuote: boolean
}

export interface OverviewOptions {
  showVoice: boolean
  showPolls: boolean
  showEvents: boolean
}

export interface StudentOptions {
  showPhoto: boolean
  showQRCodes: boolean
  showEventComments: boolean
  showMessages: boolean
}

export interface MemoriesOptions {
  showDate: boolean
  showNote: boolean
  showPhotos: boolean
  showComments: boolean
}

export type PageOptions = CoverOptions | OverviewOptions | StudentOptions | MemoriesOptions | Record<string, never>

export const DEFAULT_OPTIONS: Record<string, PageOptions> = {
  cover:         { showLogo: true, showQuote: true } as CoverOptions,
  overview:      { showVoice: true, showPolls: true, showEvents: true } as OverviewOptions,
  students_grid: {},
  student:       { showPhoto: true, showQRCodes: true, showEventComments: true, showMessages: true } as StudentOptions,
  polls:         {},
  memories:      { showDate: true, showNote: true, showPhotos: true, showComments: true } as MemoriesOptions,
  closing:       {},
}
