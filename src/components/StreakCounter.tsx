import { Flame } from 'lucide-react'

export function StreakCounter({ streak }: { streak: number }) {
  const active = streak > 0
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
        active ? 'bg-embl-green text-white' : 'bg-embl-grey-lightest text-embl-grey-dark'
      }`}
      aria-label={`Current streak: ${streak}`}
    >
      <Flame className="h-4 w-4" aria-hidden="true" />
      {streak}
    </span>
  )
}
