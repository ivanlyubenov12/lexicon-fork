'use client'

import { useEffect, useRef, useState } from 'react'
import type { PDFData } from '@/lib/pdf/types'
import type { Section } from './PdfBuilderClient'

interface Props {
  section: Section
  pdfData: PDFData
}

// Dynamically load everything react-pdf related to avoid webpack ESM errors.
// We imperatively import the modules inside useEffect (browser-only).
export default function PdfPreview({ section, pdfData }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    setError(null)

    let cancelled = false

    async function render() {
      try {
        const [
          { Document, PDFViewer },
          {
            CoverPage,
            ClassOverviewPage,
            StudentsGridPage,
            StudentPage,
            PollsPage,
            MemoriesPage,
            ClosingPage,
          },
          React,
          ReactDOM,
        ] = await Promise.all([
          import('@react-pdf/renderer'),
          import('@/lib/pdf/LexiconPDF'),
          import('react'),
          import('react-dom/client'),
        ])

        if (cancelled) return

        let page: React.ReactElement | null = null

        switch (section.type) {
          case 'cover':
            page = React.createElement(CoverPage, { data: pdfData })
            break
          case 'overview':
            page = React.createElement(ClassOverviewPage, { data: pdfData })
            break
          case 'students_grid':
            page = React.createElement(StudentsGridPage, {
              students: pdfData.students,
              classInfo: pdfData.classInfo,
              isFirst: true,
              totalCount: pdfData.students.length,
              memberLabel: pdfData.memberLabel,
              preset: pdfData.preset,
              bgPng: null,
            })
            break
          case 'student': {
            const student = pdfData.students.find(s => s.id === section.studentId)
            if (student) {
              page = React.createElement(StudentPage, {
                student,
                classInfo: pdfData.classInfo,
                bgPng: null,
              })
            }
            break
          }
          case 'polls':
            page = React.createElement(PollsPage, {
              polls: pdfData.polls,
              classInfo: pdfData.classInfo,
              bgPng: null,
            })
            break
          case 'memories': {
            const event = pdfData.events.find(e => e.id === section.eventId)
            if (event) {
              page = React.createElement(MemoriesPage, {
                events: [event],
                classInfo: pdfData.classInfo,
                bgPng: null,
              })
            }
            break
          }
          case 'closing':
            page = React.createElement(ClosingPage, { data: pdfData })
            break
        }

        if (!page || cancelled) return

        const doc = React.createElement(
          Document,
          { title: `${pdfData.classInfo.namePart} — Превю`, author: 'Малки спомени' },
          page
        )

        const viewer = React.createElement(
          PDFViewer,
          { width: '100%', height: '100%', showToolbar: false },
          doc
        )

        if (containerRef.current) {
          // Unmount previous root if any
          const prev = (containerRef.current as any).__reactRoot
          if (prev) prev.unmount()
          const root = ReactDOM.createRoot(containerRef.current)
          ;(containerRef.current as any).__reactRoot = root
          root.render(viewer)
          setReady(true)
        }
      } catch (e) {
        if (!cancelled) setError(String(e))
      }
    }

    render()
    return () => { cancelled = true }
  }, [section, pdfData])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-sm px-4 text-center">
        {error}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      {!ready && (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Зарежда превю...
        </div>
      )}
    </div>
  )
}
