import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Един неразделен клас',
  description: 'Дигитален спомен след края на учебната година',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  )
}
