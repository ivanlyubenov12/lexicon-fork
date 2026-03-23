'use client'

import { useState } from 'react'
import Image from 'next/image'
import { saveSuperhero } from '../actions'

interface Props {
  classId: string
  answers: string[]
  savedPrompt: string | null
  savedImageUrl: string | null
}

export default function SuperheroEditor({ classId, answers, savedPrompt, savedImageUrl }: Props) {
  const [prompt, setPrompt] = useState(savedPrompt ?? '')
  const [imageUrl, setImageUrl] = useState(savedImageUrl ?? '')
  const [generatingPrompt, setGeneratingPrompt] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGeneratePrompt() {
    setError(null)
    setGeneratingPrompt(true)
    try {
      const res = await fetch('/api/superhero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-prompt', answers }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPrompt(data.prompt)
      setSaved(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Грешка при генериране.')
    } finally {
      setGeneratingPrompt(false)
    }
  }

  async function handleGenerateImage() {
    if (!prompt.trim()) return
    setError(null)
    setGeneratingImage(true)
    try {
      const res = await fetch('/api/superhero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-image', prompt }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setImageUrl(data.imageUrl)
      setSaved(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Грешка при генериране на изображение.')
    } finally {
      setGeneratingImage(false)
    }
  }

  async function handleSave() {
    if (!prompt.trim() || !imageUrl) return
    setSaving(true)
    setError(null)
    const result = await saveSuperhero(classId, prompt, imageUrl)
    setSaving(false)
    if (result.error) setError(result.error)
    else setSaved(true)
  }

  return (
    <div className="space-y-8">

      {/* Student answers */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Одобрени отговори ({answers.length})
        </h2>
        {answers.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3 rounded-lg">
            Няма одобрени отговори за супергерой въпроса все още.
          </div>
        ) : (
          <div className="space-y-2">
            {answers.map((answer, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700">
                {answer}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate prompt */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Описание за AI изображение</h2>
          <button
            onClick={handleGeneratePrompt}
            disabled={generatingPrompt || answers.length === 0}
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generatingPrompt ? 'Генерира се...' : '✨ Генерирай с Claude'}
          </button>
        </div>
        <textarea
          rows={4}
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setSaved(false) }}
          placeholder="Описанието ще се появи тук. Можеш да го редактираш преди да генерираш изображение."
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
      </div>

      {/* Generate image */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Илюстрация</h2>
          <button
            onClick={handleGenerateImage}
            disabled={generatingImage || !prompt.trim()}
            className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generatingImage ? 'Генерира се (~20 сек)...' : '🎨 Генерирай с DALL-E'}
          </button>
        </div>

        {generatingImage && (
          <div className="flex items-center justify-center h-64 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-400 text-sm">
            Генерира се изображение, моля изчакайте...
          </div>
        )}

        {imageUrl && !generatingImage && (
          <div className="relative w-full aspect-square max-w-md rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <Image src={imageUrl} alt="Супергерой" fill className="object-cover" unoptimized />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Save */}
      {prompt && imageUrl && (
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Запазва се...' : saved ? 'Запазено ✓' : 'Запази'}
          </button>
          {saved && (
            <span className="text-sm text-green-600">Супергероят е запазен успешно.</span>
          )}
        </div>
      )}
    </div>
  )
}
