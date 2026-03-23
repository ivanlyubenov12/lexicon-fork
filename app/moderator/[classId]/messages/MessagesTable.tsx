'use client'

import { useState } from 'react'
import MessageActions from './MessageActions'

export interface Message {
  id: string
  content: string
  status: string
  created_at: string
  recipient: { first_name: string; last_name: string }
  author: { first_name: string; last_name: string }
}

interface Props {
  messages: Message[]
  classId: string
}

type FilterTab = 'all' | 'pending' | 'approved'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

export default function MessagesTable({ messages, classId }: Props) {
  const [filter, setFilter] = useState<FilterTab>('pending')

  const filtered = messages.filter((m) => {
    if (filter === 'all') return true
    if (filter === 'pending') return m.status === 'pending'
    if (filter === 'approved') return m.status === 'approved'
    return true
  })

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'Всички' },
    { key: 'pending', label: 'Чакащи' },
    { key: 'approved', label: 'Одобрени' },
  ]

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={
              filter === tab.key
                ? 'pb-3 border-b-2 border-indigo-600 text-indigo-600 font-semibold text-sm'
                : 'pb-3 text-gray-500 hover:text-gray-700 text-sm'
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty states */}
      {messages.length === 0 ? (
        <div className="text-center py-16 text-gray-500">Няма послания</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {filter === 'pending' ? 'Няма чакащи послания' : 'Няма послания'}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  От
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  До
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Послание
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Дата
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((message) => {
                const preview =
                  message.content.length > 120
                    ? message.content.slice(0, 120) + '...'
                    : message.content

                return (
                  <tr key={message.id} className="border-t border-gray-100 hover:bg-gray-50">
                    {/* От */}
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {message.author.first_name} {message.author.last_name}
                    </td>

                    {/* До */}
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {message.recipient.first_name} {message.recipient.last_name}
                    </td>

                    {/* Послание */}
                    <td className="px-4 py-3 text-gray-700 max-w-[300px]">
                      {preview}
                    </td>

                    {/* Дата */}
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(message.created_at)}
                    </td>

                    {/* Действия */}
                    <td className="px-4 py-3">
                      <MessageActions message={message} classId={classId} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
