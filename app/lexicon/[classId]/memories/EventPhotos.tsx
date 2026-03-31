'use client'

import { useState } from 'react'

export default function EventPhotos({ photos }: { photos: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (photos.length === 0) return null

  function prev() {
    setLightbox(i => (i === null ? null : (i - 1 + photos.length) % photos.length))
  }
  function next() {
    setLightbox(i => (i === null ? null : (i + 1) % photos.length))
  }

  return (
    <>
      {/* Thumbnail strip */}
      <div className="flex gap-1">
        {photos.map((url, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className="flex-1 min-w-0 overflow-hidden bg-gray-100 focus:outline-none hover:opacity-90 transition-opacity"
            style={{ height: 180 }}
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              className="absolute left-4 text-white/70 hover:text-white"
              onClick={e => { e.stopPropagation(); prev() }}
            >
              <span className="material-symbols-outlined text-4xl">chevron_left</span>
            </button>
          )}

          {/* Image */}
          <img
            src={photos[lightbox]}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          {/* Next */}
          {photos.length > 1 && (
            <button
              className="absolute right-4 text-white/70 hover:text-white"
              onClick={e => { e.stopPropagation(); next() }}
            >
              <span className="material-symbols-outlined text-4xl">chevron_right</span>
            </button>
          )}

          {/* Counter */}
          {photos.length > 1 && (
            <p className="absolute bottom-4 text-white/50 text-sm">
              {lightbox + 1} / {photos.length}
            </p>
          )}
        </div>
      )}
    </>
  )
}
