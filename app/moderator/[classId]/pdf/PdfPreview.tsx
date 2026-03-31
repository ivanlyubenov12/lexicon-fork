'use client'

import dynamic from 'next/dynamic'
import type { PDFData } from '@/lib/pdf/types'
import type { Section } from './PdfBuilderClient'

// These imports touch @react-pdf/renderer at module level (Font.register etc.)
// Loading via dynamic import with ssr:false in PdfBuilderClient keeps them browser-only.
// Here we import them normally since this entire file is excluded from SSR.
import { Document } from '@react-pdf/renderer'
import {
  CoverPage,
  ClassOverviewPage,
  StudentsGridPage,
  StudentPage,
  PollsPage,
  MemoriesPage,
  ClosingPage,
} from '@/lib/pdf/LexiconPDF'

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFViewer),
  { ssr: false },
)

interface Props {
  section: Section
  pdfData: PDFData
}

export default function PdfPreview({ section, pdfData }: Props) {
  const renderPage = () => {
    switch (section.type) {
      case 'cover':
        return <CoverPage data={pdfData} />

      case 'overview':
        return <ClassOverviewPage data={pdfData} />

      case 'students_grid':
        return (
          <StudentsGridPage
            students={pdfData.students}
            classInfo={pdfData.classInfo}
            isFirst={true}
            totalCount={pdfData.students.length}
            memberLabel={pdfData.memberLabel}
            preset={pdfData.preset}
            bgPng={null}
          />
        )

      case 'student': {
        const student = pdfData.students.find((s) => s.id === section.studentId)
        if (!student) return null
        return (
          <StudentPage
            student={student}
            classInfo={pdfData.classInfo}
            bgPng={null}
          />
        )
      }

      case 'polls':
        return (
          <PollsPage
            polls={pdfData.polls}
            classInfo={pdfData.classInfo}
            bgPng={null}
          />
        )

      case 'memories': {
        const event = pdfData.events.find((e) => e.id === section.eventId)
        if (!event) return null
        return (
          <MemoriesPage
            events={[event]}
            classInfo={pdfData.classInfo}
            bgPng={null}
          />
        )
      }

      case 'closing':
        return <ClosingPage data={pdfData} />

      default:
        return null
    }
  }

  const page = renderPage()
  if (!page) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Няма данни за тази секция.
      </div>
    )
  }

  return (
    <PDFViewer width="100%" height="100%" showToolbar={false}>
      <Document
        title={`${pdfData.classInfo.namePart} — Превю`}
        author="Малки спомени"
      >
        {page}
      </Document>
    </PDFViewer>
  )
}
