import { z } from 'zod'

/**
 * Schema + types for the single human-editable content file (public/content.yaml).
 *
 * Free of browser/Node-specific imports so it is shared by the runtime loader
 * (loadContent.ts), the `npm run validate` CLI and the `npm run catalog` builder.
 */

// Personas are a small controlled vocabulary (label + icon in components/personas.ts).
// "fellow" groups predocs and postdocs, EMBL's usual umbrella term for them.
export const PERSONAS = ['fellow', 'staff', 'PI', 'core-facility'] as const
export const DIFFICULTIES = ['easy', 'boundary', 'hard'] as const

/** Editors write yes/no; coerce to a boolean with a friendly error otherwise. */
const dataScienceSchema = z.preprocess((v) => {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    if (s === 'yes' || s === 'true') return true
    if (s === 'no' || s === 'false') return false
  }
  return v
}, z.boolean({ invalid_type_error: 'must be yes or no', required_error: 'must be yes or no' }))

export const pillarSchema = z
  .object({ name: z.string().min(1), blurb: z.string().optional(), icon: z.string().optional() })
  .strict()

export const competencySchema = z.object({ label: z.string().min(1) }).strict()

export const teamSchema = z
  .object({
    name: z.string().min(1),
    kind: z.enum(['dsc', 'external']),
    blurb: z.string().optional(),
    icon: z.string().optional(),
    pillars: z.array(z.string()).optional(),
    link: z.string().url().optional(),
    ticket: z.string().url().optional(),
    mattermost: z.string().url().optional(),
  })
  .strict()

export const memberSchema = z
  .object({
    name: z.string().min(1),
    position: z.string().optional(),
    team: z.string().min(1),
    competencies: z.array(z.string()).optional(),
    /** Photo URL (e.g. content.embl.org). Optional — a fallback avatar is shown. */
    photo: z.string().url().optional(),
  })
  .strict()

export const platformSchema = z
  .object({
    name: z.string().min(1),
    category: z.string().optional(),
    blurb: z.string().optional(),
    url: z.string().url().optional(),
    pillars: z.array(z.string()).optional(),
  })
  .strict()

export const trainingSchema = z
  .object({
    name: z.string().min(1),
    blurb: z.string().optional(),
    url: z.string().url().optional(),
    pillars: z.array(z.string()).optional(),
  })
  .strict()

export const serviceSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    blurb: z.string().optional(),
    team: z.string().optional(),
    /** Link may be an empty string until provided later. */
    link: z.union([z.literal(''), z.string().url()]).optional(),
  })
  .strict()

export const scenarioSchema = z
  .object({
    id: z.string().min(1),
    persona: z.enum(PERSONAS),
    question: z.string().min(1),
    data_science: dataScienceSchema,
    /** Must reference a key under `teams:`; cross-checked in buildContent. */
    team: z.string().min(1),
    /** Competency tags used to surface matching people; must exist under `competencies:`. */
    needs: z.array(z.string()).optional(),
    why: z.string().min(1),
    image: z.string().optional(),
    difficulty: z.enum(DIFFICULTIES).optional(),
  })
  .strict()

export const contentSchema = z
  .object({
    pillars: z.record(z.string(), pillarSchema).optional(),
    competencies: z.record(z.string(), competencySchema).optional(),
    teams: z.record(z.string(), teamSchema),
    members: z.record(z.string(), memberSchema).optional(),
    platforms: z.record(z.string(), platformSchema).optional(),
    training: z.record(z.string(), trainingSchema).optional(),
    services: z.array(serviceSchema).optional(),
    scenarios: z.array(scenarioSchema).min(1),
  })
  .strict()

export type Pillar = z.infer<typeof pillarSchema>
export type Competency = z.infer<typeof competencySchema>
export type Team = z.infer<typeof teamSchema>
export type Member = z.infer<typeof memberSchema>
export type Platform = z.infer<typeof platformSchema>
export type TrainingItem = z.infer<typeof trainingSchema>
export type Service = z.infer<typeof serviceSchema>
export type Scenario = z.infer<typeof scenarioSchema>

export type TeamWithId = Team & { id: string }
export type MemberWithId = Member & { id: string }
export type PillarWithId = Pillar & { id: string }
export type PlatformWithId = Platform & { id: string }
export type TrainingWithId = TrainingItem & { id: string }

/** A scenario with its `team` resolved and the matching people computed. */
export type ResolvedScenario = Scenario & {
  teamRef: TeamWithId
  /** People who can help (members of the team matching `needs`, or all team members). */
  matchedMembers: MemberWithId[]
}

export interface Content {
  pillars: Record<string, Pillar>
  competencies: Record<string, Competency>
  teams: Record<string, Team>
  members: MemberWithId[]
  platforms: Record<string, Platform>
  training: Record<string, TrainingItem>
  services: Service[]
  scenarios: ResolvedScenario[]
}

/** A friendly, location-aware validation problem. */
export interface ContentIssue {
  where: string
  message: string
}

export class ContentError extends Error {
  issues: ContentIssue[]
  constructor(issues: ContentIssue[]) {
    super(`content.yaml has ${issues.length} problem(s):\n` + issues.map((i) => `  • ${i.where}: ${i.message}`).join('\n'))
    this.name = 'ContentError'
    this.issues = issues
  }
}

const RECORD_SECTIONS = new Set(['teams', 'members', 'platforms', 'training', 'pillars', 'competencies'])

/** Map a ZodError onto human-readable, section/id-aware issues. */
function zodIssues(error: z.ZodError, raw: unknown): ContentIssue[] {
  const scenarios = (raw as { scenarios?: unknown[] })?.scenarios
  const services = (raw as { services?: unknown[] })?.services
  return error.issues.map((issue) => {
    const [head, ...rest] = issue.path
    let where = issue.path.length ? issue.path.join('.') : '(root)'
    if (head === 'scenarios' && typeof rest[0] === 'number' && Array.isArray(scenarios)) {
      const sc = scenarios[rest[0]] as { id?: string } | undefined
      const idLabel = sc?.id ? `"${sc.id}"` : `#${rest[0]}`
      const field = rest.slice(1).join('.')
      where = `scenario ${idLabel}${field ? ` → ${field}` : ''}`
    } else if (head === 'services' && typeof rest[0] === 'number' && Array.isArray(services)) {
      const sv = services[rest[0]] as { id?: string } | undefined
      const idLabel = sv?.id ? `"${sv.id}"` : `#${rest[0]}`
      const field = rest.slice(1).join('.')
      where = `service ${idLabel}${field ? ` → ${field}` : ''}`
    } else if (typeof head === 'string' && RECORD_SECTIONS.has(head) && typeof rest[0] === 'string') {
      const singular = head.endsWith('s') ? head.slice(0, -1) : head
      const field = rest.slice(1).join('.')
      where = `${singular} "${rest[0]}"${field ? ` → ${field}` : ''}`
    }
    return { where, message: issue.message }
  })
}

/**
 * Parse + validate already-parsed YAML into a typed, reference-resolved Content
 * object. Throws ContentError with friendly, located issues on any problem.
 */
export function buildContent(data: unknown): Content {
  const parsed = contentSchema.safeParse(data)
  if (!parsed.success) throw new ContentError(zodIssues(parsed.error, data))

  const { teams, scenarios } = parsed.data
  const pillars = parsed.data.pillars ?? {}
  const competencies = parsed.data.competencies ?? {}
  const membersRec = parsed.data.members ?? {}
  const platforms = parsed.data.platforms ?? {}
  const training = parsed.data.training ?? {}
  const services = parsed.data.services ?? []

  const issues: ContentIssue[] = []
  const knownPillar = (p: string) => p in pillars
  const knownCompetency = (c: string) => c in competencies

  // Pillar references on teams / platforms / training.
  for (const [id, t] of Object.entries(teams))
    for (const p of t.pillars ?? []) if (!knownPillar(p)) issues.push({ where: `team "${id}" → pillars`, message: `unknown pillar "${p}".` })
  for (const [id, p] of Object.entries(platforms))
    for (const pl of p.pillars ?? []) if (!knownPillar(pl)) issues.push({ where: `platform "${id}" → pillars`, message: `unknown pillar "${pl}".` })
  for (const [id, t] of Object.entries(training))
    for (const pl of t.pillars ?? []) if (!knownPillar(pl)) issues.push({ where: `training "${id}" → pillars`, message: `unknown pillar "${pl}".` })

  // Members: team must exist, competencies must be known.
  for (const [id, m] of Object.entries(membersRec)) {
    if (!teams[m.team]) issues.push({ where: `member "${id}" → team`, message: `references unknown team "${m.team}".` })
    for (const c of m.competencies ?? []) if (!knownCompetency(c)) issues.push({ where: `member "${id}" → competencies`, message: `unknown competency "${c}".` })
  }

  // Services: team (if given) must exist.
  for (const sv of services) if (sv.team && !teams[sv.team]) issues.push({ where: `service "${sv.id}" → team`, message: `references unknown team "${sv.team}".` })

  // Scenarios: team must exist, needs must be known competencies, ids unique.
  for (const sc of scenarios) {
    if (!teams[sc.team]) issues.push({ where: `scenario "${sc.id}" → team`, message: `references unknown team "${sc.team}". Add it under teams: or fix the reference.` })
    for (const c of sc.needs ?? []) if (!knownCompetency(c)) issues.push({ where: `scenario "${sc.id}" → needs`, message: `unknown competency "${c}".` })
  }
  const seen = new Map<string, number>()
  for (const sc of scenarios) seen.set(sc.id, (seen.get(sc.id) ?? 0) + 1)
  for (const [id, count] of seen) if (count > 1) issues.push({ where: `scenario "${id}"`, message: `duplicate id used ${count} times; ids must be unique.` })

  if (issues.length) throw new ContentError(issues)

  const members: MemberWithId[] = Object.entries(membersRec).map(([id, m]) => ({ id, ...m }))

  const resolved: ResolvedScenario[] = scenarios.map((sc) => {
    const teamRef: TeamWithId = { id: sc.team, ...teams[sc.team] }
    const teamMembers = members.filter((m) => m.team === sc.team)
    const needs = sc.needs ?? []
    const matchedMembers =
      needs.length === 0
        ? teamMembers
        : teamMembers.filter((m) => (m.competencies ?? []).some((c) => needs.includes(c)))
    return { ...sc, teamRef, matchedMembers }
  })

  return { pillars, competencies, teams, members, platforms, training, services, scenarios: resolved }
}
