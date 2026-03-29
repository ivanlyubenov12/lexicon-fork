import React from 'react'
import {
  Document, Page, View, Text, Image,
  StyleSheet, Font, renderToBuffer,
} from '@react-pdf/renderer'
import type { PDFData, PDFStudent, PDFPoll, PDFEvent } from './types'

// ─── Palette ────────────────────────────────────────────────────────────────

const C = {
  indigo:      '#3632b7',
  indigoLight: '#e8e5ff',
  indigoDark:  '#12082e',
  gold:        '#c8a96e',
  goldLight:   '#f0d89a',
  dark:        '#1a1c1e',
  muted:       '#6b7280',
  border:      '#e5e7eb',
  bg:          '#faf9f8',
  white:       '#ffffff',
}

// ─── Fonts ──────────────────────────────────────────────────────────────────

const NOTO_400    = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.0.8/files/noto-serif-cyrillic-400-normal.woff'
const NOTO_700    = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.0.8/files/noto-serif-cyrillic-700-normal.woff'
const NOTO_400I   = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.0.8/files/noto-serif-cyrillic-400-italic.woff'
const NOTO_700I   = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.0.8/files/noto-serif-cyrillic-700-italic.woff'
const MANROPE_400 = 'https://cdn.jsdelivr.net/npm/@fontsource/manrope@5.0.8/files/manrope-cyrillic-400-normal.woff'
const MANROPE_700 = 'https://cdn.jsdelivr.net/npm/@fontsource/manrope@5.0.8/files/manrope-cyrillic-700-normal.woff'

Font.register({
  family: 'NotoSerif',
  fonts: [
    { src: NOTO_400 },
    { src: NOTO_700, fontWeight: 'bold' },
    { src: NOTO_400I, fontStyle: 'italic' },
    { src: NOTO_700I, fontWeight: 'bold', fontStyle: 'italic' },
  ],
})

Font.register({
  family: 'Manrope',
  fonts: [
    { src: MANROPE_400 },
    { src: MANROPE_700, fontWeight: 'bold' },
    // Manrope has no italic — register normal as fallback to avoid font resolution errors
    { src: MANROPE_400, fontStyle: 'italic' },
    { src: MANROPE_700, fontWeight: 'bold', fontStyle: 'italic' },
  ],
})

Font.registerHyphenationCallback(word => [word])

// ─── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    fontFamily: 'Manrope',
    fontSize: 9,
    color: C.dark,
  },
  // Cover
  coverPage: {
    backgroundColor: C.indigoDark,
    fontFamily: 'Manrope',
    color: C.white,
    padding: 0,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: C.gold,
  },
  coverBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: C.gold,
  },
  coverContent: {
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  coverTagline: {
    fontSize: 8,
    letterSpacing: 3,
    color: C.gold,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  coverTitle: {
    fontFamily: 'NotoSerif',
    fontWeight: 'bold',
    fontSize: 38,
    color: C.white,
    textAlign: 'center',
    lineHeight: 1.25,
    marginBottom: 14,
  },
  coverYear: {
    fontSize: 13,
    color: C.goldLight,
    letterSpacing: 1.5,
    marginBottom: 32,
  },
  coverDivider: {
    width: 60,
    height: 1,
    backgroundColor: C.gold,
    marginBottom: 20,
    opacity: 0.5,
  },
  coverQuote: {
    fontFamily: 'NotoSerif',
    fontSize: 10,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 1.7,
    maxWidth: 360,
  },
  // Student page
  studentHeader: {
    backgroundColor: C.indigo,
    paddingHorizontal: 28,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentHeaderTitle: {
    fontFamily: 'NotoSerif',
    fontSize: 8,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  studentHeaderName: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },
  studentBody: {
    flexDirection: 'row',
    padding: 28,
    gap: 20,
    flex: 1,
  },
  photoCol: {
    width: 160,
    flexShrink: 0,
  },
  photoFrame: {
    width: 160,
    height: 213, // 3:4
    backgroundColor: C.indigoLight,
    borderWidth: 3,
    borderColor: C.gold,
    borderRadius: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoInitials: {
    fontFamily: 'NotoSerif',
    fontWeight: 'bold',
    fontSize: 42,
    color: C.indigo,
  },
  infoCol: {
    flex: 1,
  },
  studentName: {
    fontFamily: 'NotoSerif',
    fontWeight: 'bold',
    fontSize: 22,
    color: C.dark,
    lineHeight: 1.2,
    marginBottom: 3,
  },
  studentClass: {
    fontSize: 8,
    color: C.indigo,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 14,
  },
  qaBlock: {
    marginBottom: 11,
  },
  qLabel: {
    fontSize: 7,
    color: C.indigo,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  aText: {
    fontSize: 9,
    color: C.dark,
    lineHeight: 1.55,
  },
  // Messages footer
  messagesSection: {
    backgroundColor: C.indigoLight,
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  messagesTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    color: C.indigo,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  messagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  messageCard: {
    backgroundColor: C.white,
    borderRadius: 6,
    padding: 8,
    width: '48%',
  },
  messageText: {
    fontFamily: 'NotoSerif',
    fontStyle: 'italic',
    fontSize: 8,
    color: C.dark,
    lineHeight: 1.55,
    marginBottom: 4,
  },
  messageAuthor: {
    fontSize: 7,
    color: C.muted,
    fontWeight: 'bold',
  },
  // Page footer
  pageFooter: {
    position: 'absolute',
    bottom: 12,
    left: 28,
    right: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageFooterText: {
    fontSize: 7,
    color: C.border,
  },
  // Polls page
  sectionPage: {
    padding: 0,
  },
  sectionHeader: {
    backgroundColor: C.indigo,
    paddingHorizontal: 36,
    paddingVertical: 28,
  },
  sectionHeaderLabel: {
    fontSize: 8,
    color: C.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionHeaderTitle: {
    fontFamily: 'NotoSerif',
    fontWeight: 'bold',
    fontSize: 28,
    color: C.white,
  },
  sectionBody: {
    padding: 28,
  },
  pollCard: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  pollQuestion: {
    fontFamily: 'NotoSerif',
    fontSize: 12,
    color: C.dark,
    marginBottom: 10,
    lineHeight: 1.35,
  },
  pollBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 8,
  },
  pollName: {
    fontSize: 8,
    color: C.dark,
    width: 130,
  },
  pollBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: C.indigoLight,
    borderRadius: 4,
  },
  pollBarFill: {
    height: 8,
    backgroundColor: C.indigo,
    borderRadius: 4,
  },
  pollVotes: {
    fontSize: 7,
    color: C.muted,
    width: 30,
    textAlign: 'right',
  },
  // Memories page
  eventCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: 'row',
    gap: 14,
  },
  eventDate: {
    fontSize: 7,
    color: C.gold,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    width: 60,
    paddingTop: 2,
    flexShrink: 0,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: 'NotoSerif',
    fontWeight: 'bold',
    fontSize: 12,
    color: C.dark,
    marginBottom: 4,
  },
  eventNote: {
    fontSize: 9,
    color: C.muted,
    lineHeight: 1.55,
  },
})

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('bg-BG', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max).trimEnd() + '…'
}

// ─── Cover Page ─────────────────────────────────────────────────────────────

function CoverPage({ data }: { data: PDFData }) {
  const { classInfo } = data
  return (
    <Page size="A4" style={s.coverPage}>
      <View style={s.coverTopBar} />
      <View style={s.coverBottomBar} />

      {/* School logo */}
      {classInfo.school_logo_url && (
        <View style={{ marginBottom: 28, alignItems: 'center' }}>
          <Image
            src={classInfo.school_logo_url}
            style={{ width: 64, height: 64, objectFit: 'contain' }}
          />
        </View>
      )}

      <View style={s.coverContent}>
        <Text style={s.coverTagline}>Малки спомени</Text>

        <Text style={s.coverTitle}>{classInfo.namePart}</Text>

        {classInfo.schoolPart && (
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 8, textAlign: 'center' }}>
            {classInfo.schoolPart}
          </Text>
        )}

        <Text style={s.coverYear}>{classInfo.school_year}</Text>

        <View style={s.coverDivider} />

        {classInfo.superhero_prompt && (
          <Text style={s.coverQuote}>
            „{truncate(classInfo.superhero_prompt, 200)}"
          </Text>
        )}
      </View>

      {/* Student count */}
      <View style={{ position: 'absolute', bottom: 24, right: 36 }}>
        <Text style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>
          {data.students.length} ученика
        </Text>
      </View>
    </Page>
  )
}

// ─── Student Page ────────────────────────────────────────────────────────────

function StudentPage({ student, classInfo, pageNum }: {
  student: PDFStudent
  classInfo: PDFData['classInfo']
  pageNum: number
}) {
  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase()
  const qas = student.answers.slice(0, 5)

  return (
    <Page size="A4" style={s.page}>
      {/* Header */}
      <View style={s.studentHeader}>
        <Text style={s.studentHeaderTitle}>Малки спомени · {classInfo.namePart}</Text>
        <Text style={s.studentHeaderName}>{student.first_name} {student.last_name}</Text>
      </View>

      {/* Body */}
      <View style={s.studentBody}>
        {/* Photo column */}
        <View style={s.photoCol}>
          <View style={s.photoFrame}>
            {student.photo_url ? (
              <Image src={student.photo_url} style={s.photoImage} />
            ) : (
              <Text style={s.photoInitials}>{initials}</Text>
            )}
          </View>

          {/* Decorative gold line under photo */}
          <View style={{ height: 3, backgroundColor: C.gold, borderRadius: 2, marginTop: 8, width: 40 }} />
        </View>

        {/* Info column */}
        <View style={s.infoCol}>
          <Text style={s.studentName}>{student.first_name}</Text>
          <Text style={{ ...s.studentName, fontSize: 16, color: C.muted, marginTop: -4, marginBottom: 6 }}>
            {student.last_name}
          </Text>
          <Text style={s.studentClass}>{classInfo.namePart} · {classInfo.school_year}</Text>
          <View style={s.divider} />

          {qas.length > 0 ? (
            qas.map((qa, i) => (
              <View key={i} style={s.qaBlock}>
                <Text style={s.qLabel}>{qa.question_text}</Text>
                <Text style={s.aText}>{truncate(qa.text_content, 280)}</Text>
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 9, color: C.muted, fontStyle: 'italic' }}>
              Няма попълнени отговори.
            </Text>
          )}
        </View>
      </View>

      {/* Messages section */}
      {student.messages.length > 0 && (
        <View style={s.messagesSection}>
          <Text style={s.messagesTitle}>Послания от съучениците</Text>
          <View style={s.messagesGrid}>
            {student.messages.slice(0, 4).map((msg, i) => (
              <View key={i} style={s.messageCard}>
                <Text style={s.messageText}>„{truncate(msg.content, 160)}"</Text>
                <Text style={s.messageAuthor}>— {msg.author_name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Page footer */}
      <View style={s.pageFooter}>
        <Text style={s.pageFooterText}>{classInfo.namePart} · {classInfo.school_year}</Text>
        <Text style={s.pageFooterText}>{pageNum}</Text>
      </View>
    </Page>
  )
}

// ─── Polls Page ──────────────────────────────────────────────────────────────

function PollsPage({ polls, classInfo, pageNum }: {
  polls: PDFPoll[]
  classInfo: PDFData['classInfo']
  pageNum: number
}) {
  if (polls.length === 0) return null
  return (
    <Page size="A4" style={{ ...s.page, ...s.sectionPage }}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionHeaderLabel}>Гласуване на класа</Text>
        <Text style={s.sectionHeaderTitle}>Анкети</Text>
      </View>

      <View style={s.sectionBody}>
        {polls.map((poll, i) => (
          <View key={i} style={s.pollCard}>
            <Text style={s.pollQuestion}>{poll.question}</Text>
            {poll.nominees.slice(0, 5).map((n, j) => (
              <View key={j} style={s.pollBar}>
                <Text style={s.pollName}>{n.name}</Text>
                <View style={s.pollBarTrack}>
                  <View style={{ ...s.pollBarFill, width: `${Math.round(n.pct)}%` }} />
                </View>
                <Text style={s.pollVotes}>{n.votes} гл.</Text>
              </View>
            ))}
            {poll.totalVotes > 0 && (
              <Text style={{ fontSize: 7, color: C.muted, marginTop: 4 }}>
                {poll.totalVotes} гласа общо
              </Text>
            )}
          </View>
        ))}
      </View>

      <View style={s.pageFooter}>
        <Text style={s.pageFooterText}>{classInfo.namePart} · {classInfo.school_year}</Text>
        <Text style={s.pageFooterText}>{pageNum}</Text>
      </View>
    </Page>
  )
}

// ─── Memories Page ───────────────────────────────────────────────────────────

function MemoriesPage({ events, classInfo, pageNum }: {
  events: PDFEvent[]
  classInfo: PDFData['classInfo']
  pageNum: number
}) {
  if (events.length === 0) return null
  return (
    <Page size="A4" style={{ ...s.page, ...s.sectionPage }}>
      <View style={{ ...s.sectionHeader, backgroundColor: '#a0722a' }}>
        <Text style={s.sectionHeaderLabel}>Нашите спомени</Text>
        <Text style={s.sectionHeaderTitle}>Събития</Text>
      </View>

      <View style={s.sectionBody}>
        {events.map((ev, i) => (
          <View key={i} style={s.eventCard}>
            <Text style={s.eventDate}>{formatDate(ev.event_date)}</Text>
            <View style={s.eventContent}>
              <Text style={s.eventTitle}>{ev.title}</Text>
              {ev.note && (
                <Text style={s.eventNote}>{truncate(ev.note, 400)}</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={s.pageFooter}>
        <Text style={s.pageFooterText}>{classInfo.namePart} · {classInfo.school_year}</Text>
        <Text style={s.pageFooterText}>{pageNum}</Text>
      </View>
    </Page>
  )
}

// ─── Main Document ───────────────────────────────────────────────────────────

export function LexiconPDF({ data }: { data: PDFData }) {
  const pollPageNum = data.students.length + 2
  const eventPageNum = pollPageNum + (data.polls.length > 0 ? 1 : 0)

  return (
    <Document
      title={`${data.classInfo.namePart} — Лексикон`}
      author="Малки спомени"
      subject={data.classInfo.school_year}
    >
      <CoverPage data={data} />

      {data.students.map((student, idx) => (
        <StudentPage
          key={student.id}
          student={student}
          classInfo={data.classInfo}
          pageNum={idx + 2}
        />
      ))}

      {data.polls.length > 0 ? (
        <PollsPage polls={data.polls} classInfo={data.classInfo} pageNum={pollPageNum} />
      ) : null}

      {data.events.length > 0 ? (
        <MemoriesPage events={data.events} classInfo={data.classInfo} pageNum={eventPageNum} />
      ) : null}
    </Document>
  )
}

// ─── Buffer helper (keeps JSX + renderToBuffer in the same module/React instance) ─

export async function generatePDFBuffer(data: PDFData): Promise<Buffer> {
  return renderToBuffer(<LexiconPDF data={data} />) as Promise<Buffer>
}
