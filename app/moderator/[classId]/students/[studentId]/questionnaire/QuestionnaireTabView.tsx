'use client'

import { useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Question {
  id: string; text: string; type: string
}
interface Answer {
  question_id: string; status: string
  text_content: string | null; media_url: string | null; media_type: string | null
}
interface Poll {
  id: string; question: string
}
interface PollVote {
  poll_id: string
  nominee: { first_name: string; last_name: string; photo_url: string | null } | null
}
interface Event {
  id: string; title: string; event_date: string | null; photos: string[]
  myComment: { id: string; comment_text: string } | null
}
interface PeerMessage {
  id: string; content: string; status: string
  recipient: { first_name: string; last_name: string; photo_url: string | null } | null
}
interface VoiceQuestion {
  id: string; text: string
}

interface Props {
  allQuestions: Question[]
  answers: Answer[]
  polls: Poll[]
  pollVotes: PollVote[]
  events: Event[]
  peerMessages: PeerMessage[]
  voiceQuestions: VoiceQuestion[]
}

// ── Tab config ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'questionnaire', label: 'Въпросник',           icon: 'quiz' },
  { key: 'polls',         label: 'Анкети',               icon: 'how_to_vote' },
  { key: 'memories',      label: 'Събития',              icon: 'photo_album' },
  { key: 'messages',      label: 'Послания',             icon: 'favorite' },
  { key: 'voice',         label: 'Анонимни въпроси',     icon: 'record_voice_over' },
] as const

type TabKey = typeof TABS[number]['key']

// ── Helpers ────────────────────────────────────────────────────────────────────

function Dot({ status }: { status?: string }) {
  if (status === 'approved') return <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
  if (status === 'submitted') return <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0 mt-1.5" />
  return <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0 mt-1.5" />
}

function Badge({ status }: { status?: string }) {
  if (status === 'approved') return <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full">Одобрен</span>
  if (status === 'submitted') return <span className="text-xs bg-yellow-50 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">За преглед</span>
  return <span className="text-xs bg-gray-50 text-gray-400 font-semibold px-2 py-0.5 rounded-full">Без отговор</span>
}

function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="py-12 text-center">
      <span className="material-symbols-outlined text-4xl text-gray-200 block mb-3">{icon}</span>
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  )
}

// ── Tab badge counts ───────────────────────────────────────────────────────────

function tabBadge(key: TabKey, props: Props): number | null {
  switch (key) {
    case 'questionnaire': {
      const ansMap = new Map(props.answers.map(a => [a.question_id, a.status]))
      return props.answers.filter(a => a.status === 'submitted').length || null
    }
    case 'polls':    return props.pollVotes.length || null
    case 'memories': return props.events.filter(e => e.myComment).length || null
    case 'messages': return props.peerMessages.length || null
    case 'voice':    return props.voiceQuestions.length || null
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function QuestionnaireTabView(props: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('questionnaire')
  const answerMap = new Map(props.answers.map(a => [a.question_id, a]))

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-0 border-b border-gray-200 hide-scrollbar">
        {TABS.map(tab => {
          const badge = tabBadge(tab.key, props)
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors -mb-px ${
                active
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                {tab.icon}
              </span>
              {tab.label}
              {badge !== null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="py-6">

        {/* ── Въпросник ─────────────────────────────────────────────── */}
        {activeTab === 'questionnaire' && (
          props.allQuestions.length === 0
            ? <Empty icon="quiz" text="Няма добавени въпроси към въпросника." />
            : (
              <div className="space-y-2">
                {props.allQuestions.map(q => {
                  const ans = answerMap.get(q.id)
                  return (
                    <div key={q.id} className="bg-white rounded-xl border border-gray-100 px-4 py-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Dot status={ans?.status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-700">{q.text}</p>
                          </div>
                          {ans?.text_content && (
                            <p className="text-sm text-gray-500 italic">{ans.text_content}</p>
                          )}
                          {ans?.media_url && (
                            <span className="text-xs text-indigo-500 flex items-center gap-1 mt-1">
                              <span className="material-symbols-outlined text-xs">
                                {ans.media_type === 'video' ? 'videocam' : ans.media_type === 'audio' ? 'mic' : 'image'}
                              </span>
                              Медия качена
                            </span>
                          )}
                        </div>
                        <Badge status={ans?.status} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )
        )}

        {/* ── Анкети ────────────────────────────────────────────────── */}
        {activeTab === 'polls' && (
          props.polls.length === 0
            ? <Empty icon="how_to_vote" text="Няма добавени анкети за класа." />
            : (
              <div className="space-y-3">
                {props.polls.map(poll => {
                  const vote = props.pollVotes.find(v => v.poll_id === poll.id)
                  return (
                    <div key={poll.id} className="bg-white rounded-xl border border-gray-100 px-4 py-4 shadow-sm">
                      <p className="text-sm font-medium text-gray-700 mb-2">{poll.question}</p>
                      {vote?.nominee ? (
                        <div className="flex items-center gap-2.5">
                          {vote.nominee.photo_url ? (
                            <img src={vote.nominee.photo_url} alt="" className="w-7 h-7 rounded-full object-cover border border-gray-100" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                              {vote.nominee.first_name[0]}
                            </div>
                          )}
                          <span className="text-sm text-gray-600">
                            {vote.nominee.first_name} {vote.nominee.last_name}
                          </span>
                          <span className="ml-auto text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full">Гласувал</span>
                        </div>
                      ) : (
                        <span className="text-xs bg-gray-50 text-gray-400 font-semibold px-2 py-0.5 rounded-full">Без глас</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )
        )}

        {/* ── Събития ───────────────────────────────────────────────── */}
        {activeTab === 'memories' && (
          props.events.length === 0
            ? <Empty icon="photo_album" text="Няма добавени събития." />
            : (
              <div className="space-y-3">
                {props.events.map(event => (
                  <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex gap-4 p-4">
                      {event.photos?.[0] ? (
                        <img src={event.photos[0]} alt={event.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-indigo-300">event</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700">{event.title}</p>
                        {event.event_date && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(event.event_date).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                        {event.myComment ? (
                          <div className="mt-2 bg-indigo-50 rounded-lg px-3 py-2">
                            <p className="text-xs text-indigo-700 italic">„{event.myComment.comment_text}"</p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 mt-1 italic">Без коментар</p>
                        )}
                      </div>
                      {event.myComment
                        ? <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full self-start flex-shrink-0">Коментирал</span>
                        : <span className="text-xs bg-gray-50 text-gray-400 font-semibold px-2 py-0.5 rounded-full self-start flex-shrink-0">Без коментар</span>
                      }
                    </div>
                  </div>
                ))}
              </div>
            )
        )}

        {/* ── Послания ──────────────────────────────────────────────── */}
        {activeTab === 'messages' && (
          props.peerMessages.length === 0
            ? <Empty icon="favorite" text="Не са изпратени послания до съученици." />
            : (
              <div className="space-y-3">
                {props.peerMessages.map(msg => (
                  <div key={msg.id} className="bg-white rounded-xl border border-gray-100 px-4 py-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      {msg.recipient?.photo_url ? (
                        <img src={msg.recipient.photo_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-100" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0">
                          {msg.recipient?.first_name?.[0] ?? '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 mb-1">
                          До: {msg.recipient?.first_name} {msg.recipient?.last_name}
                        </p>
                        <p className="text-sm text-gray-700 leading-snug">{msg.content}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        msg.status === 'approved' ? 'bg-green-50 text-green-700' :
                        msg.status === 'submitted' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-gray-50 text-gray-400'
                      }`}>
                        {msg.status === 'approved' ? 'Одобрено' : msg.status === 'submitted' ? 'За преглед' : 'Чернова'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
        )}

        {/* ── Анонимни въпроси ──────────────────────────────────────── */}
        {activeTab === 'voice' && (
          props.voiceQuestions.length === 0
            ? <Empty icon="record_voice_over" text="Няма анонимни въпроси за класа." />
            : (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5 mb-4">
                  <span className="material-symbols-outlined text-amber-500 text-base mt-0.5">lock</span>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Отговорите на анонимните въпроси са криптирани и не могат да се свържат с конкретен ученик — дори от модератора.
                  </p>
                </div>
                {props.voiceQuestions.map(q => {
                  const ans = answerMap.get(q.id)
                  const answered = !!(ans?.text_content || ans?.media_url)
                  return (
                    <div key={q.id} className="bg-white rounded-xl border border-gray-100 px-4 py-4 shadow-sm flex items-center gap-3">
                      <span className="material-symbols-outlined text-purple-300 text-base flex-shrink-0">record_voice_over</span>
                      <p className="text-sm text-gray-700 flex-1">{q.text}</p>
                      {answered
                        ? <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check</span>
                            Анонимно
                          </span>
                        : <span className="text-xs bg-gray-50 text-gray-400 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">Няма отговор</span>
                      }
                    </div>
                  )
                })}
              </div>
            )
        )}

      </div>
    </div>
  )
}
