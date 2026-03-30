export type Plan = 'free' | 'basic' | 'pro'

export const PLANS: Record<Plan, { label: string; color: string; bg: string; ribbon: string }> = {
  free:  { label: 'Free',  color: 'text-gray-500',   bg: 'bg-gray-100',    ribbon: 'bg-gray-400' },
  basic: { label: 'Basic', color: 'text-blue-600',   bg: 'bg-blue-100',    ribbon: 'bg-blue-500' },
  pro:   { label: 'Pro',   color: 'text-indigo-700', bg: 'bg-indigo-100',  ribbon: 'bg-indigo-600' },
}

/** Normalise legacy 'premium' → 'pro', null → 'free' */
export function normalisePlan(raw: string | null | undefined): Plan {
  if (raw === 'premium') return 'pro'
  if (raw === 'basic') return 'basic'
  if (raw === 'pro') return 'pro'
  return 'free'
}
