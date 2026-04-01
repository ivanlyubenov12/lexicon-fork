'use client'

import { useState, useEffect } from 'react'
import type { PDFData } from '@/lib/pdf/types'
import type { Section } from './PdfBuilderClient'
import type { PDFTheme, PageOptions } from '@/lib/pdf/builder-types'

interface Mods {
  PDFViewer: React.ComponentType<any>
  Document: React.ComponentType<any>
  CoverPage: React.ComponentType<any>
  ClassOverviewPage: React.ComponentType<any>
  StudentsGridPage: React.ComponentType<any>
  StudentPage: React.ComponentType<any>
  PollsPage: React.ComponentType<any>
  MemoriesPage: React.ComponentType<any>
  ClosingPage: React.ComponentType<any>
}

interface Props {
  section: Section
  pdfData: PDFData
  theme?: PDFTheme
  options?: PageOptions
}

export default function PdfPreview({ section, pdfData, theme, options }: Props) {
  const [mods, setMods] = useState<Mods | null>(null)

  useEffect(() => {
    Promise.all([
      import('@react-pdf/renderer'),
      import('@/lib/pdf/LexiconPDF'),
    ]).then(([pdf, pages]) => {
      setMods({
        PDFViewer: pdf.PDFViewer,
        Document: pdf.Document,
        CoverPage: pages.CoverPage,
        ClassOverviewPage: pages.ClassOverviewPage,
        StudentsGridPage: pages.StudentsGridPage,
        StudentPage: pages.StudentPage,
        PollsPage: pages.PollsPage,
        MemoriesPage: pages.MemoriesPage,
        ClosingPage: pages.ClosingPage,
      })
    })
  }, [])

  if (!mods) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm gap-2">
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Зарежда модули...
      </div>
    )
  }

  const {
    PDFViewer, Document, CoverPage, ClassOverviewPage, StudentsGridPage,
    StudentPage, PollsPage, MemoriesPage, ClosingPage,
  } = mods

  let page: React.ReactElement | null = null

  switch (section.type) {
    case 'cover':
      page = <CoverPage data={pdfData} theme={theme} options={options} />
      break
    case 'overview':
      page = <ClassOverviewPage data={pdfData} theme={theme} options={options} />
      break
    case 'students_grid':
      page = (
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
      break
    case 'student': {
      const student = pdfData.students.find(s => s.id === section.studentId)
      if (student) page = <StudentPage student={student} classInfo={pdfData.classInfo} bgPng={null} theme={theme} options={options} groupLabel={pdfData.groupLabel} studentPageBlocks={pdfData.studentPageBlocks} />
      break
    }
    case 'polls':
      page = <PollsPage polls={pdfData.polls} classInfo={pdfData.classInfo} bgPng={null} theme={theme} />
      break
    case 'memories': {
      const event = pdfData.events.find(e => e.id === section.eventId)
      if (event) page = <MemoriesPage events={[event]} classInfo={pdfData.classInfo} bgPng={null} theme={theme} options={options} />
      break
    }
    case 'closing':
      page = <ClosingPage data={pdfData} theme={theme} />
      break
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Няма данни за тази секция.
      </div>
    )
  }

  return (
    <PDFViewer width="100%" height="100%" showToolbar={false}>
      <Document title={`${pdfData.classInfo.namePart} — Превю`} author="Малки спомени">
        {page}
      </Document>
    </PDFViewer>
  )
}
