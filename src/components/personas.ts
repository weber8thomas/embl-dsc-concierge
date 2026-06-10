import { Beaker, FlaskConical, GraduationCap, Microscope, Users, type LucideIcon } from 'lucide-react'
import type { Scenario } from '../content/schema'

type Persona = Scenario['persona']

/** Human label + icon for each persona. Icon (not colour) carries the meaning. */
export const PERSONA_META: Record<Persona, { label: string; icon: LucideIcon }> = {
  predoc: { label: 'PhD student', icon: GraduationCap },
  postdoc: { label: 'Postdoc', icon: FlaskConical },
  staff: { label: 'Staff', icon: Users },
  PI: { label: 'Group leader', icon: Beaker },
  'core-facility': { label: 'Core facility', icon: Microscope },
}
