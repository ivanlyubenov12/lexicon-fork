// Shared utility for the unified question sequence across all types

export type SeqKind = 'question' | 'voice' | 'poll'

export interface SeqItem {
  id: string
  kind: SeqKind
  text: string
  isAnonymous?: boolean // only relevant for voice
}

export function seqUrl(item: Pick<SeqItem, 'id' | 'kind'>, studentId: string): string {
  if (item.kind === 'poll') return `/my/${studentId}/poll/${item.id}`
  if (item.kind === 'voice') return `/my/${studentId}/voice/${item.id}`
  return `/my/${studentId}/question/${item.id}`
}

export function buildSeq(
  questions: Array<{ id: string; text: string; type: string; order_index: number; is_anonymous?: boolean | null }>,
  polls: Array<{ id: string; question: string; order_index: number }>
): SeqItem[] {
  const isVoiceType = (t: string) => t === 'survey'

  const qItems = questions
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .map(q => ({
      id: q.id,
      kind: isVoiceType(q.type) ? ('voice' as SeqKind) : ('question' as SeqKind),
      text: q.text,
      isAnonymous: isVoiceType(q.type) ? q.is_anonymous !== false : undefined,
    }))

  const pItems = polls
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .map(p => ({
      id: p.id,
      kind: 'poll' as SeqKind,
      text: p.question,
    }))

  return [...qItems, ...pItems]
}
