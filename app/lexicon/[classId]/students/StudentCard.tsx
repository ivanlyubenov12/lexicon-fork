'use client'

import Link from 'next/link'

interface Props {
  student: { id: string; first_name: string; last_name: string; photo_url: string | null }
  classId: string
  basePath?: string
}

function cardRotation(id: string): string {
  const n = parseInt(id.replace(/-/g, '').slice(0, 4), 16) % 7
  return `rotate(${n - 3}deg)` // -3 to +3 degrees
}

export default function StudentCard({ student, classId, basePath }: Props) {
  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase()
  const base = basePath ?? `/lexicon/${classId}`
  const rotation = cardRotation(student.id)

  return (
    <Link href={`${base}/student/${student.id}`} className="group relative pt-5 block">
      {/* Washi tape */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-4 tape-overlay z-10 pointer-events-none" />

      {/* Polaroid card */}
      <div
        className="bg-surface-container-lowest p-3 polaroid-frame transition-transform duration-500 group-hover:rotate-0 group-hover:-translate-y-1"
        style={{ transform: rotation }}
      >
        {/* Photo */}
        <div className="aspect-[4/5] overflow-hidden bg-surface-container">
          {student.photo_url ? (
            <img
              src={student.photo_url}
              alt={student.first_name}
              className="w-full h-full object-cover grayscale-0 group-hover:grayscale transition-all duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
              <span className="font-headline text-3xl font-bold text-on-surface-variant">{initials}</span>
            </div>
          )}
        </div>

        {/* Name */}
        <div className="mt-4 pb-1">
          <h4 className="font-headline text-base font-bold text-on-surface leading-tight">
            {student.first_name} {student.last_name}
          </h4>
        </div>
      </div>
    </Link>
  )
}
