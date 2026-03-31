import React from 'react'
import {
  Document, Page, View, Text, Image, Link,
  StyleSheet, Font, renderToBuffer,
} from '@react-pdf/renderer'
import type { PDFData, PDFStudent, PDFPoll, PDFEvent, PDFEventComment, PDFAnswer, PDFVoiceQuestion } from './types'

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
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
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
  eventPhotos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  eventPhoto: {
    width: 155,
    height: 115,
    borderRadius: 4,
    objectFit: 'cover',
  },
  eventComments: {
    marginTop: 8,
    gap: 4,
  },
  eventCommentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
  },
  eventCommentAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.indigoLight,
    flexShrink: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCommentAvatarImg: {
    width: 18,
    height: 18,
    objectFit: 'cover',
  },
  eventCommentContent: {
    flex: 1,
  },
  eventCommentName: {
    fontSize: 7,
    fontWeight: 'bold',
    color: C.dark,
    marginBottom: 1,
  },
  eventCommentText: {
    fontSize: 7.5,
    color: C.muted,
    lineHeight: 1.4,
  },
  // Class overview page
  heroImage: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
  },
  heroTitle: {
    fontFamily: 'NotoSerif',
    fontWeight: 'bold',
    fontSize: 26,
    color: C.white,
    lineHeight: 1.2,
  },
  heroSchool: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 3,
  },
  overviewSectionLabel: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: C.indigo,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  overviewSection: {
    paddingHorizontal: 28,
    paddingTop: 10,
    paddingBottom: 2,
  },
  // Wordcloud
  wordcloudWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'baseline',
    backgroundColor: C.indigoLight,
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  // Barchart
  barchartPair: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  barchartCol: {
    flex: 1,
    backgroundColor: C.indigoLight,
    padding: 8,
    borderRadius: 6,
  },
  barchartColTitle: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: C.indigo,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  barchartItem: {
    marginBottom: 4,
  },
  barchartItemLabel: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 2,
  },
  barchartRank: {
    fontSize: 6.5,
    color: C.muted,
    width: 10,
    flexShrink: 0,
  },
  barchartLabelText: {
    fontFamily: 'NotoSerif',
    fontWeight: 'bold',
    fontSize: 7.5,
    color: C.dark,
    flex: 1,
  },
  barchartTrack: {
    height: 4,
    backgroundColor: 'rgba(54,50,183,0.12)',
    borderRadius: 2,
  },
  barchartFill: {
    height: 4,
    backgroundColor: C.indigo,
    borderRadius: 2,
  },
  // Polls grid (class overview)
  pollsGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  pollWinnerCard: {
    backgroundColor: C.indigoLight,
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
    width: 80,
  },
  pollWinnerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.indigo,
    overflow: 'hidden',
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollWinnerAvatarImg: {
    width: 36,
    height: 36,
    objectFit: 'cover',
  },
  pollWinnerName: {
    fontFamily: 'NotoSerif',
    fontWeight: 'bold',
    fontSize: 6.5,
    color: C.dark,
    textAlign: 'center',
    marginBottom: 2,
    lineHeight: 1.3,
  },
  pollWinnerLabel: {
    fontSize: 5.5,
    color: C.indigo,
    textAlign: 'center',
    lineHeight: 1.3,
  },
  // Events strip on class overview page
  eventsStrip: {
    flexDirection: 'row',
    gap: 6,
  },
  eventThumb: {
    position: 'relative',
    flex: 1,
    height: 65,
    borderRadius: 4,
    overflow: 'hidden',
  },
  eventThumbImg: {
    width: '100%',
    height: 65,
    objectFit: 'cover',
  },
  eventThumbOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
  },
  eventThumbTitle: {
    fontSize: 6,
    color: C.white,
    fontWeight: 'bold',
  },
  eventThumbNoPhoto: {
    flex: 1,
    height: 65,
    backgroundColor: C.indigoLight,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  // Students grid page
  studentsGridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  studentsGridTitle: {
    fontFamily: 'NotoSerif',
    fontWeight: 'bold',
    fontSize: 28,
    color: C.dark,
  },
  studentsGridCount: {
    fontSize: 8,
    fontWeight: 'bold',
    color: C.gold,
    letterSpacing: 1.5,
  },
  studentsGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  studentCard: {
    width: 98,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    padding: 4,
    paddingBottom: 7,
  },
  studentCardPhoto: {
    width: 90,
    height: 90,
    backgroundColor: C.indigoLight,
    objectFit: 'cover',
    alignSelf: 'center',
  },
  studentCardInitials: {
    width: 90,
    height: 90,
    backgroundColor: C.indigoLight,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentCardName: {
    fontFamily: 'NotoSerif',
    fontWeight: 'bold',
    fontSize: 7,
    color: C.dark,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 1.35,
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

// ─── Background pattern helper ──────────────────────────────────────────────

function BgImage({ png }: { png: Buffer | null | undefined }) {
  if (!png) return null
  // Rendered as last child so it overlays content as a watermark.
  // Opacity is baked into the PNG itself (set in bgPatternSvg.ts).
  return (
    <Image
      src={`data:image/png;base64,${png.toString('base64')}`}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  )
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
          {data.students.length} {(data.preset === 'friends' || data.preset === 'sports' || data.preset === 'kindergarten') ? 'участника' : 'ученика'}
        </Text>
      </View>
    </Page>
  )
}

// ─── Class Overview Page ─────────────────────────────────────────────────────

const VOICE_COLORS = [C.indigo, '#e11d48', '#d97706', '#059669', '#7c3aed', '#0891b2', '#be185d', '#15803d']

function ClassOverviewPage({ data }: { data: PDFData }) {
  const { classInfo, polls, voice_questions, events } = data
  const heroSrc = classInfo.cover_image_url ?? classInfo.superhero_image_url

  return (
    <Page size="A4" style={s.page}>
      {/* Hero image */}
      <View style={{ position: 'relative', height: 200 }}>
        {heroSrc ? (
          <Image src={heroSrc} style={{ ...s.heroImage, position: 'absolute', top: 0, left: 0 }} />
        ) : (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.indigoDark }} />
        )}
        {/* Dark overlay */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
          backgroundColor: 'rgba(0,0,0,0.55)' }} />
        {/* Class name */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
          <Text style={s.heroTitle}>{classInfo.namePart}</Text>
          {classInfo.schoolPart && (
            <Text style={s.heroSchool}>{classInfo.schoolPart}</Text>
          )}
          <Text style={{ fontSize: 8, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
            {classInfo.school_year}
          </Text>
        </View>
      </View>

      {/* Voice questions — barcharts paired side-by-side, wordclouds full-width */}
      {(() => {
        const barcharts = voice_questions.filter(vq => vq.display === 'barchart')
        const wordclouds = voice_questions.filter(vq => vq.display === 'wordcloud')

        // Pair barcharts: [0,1], [2,3], …
        const pairs: Array<[typeof barcharts[0], typeof barcharts[0] | null]> = []
        for (let i = 0; i < barcharts.length; i += 2) {
          pairs.push([barcharts[i], barcharts[i + 1] ?? null])
        }

        const renderBarCol = (vq: typeof barcharts[0]) => (
          <View style={s.barchartCol}>
            <Text style={s.barchartColTitle}>{vq.text}</Text>
            {vq.items.slice(0, 4).map((item, j) => {
              const maxPct = vq.items[0]?.pct ?? 1
              const relW = maxPct > 0 ? Math.round((item.pct / maxPct) * 100) : 0
              return (
                <View key={j} style={s.barchartItem}>
                  <View style={s.barchartItemLabel}>
                    <Text style={s.barchartRank}>{j + 1}</Text>
                    <Text style={s.barchartLabelText}>{item.text}</Text>
                  </View>
                  <View style={s.barchartTrack}>
                    <View style={{ ...s.barchartFill, width: `${relW}%`,
                      backgroundColor: VOICE_COLORS[j % VOICE_COLORS.length] }} />
                  </View>
                </View>
              )
            })}
          </View>
        )

        return (
          <>
            {pairs.map((pair, pi) => (
              <View key={pi} style={{ ...s.overviewSection, paddingBottom: 0 }}>
                <View style={s.barchartPair}>
                  {renderBarCol(pair[0])}
                  {pair[1] ? renderBarCol(pair[1]) : <View style={{ flex: 1 }} />}
                </View>
              </View>
            ))}
            {(() => {
              const wcPairs: Array<[typeof wordclouds[0], typeof wordclouds[0] | null]> = []
              for (let i = 0; i < wordclouds.length; i += 2) {
                wcPairs.push([wordclouds[i], wordclouds[i + 1] ?? null])
              }
              const renderWcCol = (vq: typeof wordclouds[0]) => (
                <View style={{ flex: 1 }}>
                  <Text style={s.overviewSectionLabel}>{vq.text}</Text>
                  <View style={s.wordcloudWrap}>
                    {vq.items.map((item, j) => (
                      <Text key={j} style={{
                        fontSize: item.size === 'lg' ? 11 : item.size === 'md' ? 8 : 6,
                        fontFamily: 'NotoSerif',
                        fontWeight: item.size === 'lg' ? 'bold' : 'normal',
                        fontStyle: item.size === 'sm' ? 'italic' : 'normal',
                        color: VOICE_COLORS[j % VOICE_COLORS.length],
                      }}>
                        {item.text}
                      </Text>
                    ))}
                  </View>
                </View>
              )
              return wcPairs.map((pair, pi) => (
                <View key={pi} style={{ ...s.overviewSection, paddingBottom: 0 }}>
                  <View style={s.barchartPair}>
                    {renderWcCol(pair[0])}
                    {pair[1] ? renderWcCol(pair[1]) : <View style={{ flex: 1 }} />}
                  </View>
                </View>
              ))
            })()}
          </>
        )
      })()}

      {/* Polls grid — winners */}
      {polls.length > 0 && (
        <View style={s.overviewSection}>
          <Text style={s.overviewSectionLabel}>
            {data.starsLabel
              ? data.starsLabel
              : data.preset === 'sports' ? 'Звездите на отбора'
              : (data.preset === 'friends' || data.preset === 'kindergarten') ? 'Звездите на групата'
              : 'Звездите на класа'}
          </Text>
          <View style={s.pollsGridRow}>
            {polls.filter(p => p.nominees.length > 0).map((poll, i) => {
              const winner = poll.nominees[0]
              const initials = winner.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              return (
                <Link key={i} src={`#s-${winner.id}`} style={{ textDecoration: 'none', width: 80 }}>
                  <View style={s.pollWinnerCard}>
                    <View style={s.pollWinnerAvatar}>
                      {winner.photo_url ? (
                        <Image src={winner.photo_url} style={s.pollWinnerAvatarImg} />
                      ) : (
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: C.white }}>{initials}</Text>
                      )}
                    </View>
                    <Text style={s.pollWinnerName}>{winner.name}</Text>
                    <Text style={s.pollWinnerLabel}>{truncate(poll.question, 40)}</Text>
                  </View>
                </Link>
              )
            })}
          </View>
        </View>
      )}

      {/* Events strip */}
      {events.length > 0 && (
        <View style={s.overviewSection}>
          <Text style={s.overviewSectionLabel}>Нашите събития</Text>
          <View style={s.eventsStrip}>
            {events.slice(0, 5).map((ev, i) => {
              const photo = ev.photos[0]
              return photo ? (
                <View key={i} style={s.eventThumb}>
                  <Image src={photo} style={s.eventThumbImg} />
                  <View style={s.eventThumbOverlay}>
                    <Text style={s.eventThumbTitle}>{truncate(ev.title, 28)}</Text>
                  </View>
                </View>
              ) : (
                <View key={i} style={s.eventThumbNoPhoto}>
                  <Text style={{ fontSize: 6.5, fontWeight: 'bold', color: C.indigo, textAlign: 'center' }}>
                    {truncate(ev.title, 30)}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
      )}

      {/* Superhero prompt quote */}
      {classInfo.superhero_prompt && (
        <View style={{ paddingHorizontal: 28, paddingTop: 8 }}>
          <Text style={{ fontFamily: 'NotoSerif', fontStyle: 'italic', fontSize: 8,
            color: C.muted, lineHeight: 1.4, textAlign: 'center' }}>
            „{truncate(classInfo.superhero_prompt, 180)}"
          </Text>
        </View>
      )}

      {/* Page footer */}
      <View style={s.pageFooter}>
        <Text style={s.pageFooterText} />
        <Text style={s.pageFooterText} render={({ pageNumber }) => `${pageNumber}`} />
      </View>
      <BgImage png={data.bg_pattern_png} />
    </Page>
  )
}

// ─── Student Page ────────────────────────────────────────────────────────────

function StudentPage({ student, classInfo, bgPng }: {
  student: PDFStudent
  classInfo: PDFData['classInfo']
  bgPng?: Buffer | null
}) {
  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase()
  const videoQrs = student.video_qrs.filter(v => v.qr_png)

  return (
    <Page size="A4" style={s.page}>
      {/* Header — id used as internal PDF link anchor from students grid */}
      <View id={`s-${student.id}`} style={s.studentHeader}>
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
          <View style={{ height: 3, backgroundColor: C.gold, borderRadius: 2, marginTop: 8, width: 40 }} />

          {/* QR codes for video answers */}
          {videoQrs.map((v, i) => (
            <View key={i} style={{ marginTop: 12, alignItems: 'center' }}>
              {v.question_text ? (
                <Text style={{ fontSize: 7, fontWeight: 'bold', color: C.indigo, textAlign: 'center', marginBottom: 5, lineHeight: 1.4 }}>
                  {truncate(v.question_text, 50)}
                </Text>
              ) : null}
              <Link src={v.url}>
                <Image
                  src={`data:image/png;base64,${v.qr_png!.toString('base64')}`}
                  style={{ width: 80, height: 80 }}
                />
              </Link>
              <Text style={{ fontSize: 6, color: C.muted, textAlign: 'center', marginTop: 4, fontStyle: 'italic', lineHeight: 1.4 }}>
                Сканирай кода, за да видиш посланието
              </Text>
            </View>
          ))}
        </View>

        {/* Info column */}
        <View style={s.infoCol}>
          <Text style={s.studentName}>{student.first_name}</Text>
          <Text style={{ ...s.studentName, fontSize: 16, color: C.muted, marginTop: -4, marginBottom: 6 }}>
            {student.last_name}
          </Text>
          <Text style={s.studentClass}>{classInfo.namePart} · {classInfo.school_year}</Text>
          <View style={s.divider} />

          {student.answers.length > 0 ? (
            student.answers.map((qa, i) => (
              <View key={i} style={s.qaBlock}>
                <Text style={s.qLabel}>{qa.question_text}</Text>
                {qa.media_type === 'video' ? (
                  <View style={{ marginTop: 4, width: 110, height: 80, borderRadius: 6, overflow: 'hidden',
                    backgroundColor: C.indigoDark, alignItems: 'center', justifyContent: 'center' }}>
                    {qa.video_thumbnail_url ? (
                      <>
                        <Image src={qa.video_thumbnail_url}
                          style={{ position: 'absolute', top: 0, left: 0, width: 110, height: 80, objectFit: 'cover' }} />
                        <View style={{ width: 24, height: 24, borderRadius: 12,
                          backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 10, color: C.indigoDark }}>▶</Text>
                        </View>
                      </>
                    ) : (
                      <View style={{ alignItems: 'center', gap: 4 }}>
                        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)',
                          alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 14, color: C.white }}>▶</Text>
                        </View>
                        <Text style={{ fontSize: 6, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 }}>ВИДЕО</Text>
                      </View>
                    )}
                  </View>
                ) : qa.media_url && (qa.media_type === 'image' || !qa.media_type) ? (
                  <Image src={qa.media_url}
                    style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 4, marginTop: 2 }} />
                ) : qa.text_content ? (
                  <Text style={s.aText}>{qa.text_content}</Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 9, color: C.muted, fontStyle: 'italic' }}>
              Няма попълнени отговори.
            </Text>
          )}
        </View>
      </View>

      {/* Event comments — "Моите спомени с класа" */}
      {student.event_comments.length > 0 && (
        <View style={{ paddingHorizontal: 28, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.border }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold', color: C.gold, letterSpacing: 1.2,
            textTransform: 'uppercase', marginBottom: 8 }}>
            Моите спомени с класа
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {student.event_comments.map((ec, i) => (
              <View key={i} style={{ width: 130, backgroundColor: C.white,
                borderWidth: 1, borderColor: C.border, borderRadius: 4, overflow: 'hidden' }}>
                {ec.event_photo_url && (
                  <Image src={ec.event_photo_url}
                    style={{ width: 130, height: 80, objectFit: 'cover' }} />
                )}
                <View style={{ padding: 5 }}>
                  <Text style={{ fontFamily: 'NotoSerif', fontStyle: 'italic', fontSize: 7,
                    color: C.dark, marginBottom: 2 }}>„{ec.event_title}"</Text>
                  {ec.event_date && (
                    <Text style={{ fontSize: 6, color: C.muted, marginBottom: 3 }}>
                      {formatDate(ec.event_date)}
                    </Text>
                  )}
                  <Text style={{ fontSize: 7.5, color: C.indigo, lineHeight: 1.4 }}>
                    {truncate(ec.comment_text, 100)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Messages section */}
      {student.messages.length > 0 && (
        <View style={s.messagesSection}>
          <Text style={s.messagesTitle}>Послания от съучениците</Text>
          <View style={s.messagesGrid}>
            {student.messages.map((msg, i) => (
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
        <Text style={s.pageFooterText} />
        <Text style={s.pageFooterText} render={({ pageNumber }) => `${pageNumber}`} />
      </View>
      <BgImage png={bgPng} />
    </Page>
  )
}

// ─── Polls Page ──────────────────────────────────────────────────────────────

function PollsPage({ polls, classInfo, bgPng }: {
  polls: PDFPoll[]
  classInfo: PDFData['classInfo']
  bgPng?: Buffer | null
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
        <Text style={s.pageFooterText} />
        <Text style={s.pageFooterText} render={({ pageNumber }) => `${pageNumber}`} />
      </View>
      <BgImage png={bgPng} />
    </Page>
  )
}

// ─── Memories Page ───────────────────────────────────────────────────────────

function MemoriesPage({ events, classInfo, bgPng }: {
  events: PDFEvent[]
  classInfo: PDFData['classInfo']
  bgPng?: Buffer | null
}) {
  if (events.length === 0) return null
  return (
    <>
      {events.map((ev, idx) => {
        const photos = ev.photos.slice(0, 6)
        const comments = ev.comments.slice(0, 20)
        const half = Math.ceil(comments.length / 2)
        const leftComments = comments.slice(0, half)
        const rightComments = comments.slice(half)

        const renderComment = (c: PDFEventComment, ci: number) => {
          const initials = c.student_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          return (
            <View key={ci} style={{ ...s.eventCommentRow, marginBottom: 5 }}>
              <View style={s.eventCommentAvatar}>
                {c.student_photo_url ? (
                  <Image src={c.student_photo_url} style={s.eventCommentAvatarImg} />
                ) : (
                  <Text style={{ fontSize: 6, fontWeight: 'bold', color: C.indigo }}>{initials}</Text>
                )}
              </View>
              <View style={s.eventCommentContent}>
                <Text style={s.eventCommentName}>{c.student_name}</Text>
                <Text style={s.eventCommentText}>{truncate(c.text, 160)}</Text>
              </View>
            </View>
          )
        }

        return (
          <Page key={ev.id} size="A4" style={{ ...s.page, ...s.sectionPage }}>
            {/* Compact golden header */}
            <View style={{ backgroundColor: '#a0722a', paddingHorizontal: 36, paddingVertical: 18 }}>
              <Text style={s.sectionHeaderLabel}>Нашите спомени</Text>
              <Text style={{ ...s.sectionHeaderTitle, fontSize: 20 }}>{truncate(ev.title, 60)}</Text>
              {ev.event_date && (
                <Text style={{ fontSize: 8, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>
                  {formatDate(ev.event_date)}
                </Text>
              )}
            </View>

            <View style={{ padding: 24 }}>
              {/* Note */}
              {ev.note && (
                <Text style={{ ...s.eventNote, marginBottom: 12 }}>
                  {truncate(ev.note, 300)}
                </Text>
              )}

              {/* Photos — 3 per row */}
              {photos.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {photos.filter(url => url && url !== 'undefined').map((url, pi) => (
                    <Image key={pi} src={url} style={{ width: 170, height: 118, borderRadius: 4, objectFit: 'cover', objectPosition: 'center center' }} />
                  ))}
                </View>
              )}

              {/* Comments — 2-column grid */}
              {comments.length > 0 && (
                <>
                  <Text style={{ fontSize: 6.5, fontWeight: 'bold', color: '#a0722a', letterSpacing: 1.5,
                    textTransform: 'uppercase', marginBottom: 8 }}>
                    Коментари от класа
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 14 }}>
                    <View style={{ flex: 1 }}>
                      {leftComments.map((c, ci) => renderComment(c, ci))}
                    </View>
                    <View style={{ flex: 1 }}>
                      {rightComments.map((c, ci) => renderComment(c, ci + half))}
                    </View>
                  </View>
                </>
              )}
            </View>

            <View style={s.pageFooter}>
              <Text style={s.pageFooterText} />
              <Text style={s.pageFooterText} render={({ pageNumber }) => `${pageNumber}`} />
            </View>
            <BgImage png={bgPng} />
          </Page>
        )
      })}
    </>
  )
}

// ─── Students Grid Page ──────────────────────────────────────────────────────

const CARDS_PER_PAGE = 25 // 5 cols × 5 rows

function StudentsGridPage({ students, classInfo, isFirst, totalCount, memberLabel, preset, bgPng }: {
  students: PDFStudent[]
  classInfo: PDFData['classInfo']
  isFirst: boolean
  totalCount: number
  memberLabel?: string | null
  preset?: string | null
  bgPng?: Buffer | null
}) {
  const gridTitle = memberLabel
    || (preset === 'kindergarten' ? 'Всички деца'
      : preset === 'sports' ? 'Всички играчи'
      : preset === 'friends' ? 'Всички участници'
      : 'Всички ученици')
  const gridCount = memberLabel
    ? `${totalCount} УЧАСТНИЦИ`
    : (preset === 'kindergarten' ? `${totalCount} ДЕЦА`
      : preset === 'sports' ? `${totalCount} ИГРАЧИ`
      : preset === 'friends' ? `${totalCount} УЧАСТНИЦИ`
      : `${totalCount} УЧЕНИЦИ`)

  return (
    <Page size="A4" style={{ ...s.page, padding: 28 }}>
      {isFirst && (
        <View style={s.studentsGridHeader}>
          <Text style={s.studentsGridTitle}>{gridTitle}</Text>
          <Text style={s.studentsGridCount}>{gridCount}</Text>
        </View>
      )}
      <View style={s.studentsGridWrap}>
        {students.map((student) => {
          const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase()
          return (
            <Link key={student.id} src={`#s-${student.id}`}
              style={{ textDecoration: 'none' }}>
              <View style={s.studentCard}>
                {/* Tape strip at top */}
                <View style={{ width: 32, height: 5, backgroundColor: 'rgba(200,169,110,0.45)',
                  alignSelf: 'center', marginBottom: 4, borderRadius: 1 }} />
                {/* Photo */}
                {student.photo_url ? (
                  <Image src={student.photo_url} style={s.studentCardPhoto} />
                ) : (
                  <View style={s.studentCardInitials}>
                    <Text style={{ fontFamily: 'NotoSerif', fontWeight: 'bold',
                      fontSize: 24, color: C.indigo }}>{initials}</Text>
                  </View>
                )}
                {/* Name */}
                <Text style={s.studentCardName}>
                  {student.first_name} {student.last_name}
                </Text>
              </View>
            </Link>
          )
        })}
      </View>
      <View style={s.pageFooter}>
        <Text style={s.pageFooterText} />
        <Text style={s.pageFooterText} render={({ pageNumber }) => `${pageNumber}`} />
      </View>
      <BgImage png={bgPng} />
    </Page>
  )
}

// ─── Closing / Credits Page ──────────────────────────────────────────────────

function ClosingPage({ data }: { data: PDFData }) {
  const { classInfo } = data
  const year = classInfo.school_year?.split('/')[0] ?? new Date().getFullYear().toString()
  return (
    <Page size="A4" style={s.coverPage}>
      <View style={s.coverTopBar} />
      <View style={s.coverBottomBar} />

      <View style={s.coverContent}>
        {/* School logo */}
        {classInfo.school_logo_url && (
          <View style={{ marginBottom: 28, alignItems: 'center' }}>
            <Image
              src={classInfo.school_logo_url}
              style={{ width: 56, height: 56, objectFit: 'contain' }}
            />
          </View>
        )}

        <Text style={s.coverTagline}>Малки спомени</Text>
        <Text style={s.coverTitle}>{classInfo.namePart}</Text>
        {classInfo.schoolPart && (
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 8, textAlign: 'center' }}>
            {classInfo.schoolPart}
          </Text>
        )}
        <Text style={s.coverYear}>{classInfo.school_year}</Text>

        <View style={s.coverDivider} />

        <Text style={{ ...s.coverQuote, fontSize: 9 }}>
          Тази книга е създадена с помощта на платформата Малки спомени.{'\n'}
          Тя пази спомените на {data.students.length} {
            (data.preset === 'friends' || data.preset === 'sports' || data.preset === 'kindergarten')
              ? 'участника'
              : 'ученика'
          } от учебната {classInfo.school_year} година.
        </Text>
      </View>

      {/* Colophon */}
      <View style={{ position: 'absolute', bottom: 28, left: 0, right: 0, alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', letterSpacing: 1 }}>
          © {year} · mini-memories.com
        </Text>
      </View>
    </Page>
  )
}

// ─── Main Document ───────────────────────────────────────────────────────────

export function LexiconPDF({ data }: { data: PDFData }) {
  // Chunk students into pages of CARDS_PER_PAGE for the grid
  const gridChunks: PDFStudent[][] = []
  for (let i = 0; i < data.students.length; i += CARDS_PER_PAGE) {
    gridChunks.push(data.students.slice(i, i + CARDS_PER_PAGE))
  }

  return (
    <Document
      title={`${data.classInfo.namePart} — Лексикон`}
      author="Малки спомени"
      subject={data.classInfo.school_year}
    >
      <CoverPage data={data} />

      <ClassOverviewPage data={data} />

      {/* Students grid — one page per chunk, first chunk shows the header */}
      {gridChunks.map((chunk, ci) => (
        <StudentsGridPage
          key={ci}
          students={chunk}
          classInfo={data.classInfo}
          isFirst={ci === 0}
          totalCount={data.students.length}
          memberLabel={data.memberLabel}
          preset={data.preset}
          bgPng={data.bg_pattern_png}
        />
      ))}

      {data.students.map((student) => (
        <StudentPage
          key={student.id}
          student={student}
          classInfo={data.classInfo}
          bgPng={data.bg_pattern_png}
        />
      ))}

      {data.polls.length > 0 ? (
        <PollsPage polls={data.polls} classInfo={data.classInfo} bgPng={data.bg_pattern_png} />
      ) : null}

      {data.events.length > 0 ? (
        <MemoriesPage events={data.events} classInfo={data.classInfo} bgPng={data.bg_pattern_png} />
      ) : null}

      <ClosingPage data={data} />
    </Document>
  )
}

// ─── Buffer helper (keeps JSX + renderToBuffer in the same module/React instance) ─

export async function generatePDFBuffer(data: PDFData): Promise<Buffer> {
  return renderToBuffer(<LexiconPDF data={data} />) as Promise<Buffer>
}
