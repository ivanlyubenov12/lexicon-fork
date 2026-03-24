'use client'

import { useTransition } from 'react'
import { setShowcaseOrder } from '../actions'

interface Props {
  classId: string
  currentOrder: number | null
  disabled?: boolean // true when all 3 slots taken and this class isn't in showcase
}

export default function ShowcaseToggle({ classId, currentOrder, disabled }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string) {
    const order = value === '' ? null : (parseInt(value) as 1 | 2 | 3)
    startTransition(async () => {
      await setShowcaseOrder(classId, order)
    })
  }

  return (
    <select
      value={currentOrder ?? ''}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending || (disabled && currentOrder === null)}
      className={`text-xs font-semibold border rounded-lg px-2 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
        currentOrder !== null
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
          : 'border-gray-200 bg-white text-gray-500'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <option value="">— не е в showcase</option>
      <option value="1">Позиция 1</option>
      <option value="2">Позиция 2</option>
      <option value="3">Позиция 3</option>
    </select>
  )
}
