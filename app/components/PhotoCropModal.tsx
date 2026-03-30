'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

// 35mm × 45mm document photo ratio
const ASPECT = 35 / 45

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  // Output at 2× for retina clarity, capped at 1000px to stay under Vercel's 4.5MB request limit
  const MAX_DIM = 1000
  const rawW = pixelCrop.width * 2
  const rawH = pixelCrop.height * 2
  const scale = Math.min(1, MAX_DIM / Math.max(rawW, rawH))
  const outputW = Math.round(rawW * scale)
  const outputH = Math.round(rawH * scale)
  canvas.width  = outputW
  canvas.height = outputH

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    img,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, outputW, outputH,
  )

  return new Promise((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas is empty')), 'image/jpeg', 0.85)
  )
}

interface Props {
  imageSrc: string          // data URL of the selected file
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

export default function PhotoCropModal({ imageSrc, onConfirm, onCancel }: Props) {
  const [crop, setCrop]   = useState({ x: 0, y: 0 })
  const [zoom, setZoom]   = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels)
  }, [])

  async function handleConfirm() {
    if (!croppedArea) return
    const blob = await getCroppedBlob(imageSrc, croppedArea)
    onConfirm(blob)
  }

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" style={{ fontFamily: 'Manrope, sans-serif' }}>

        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h3 className="font-bold text-gray-800 text-base">Изрежи снимката</h3>
          <p className="text-xs text-gray-400 mt-0.5">Формат за документи 35 × 45 mm</p>
        </div>

        {/* Cropper area */}
        <div className="relative bg-gray-900" style={{ height: 320 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={false}
            style={{
              cropAreaStyle: {
                border: '2px solid rgba(99,102,241,0.8)',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-5 pt-4 pb-1 flex items-center gap-3">
          <span className="material-symbols-outlined text-gray-400 text-base">zoom_out</span>
          <input
            type="range"
            min={1} max={3} step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 accent-indigo-600 h-1.5"
          />
          <span className="material-symbols-outlined text-gray-400 text-base">zoom_in</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 py-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Отказ
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
          >
            Приложи
          </button>
        </div>
      </div>
    </div>
  )
}
