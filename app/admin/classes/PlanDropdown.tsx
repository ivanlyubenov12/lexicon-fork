'use client'

import { useTransition } from 'react'
import { updateClassPlan } from '../actions'
import { normalisePlan, PLANS, type Plan } from '@/lib/plans'

const PLAN_OPTIONS: Plan[] = ['free', 'basic', 'pro']

export default function PlanDropdown({ classId, plan }: { classId: string; plan: string | null }) {
  const [isPending, startTransition] = useTransition()
  const current = normalisePlan(plan)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Plan
    startTransition(() => updateClassPlan(classId, next))
  }

  const meta = PLANS[current]

  return (
    <div className="relative inline-flex items-center">
      <select
        value={current}
        onChange={handleChange}
        disabled={isPending}
        className={`appearance-none text-xs font-bold pl-2.5 pr-6 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 transition-colors ${meta.bg} ${meta.color}`}
      >
        {PLAN_OPTIONS.map(p => (
          <option key={p} value={p}>{PLANS[p].label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-1.5 text-current opacity-60" style={{ fontSize: 12 }}>▾</span>
    </div>
  )
}
