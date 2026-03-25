'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminUnpublishClass, adminPublishClass } from '../actions'

export default function PublishToggle({ classId, isPublished }: { classId: string; isPublished: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    const msg = isPublished
      ? 'Лексиконът ще стане недостъпен. Продължи?'
      : 'Публикувай лексикона без плащане?'
    if (!confirm(msg)) return
    setLoading(true)
    const result = isPublished
      ? await adminUnpublishClass(classId)
      : await adminPublishClass(classId)
    setLoading(false)
    if (!result.error) router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 ${
        isPublished
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-green-50 text-green-600 hover:bg-green-100'
      }`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
        {isPublished ? 'unpublished' : 'publish'}
      </span>
      {loading ? '...' : isPublished ? 'Unpublish' : 'Publish'}
    </button>
  )
}
