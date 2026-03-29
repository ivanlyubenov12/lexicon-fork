/**
 * Repeating background wallpaper for the Levski Sofia theme.
 * Football elements in blue tones — rendered behind all content at low opacity.
 */
export default function LevskiPattern() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ opacity: 0.09 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <pattern id="levski-bg" x="0" y="0" width="600" height="600" patternUnits="userSpaceOnUse">

            {/* ── FOOTBALL — top-left ── */}
            <g transform="translate(60, 70) rotate(-15, 40, 40)">
              <circle cx="40" cy="40" r="38" fill="none" stroke="#1A3D8F" strokeWidth="3" />
              <circle cx="40" cy="40" r="38" fill="#1A3D8F" opacity="0.08" />
              {/* Pentagon patches */}
              <polygon points="40,10 52,20 48,34 32,34 28,20" fill="#1A3D8F" opacity="0.7" />
              <polygon points="62,28 72,38 66,52 54,48 52,34" fill="#1A3D8F" opacity="0.5" />
              <polygon points="60,56 62,70 48,76 38,66 48,54" fill="#1A3D8F" opacity="0.7" />
              <polygon points="20,56 32,66 22,76 8,70 10,56" fill="#1A3D8F" opacity="0.5" />
              <polygon points="18,28 28,34 26,48 14,52 8,38" fill="#1A3D8F" opacity="0.7" />
            </g>

            {/* ── LEVSKI LAMBDA — top-right ── */}
            <g transform="translate(430, 30) scale(1.4)" opacity="0.35">
              <polygon points="40,0 55,0 30,50 15,50" fill="#1A3D8F" />
              <polygon points="55,0 70,0 70,12 55,12" fill="#1A3D8F" />
            </g>

            {/* ── TROPHY CUP — center-right ── */}
            <g transform="translate(470, 200)" opacity="0.25">
              <rect x="22" y="60" width="16" height="10" fill="#1A3D8F" />
              <rect x="14" y="70" width="32" height="8" rx="2" fill="#1A3D8F" />
              <path d="M10,10 Q10,50 30,55 Q50,50 50,10 Z" fill="#1A3D8F" />
              <path d="M10,18 Q0,20 2,35 Q6,42 14,38" fill="none" stroke="#1A3D8F" strokeWidth="5" strokeLinecap="round" />
              <path d="M50,18 Q60,20 58,35 Q54,42 46,38" fill="none" stroke="#1A3D8F" strokeWidth="5" strokeLinecap="round" />
            </g>

            {/* ── FOOTBALL BOOT — bottom-left ── */}
            <g transform="translate(40, 390) rotate(20, 50, 50)" opacity="0.3">
              <path d="M20,20 L20,70 Q20,85 35,85 L75,85 Q85,85 85,75 L85,65 Q65,60 60,50 L60,20 Z" fill="#1A3D8F" />
              <rect x="15" y="15" width="50" height="12" rx="4" fill="#2952B3" />
              {/* Laces */}
              <line x1="32" y1="50" x2="58" y2="50" stroke="white" strokeWidth="2" opacity="0.6" />
              <line x1="32" y1="57" x2="58" y2="57" stroke="white" strokeWidth="2" opacity="0.6" />
              <line x1="32" y1="64" x2="58" y2="64" stroke="white" strokeWidth="2" opacity="0.6" />
              {/* Studs */}
              <circle cx="35" cy="82" r="4" fill="#0E2566" />
              <circle cx="50" cy="82" r="4" fill="#0E2566" />
              <circle cx="65" cy="82" r="4" fill="#0E2566" />
            </g>

            {/* ── STAR ── top-center ── */}
            <g transform="translate(260, 40)" opacity="0.3">
              <polygon points="20,0 24,14 38,14 27,22 31,36 20,28 9,36 13,22 2,14 16,14" fill="#FFD700" />
            </g>

            {/* ── WHISTLE — center ── */}
            <g transform="translate(240, 260) rotate(-30, 30, 30)" opacity="0.2">
              <circle cx="30" cy="30" r="20" fill="none" stroke="#1A3D8F" strokeWidth="5" />
              <circle cx="30" cy="30" r="10" fill="#1A3D8F" opacity="0.3" />
              <rect x="48" y="25" width="30" height="10" rx="5" fill="#1A3D8F" />
              <line x1="30" y1="0" x2="30" y2="10" stroke="#1A3D8F" strokeWidth="3" />
            </g>

            {/* ── SECOND FOOTBALL — bottom-right ── */}
            <g transform="translate(460, 460) rotate(10, 40, 40)" opacity="0.5">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#1A3D8F" strokeWidth="2.5" />
              <circle cx="40" cy="40" r="32" fill="#1A3D8F" opacity="0.07" />
              <polygon points="40,12 50,20 47,32 33,32 30,20" fill="#1A3D8F" opacity="0.6" />
              <polygon points="60,26 68,36 63,48 52,44 50,32" fill="#1A3D8F" opacity="0.4" />
              <polygon points="58,52 60,64 47,70 38,61 47,50" fill="#1A3D8F" opacity="0.6" />
              <polygon points="22,52 32,62 23,70 11,64 12,52" fill="#1A3D8F" opacity="0.4" />
              <polygon points="20,26 30,32 28,44 17,48 12,36" fill="#1A3D8F" opacity="0.6" />
            </g>

            {/* ── FLAG CORNER — center-left ── */}
            <g transform="translate(80, 270)" opacity="0.25">
              <line x1="10" y1="0" x2="10" y2="80" stroke="#1A3D8F" strokeWidth="3" strokeLinecap="round" />
              <polygon points="10,0 50,15 10,30" fill="#1A3D8F" />
            </g>

            {/* ── SECOND LAMBDA — bottom-center ── */}
            <g transform="translate(240, 490) scale(1.0)" opacity="0.22">
              <polygon points="40,0 55,0 30,50 15,50" fill="#1A3D8F" />
              <polygon points="55,0 70,0 70,12 55,12" fill="#1A3D8F" />
            </g>

            {/* ── STAR bottom-left area ── */}
            <g transform="translate(160, 460)" opacity="0.25">
              <polygon points="16,0 19,11 30,11 21,17 24,28 16,22 8,28 11,17 2,11 13,11" fill="#FFD700" />
            </g>

            {/* ── STAR top-right area ── */}
            <g transform="translate(370, 80)" opacity="0.25">
              <polygon points="16,0 19,11 30,11 21,17 24,28 16,22 8,28 11,17 2,11 13,11" fill="#FFD700" />
            </g>

          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#levski-bg)" />
      </svg>
    </div>
  )
}
