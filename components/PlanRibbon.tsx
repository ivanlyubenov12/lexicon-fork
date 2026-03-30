import { normalisePlan, PLANS } from '@/lib/plans'

export default function PlanRibbon({ plan }: { plan: string | null | undefined }) {
  const p = normalisePlan(plan)
  if (p === 'free') return null
  const meta = PLANS[p]
  return (
    <div className="absolute top-0 right-0 overflow-hidden w-20 h-20 pointer-events-none">
      <div
        className={`${meta.ribbon} text-white text-[10px] font-bold uppercase tracking-widest
          absolute top-4 right-[-22px] w-24 text-center py-1
          rotate-45 shadow-sm`}
      >
        {meta.label}
      </div>
    </div>
  )
}
