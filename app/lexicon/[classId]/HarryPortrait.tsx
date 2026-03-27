'use client'

import { useRef, useState } from 'react'

interface Message {
  content: string
  authorName: string
}

interface Props {
  src: string | null
  alt: string
  initials?: string
  variant?: 'portrait' | 'circle'
  className?: string
  messages?: Message[]
}

// Dust particles — scattered around the portrait
const PARTICLES = [
  { w: 2, h: 2, x: 10, y: 25, delay: 0.0, dur: 4.0, drift:  10, color: 'rgba(255,220,100,0.55)' },
  { w: 2, h: 2, x: 85, y: 40, delay: 1.1, dur: 3.5, drift:  -8, color: 'rgba(255,255,255,0.45)' },
  { w: 3, h: 3, x: 55, y: 80, delay: 2.0, dur: 4.5, drift:  12, color: 'rgba(180,160,255,0.50)' },
  { w: 2, h: 2, x: 22, y: 65, delay: 0.5, dur: 3.8, drift:  -9, color: 'rgba(255,220,100,0.45)' },
  { w: 2, h: 2, x: 70, y: 10, delay: 1.6, dur: 3.6, drift:   8, color: 'rgba(255,255,255,0.40)' },
  { w: 2, h: 2, x: 40, y: 92, delay: 0.8, dur: 4.2, drift: -10, color: 'rgba(180,160,255,0.45)' },
]

const KEYFRAMES = `
@keyframes hp-float {
  0%,100% { transform: translateY(0px)   rotateZ(-0.2deg); }
  50%     { transform: translateY(-4px)  rotateZ(0.2deg);  }
}
@keyframes hp-dust {
  0%   { transform: translateY(0px)   translateX(0px)   scale(1);    opacity: 0;   }
  15%  { opacity: 1; }
  80%  { opacity: 0.9; }
  100% { transform: translateY(-28px) translateX(var(--drift)) scale(0.4); opacity: 0; }
}
@keyframes hp-iris {
  0%,100% { filter: hue-rotate(0deg)   brightness(1);    }
  25%     { filter: hue-rotate(20deg)  brightness(1.05); }
  50%     { filter: hue-rotate(-10deg) brightness(1.08); }
  75%     { filter: hue-rotate(15deg)  brightness(1.03); }
}
`

export default function HarryPortrait({
  src, alt, initials = '?', variant = 'portrait', className = '', messages = [],
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef       = useRef<number | null>(null)
  const flippedRef   = useRef(false)

  const [tilt,    setTilt]    = useState({ x: 0, y: 0 })
  const [shimmer, setShimmer] = useState({ x: 50, y: 50, opacity: 0 })
  const [active,  setActive]  = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [shownMessage, setShownMessage] = useState<Message | null>(null)

  const maxTilt  = variant === 'circle' ? 8 : 12
  const isCircle = variant === 'circle'
  const radius   = isCircle ? '9999px' : '1rem'
  const hueShift = tilt.y * 1.2
  const satBoost = active ? 1.15 : 1

  function applyMove(clientX: number, clientY: number) {
    if (flippedRef.current) return
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = (clientX - rect.left - rect.width  / 2) / (rect.width  / 2)
    const dy = (clientY - rect.top  - rect.height / 2) / (rect.height / 2)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      setTilt({ x: -dy * maxTilt, y: dx * maxTilt })
      setShimmer({
        x: ((clientX - rect.left) / rect.width)  * 100,
        y: ((clientY - rect.top)  / rect.height) * 100,
        opacity: 0.14,
      })
      setActive(true)
    })
  }

  function resetMove() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setTilt({ x: 0, y: 0 })
    setShimmer(s => ({ ...s, opacity: 0 }))
    setActive(false)
  }

  function handleClick() {
    if (messages.length === 0) return
    const next = !flippedRef.current
    flippedRef.current = next
    if (next) {
      setShownMessage(messages[Math.floor(Math.random() * messages.length)])
      resetMove()
    }
    setFlipped(next)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={e => applyMove(e.clientX, e.clientY)}
      onMouseLeave={resetMove}
      onTouchMove={e => { e.preventDefault(); applyMove(e.touches[0].clientX, e.touches[0].clientY) }}
      onTouchEnd={resetMove}
      onClick={handleClick}
      className={`relative select-none ${messages.length > 0 ? 'cursor-pointer' : ''} ${className}`}
      style={{ perspective: '700px' }}
    >
      <style>{KEYFRAMES}</style>

      {/* ── Flipper ───────────────────────────────────────────────────── */}
      <div
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          position: 'relative',
        }}
      >

        {/* ── FRONT FACE ───────────────────────────────────────────────── */}
        <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' as 'hidden' }}>

          {/* Float layer */}
          <div style={{ animation: 'hp-float 6s ease-in-out infinite', transformStyle: 'preserve-3d' }}>

            {/* Tilt layer */}
            <div
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${active ? 1.02 : 1})`,
                transition: active
                  ? 'transform 0.07s linear'
                  : 'transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)',
                transformStyle: 'preserve-3d',
                borderRadius: radius,
                overflow: 'hidden',
              }}
            >
              {/* Photo or initials */}
              {src ? (
                <img
                  src={src}
                  alt={alt}
                  draggable={false}
                  style={{ filter: `hue-rotate(${hueShift}deg) saturate(${satBoost})`, transition: 'filter 0.1s' }}
                  className={isCircle ? 'w-full h-full object-cover block' : 'w-full aspect-[3/4] object-cover block'}
                />
              ) : (
                <div
                  className={`bg-[#e2dfff] flex items-center justify-center ${isCircle ? 'w-full h-full' : 'w-full aspect-[3/4]'}`}
                  style={{ animation: 'hp-iris 8s ease-in-out infinite' }}
                >
                  <span className="text-[#3632b7] font-bold" style={{ fontSize: isCircle ? '1.5rem' : '5rem', fontFamily: 'Noto Serif, serif' }}>
                    {initials}
                  </span>
                </div>
              )}

              {/* Shimmer */}
              <div
                aria-hidden
                style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: radius,
                  background: `radial-gradient(circle at ${shimmer.x}% ${shimmer.y}%, rgba(255,255,255,0.9) 0%, rgba(255,240,180,0.4) 25%, transparent 55%)`,
                  opacity: shimmer.opacity,
                  transition: active ? 'opacity 0.05s' : 'opacity 0.4s ease',
                  mixBlendMode: 'screen',
                }}
              />

              {/* Holographic rainbow layer */}
              <div
                aria-hidden
                style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: radius,
                  background: `linear-gradient(${125 + tilt.y * 3}deg,
                    rgba(255,100,100,0.0) 0%,
                    rgba(255,180,50,0.12) 20%,
                    rgba(100,255,150,0.10) 40%,
                    rgba(80,160,255,0.12) 60%,
                    rgba(200,100,255,0.10) 80%,
                    rgba(255,100,150,0.0) 100%)`,
                  opacity: active ? 0.45 : 0,
                  transition: active ? 'opacity 0.1s' : 'opacity 0.5s ease',
                  mixBlendMode: 'overlay',
                }}
              />

              {/* Vignette depth */}
              {!isCircle && (
                <div
                  aria-hidden
                  style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.25) 100%)',
                  }}
                />
              )}

              {/* Flip hint badge */}
              {messages.length > 0 && (
                <div
                  aria-hidden
                  style={{
                    position: 'absolute', bottom: 8, right: 8, pointerEvents: 'none',
                    background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)',
                    borderRadius: '50%', width: 22, height: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span style={{ color: 'rgba(255,220,120,0.9)', fontSize: 11, lineHeight: 1 }}>✦</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── BACK FACE ────────────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' as 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: radius,
            overflow: 'hidden',
          }}
        >
          <div
            className={isCircle ? 'w-full h-full' : 'w-full aspect-[3/4]'}
            style={{
              background: 'linear-gradient(160deg, #12082e 0%, #2a1760 45%, #12082e 100%)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: isCircle ? '0.75rem' : '1.4rem 1.2rem',
              position: 'relative',
            }}
          >
            {/* Ambient glow blobs */}
            <div aria-hidden style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: [
                'radial-gradient(ellipse at 25% 20%, rgba(160,130,255,0.18) 0%, transparent 55%)',
                'radial-gradient(ellipse at 75% 80%, rgba(255,200,80,0.10) 0%, transparent 50%)',
              ].join(', '),
            }} />

            {shownMessage && (
              <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
                {/* Opening quote */}
                <div style={{
                  fontSize: isCircle ? '2rem' : '4.5rem',
                  lineHeight: 0.7,
                  color: 'rgba(200,169,110,0.65)',
                  fontFamily: 'Georgia, serif',
                  marginBottom: '0.6rem',
                  userSelect: 'none',
                }}>&#8220;</div>

                {/* Message text */}
                <p style={{
                  color: 'rgba(240,235,255,0.95)',
                  fontSize: isCircle ? '0.65rem' : '1.15rem',
                  fontFamily: 'Noto Serif, serif',
                  fontStyle: 'italic',
                  lineHeight: 1.65,
                  marginBottom: '1.1rem',
                }}>
                  {shownMessage.content}
                </p>

                {/* Author */}
                <p style={{
                  color: 'rgba(200,169,110,0.90)',
                  fontSize: isCircle ? '0.55rem' : '0.9rem',
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}>
                  — {shownMessage.authorName}
                </p>
              </div>
            )}

            {/* Back-flip hint */}
            <div style={{
              position: 'absolute', bottom: 8,
              color: 'rgba(255,255,255,0.22)',
              fontSize: '0.55rem',
              fontFamily: 'Manrope, sans-serif',
              letterSpacing: '0.06em',
              userSelect: 'none',
            }}>
              натисни за обратно
            </div>
          </div>
        </div>

      </div>{/* /flipper */}

      {/* ── Dust particles (front only) ──────────────────────────────── */}
      {!flipped && PARTICLES.map((p, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top:  `${p.y}%`,
            width:  p.w,
            height: p.h,
            borderRadius: '50%',
            background: p.color,
            pointerEvents: 'none',
            '--drift': `${p.drift}px`,
            animation: `hp-dust ${p.dur}s ${p.delay}s ease-in infinite`,
            boxShadow: `0 0 ${p.w * 2}px ${p.color}`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
