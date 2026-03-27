'use client'

import { useRef, useState } from 'react'

/** Converts yyyy-mm-dd → dd.mm.yyyy (display) */
function isoToDisplay(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}.${m}.${y}`
}

/** Converts dd.mm.yyyy → yyyy-mm-dd (ISO). Returns '' if incomplete. */
function displayToIso(display: string): string {
  const clean = display.replace(/[^\d.]/g, '')
  const parts = clean.split('.')
  if (parts.length !== 3) return ''
  const [d, m, y] = parts
  if (d.length !== 2 || m.length !== 2 || y.length !== 4) return ''
  return `${y}-${m}-${d}`
}

/** Auto-inserts dots while typing (e.g. "2" → "2", "21" → "21.", "2103" → "21.03.", etc.) */
function autoFormat(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  let out = ''
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) out += '.'
    out += digits[i]
  }
  return out
}

interface Props {
  value: string            // yyyy-mm-dd or ''
  onChange: (iso: string) => void
  className?: string
  disabled?: boolean
  placeholder?: string
}

export default function DateInput({ value, onChange, className = '', disabled, placeholder = 'дд.мм.гггг' }: Props) {
  const [text, setText] = useState(() => isoToDisplay(value))
  const hiddenRef = useRef<HTMLInputElement>(null)

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = autoFormat(e.target.value)
    setText(formatted)
    const iso = displayToIso(formatted)
    if (iso) onChange(iso)
    else if (formatted === '') onChange('')
  }

  function handleBlur() {
    // Re-sync display from ISO in case of partial input
    const iso = displayToIso(text)
    if (iso) {
      setText(isoToDisplay(iso))
      onChange(iso)
    } else if (text !== '') {
      // invalid — clear
      setText('')
      onChange('')
    }
  }

  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const iso = e.target.value
    setText(isoToDisplay(iso))
    onChange(iso)
  }

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        value={text}
        onChange={handleTextChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={10}
        inputMode="numeric"
        className={`pr-9 ${className}`}
      />
      {/* Hidden native date picker — opens on calendar icon click */}
      <input
        ref={hiddenRef}
        type="date"
        lang="bg"
        value={displayToIso(text) || ''}
        onChange={handlePickerChange}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => hiddenRef.current?.showPicker?.()}
        className="absolute right-2.5 text-gray-400 hover:text-indigo-500 transition-colors disabled:opacity-40"
        tabIndex={-1}
        aria-label="Избери дата"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_month</span>
      </button>
    </div>
  )
}
