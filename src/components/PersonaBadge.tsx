import type { Scenario } from '../content/schema'
import { PERSONA_META } from './personas'

export function PersonaBadge({ persona }: { persona: Scenario['persona'] }) {
  const meta = PERSONA_META[persona]
  const Icon = meta.icon
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-embl-green-lightest px-3 py-1 text-sm font-semibold text-embl-green-darkest">
      <Icon className="h-4 w-4" aria-hidden="true" />
      {meta.label}
    </span>
  )
}
