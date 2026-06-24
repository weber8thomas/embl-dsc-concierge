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

/**
 * Editors write yes / no / shared. `yes`/`no` coerce to a boolean; `shared`
 * marks a scenario both the DSC and another entity own (either swipe counts as
 * correct, and the reveal lists both teams). Anything else gives a friendly error.
 */
const dataScienceSchema = z.preprocess((v) => {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    if (s === 'yes' || s === 'true') return true
    if (s === 'no' || s === 'false') return false
    if (s === 'shared' || s === 'both') return 'shared'
  }
  return v
}, z.union([z.boolean(), z.literal('shared')], { errorMap: () => ({ message: 'must be yes, no or shared' }) }))

export const competencySchema = z.object({ label: z.string().min(1) }).strict()

export const teamSchema = z
  .object({
    name: z.string().min(1),
    /** Optional short name / acronym (e.g. MODIS, DaSIS), shown as the heading. */
    short: z.string().optional(),
    kind: z.enum(['dsc', 'external']),
    blurb: z.string().optional(),
    icon: z.string().optional(),
    link: z.string().url().optional(),
    ticket: z.string().url().optional(),
  })
  .strict()

export const memberSchema = z
  .object({
    name: z.string().min(1),
    position: z.string().optional(),
    team: z.string().min(1),
    /** Marks this person as the lead of their team (shown with a badge). */
    lead: z.boolean().optional(),
    competencies: z.array(z.string()).optional(),
    /** Photo URL (e.g. content.embl.org). Optional — a fallback avatar is shown. */
    photo: z.string().url().optional(),
    /** EMBL/EBI profile page URL (e.g. https://www.embl.org/people/person/jan-korbel). Shown as a link on the card. */
    profile: z.string().url().optional(),
  })
  .strict()

export const platformSchema = z
  .object({
    name: z.string().min(1),
    category: z.string().optional(),
    blurb: z.string().optional(),
    url: z.string().url().optional(),
    /** Optional logo: a full URL or a path relative to the app (e.g.
     * `logos/galaxy.png` under public/). A lettered placeholder shows when absent. */
    logo: z.string().min(1).optional(),
  })
  .strict()

export const trainingSchema = z
  .object({
    name: z.string().min(1),
    blurb: z.string().optional(),
    url: z.string().url().optional(),
    icon: z.string().optional(),
  })
  .strict()

/** A DSC consulting area (the six areas on the DSC consulting page). */
export const consultingSchema = z
  .object({
    name: z.string().min(1),
    blurb: z.string().optional(),
    url: z.string().url().optional(),
    icon: z.string().optional(),
  })
  .strict()

/** A community-driven initiative (user group, club) — not a chat channel. */
export const initiativeSchema = z
  .object({
    name: z.string().min(1),
    blurb: z.string().optional(),
    url: z.string().url(),
  })
  .strict()

export const channelSchema = z
  .object({
    name: z.string().min(1),
    url: z.string().url(),
    blurb: z.string().optional(),
    /** Competency tags used to surface this channel in matching scenario reveals. */
    competencies: z.array(z.string()).optional(),
  })
  .strict()

export const scenarioSchema = z
  .object({
    id: z.string().min(1),
    persona: z.enum(PERSONAS),
    question: z.string().min(1),
    data_science: dataScienceSchema,
    /** Must reference a key under `teams:`; cross-checked in buildContent. For a
     * `shared` scenario this is the *lead* (where you go first). */
    team: z.string().min(1),
    /** For `shared` scenarios: the partner team that handles the rest. Must also
     * reference a key under `teams:`; cross-checked in buildContent. */
    team_also: z.string().optional(),
    /** Additional teams that could also handle this, depending on the use case
     * (routing only — does not change the yes/no answer). All must reference a
     * key under `teams:`; cross-checked in buildContent. */
    teams: z.array(z.string()).optional(),
    /** Competency tags used to surface matching people; must exist under `competencies:`. */
    needs: z.array(z.string()).optional(),
    /** When true, match people by `needs` across ALL DSC teams rather than only the
     * routed team(s). Use for cross-cutting skills (e.g. infrastructure) where the
     * right expert may sit in any team. */
    cross_team: z.boolean().optional(),
    /** Explicit list of channel ids to show as "Related channels", overriding the
     * automatic competency match. Must reference keys under `channels:`. */
    channels: z.array(z.string()).optional(),
    /** Explicit list of member ids to surface, overriding team/needs matching. Use
     * when a specific person owns the thing (e.g. who maintains a service). Must
     * reference keys under `members:`. */
    people: z.array(z.string()).optional(),
    why: z.string().min(1),
    image: z.string().optional(),
  })
  .strict()

export const contentSchema = z
  .object({
    competencies: z.record(z.string(), competencySchema).optional(),
    teams: z.record(z.string(), teamSchema),
    members: z.record(z.string(), memberSchema).optional(),
    platforms: z.record(z.string(), platformSchema).optional(),
    training: z.record(z.string(), trainingSchema).optional(),
    consulting: z.record(z.string(), consultingSchema).optional(),
    initiatives: z.record(z.string(), initiativeSchema).optional(),
    channels: z.record(z.string(), channelSchema).optional(),
    scenarios: z.array(scenarioSchema).min(1),
  })
  .strict()

export type Competency = z.infer<typeof competencySchema>
export type Team = z.infer<typeof teamSchema>
export type Member = z.infer<typeof memberSchema>
export type Platform = z.infer<typeof platformSchema>
export type TrainingItem = z.infer<typeof trainingSchema>
export type Consulting = z.infer<typeof consultingSchema>
export type Initiative = z.infer<typeof initiativeSchema>
export type Channel = z.infer<typeof channelSchema>
export type Scenario = z.infer<typeof scenarioSchema>

export type TeamWithId = Team & { id: string }
export type MemberWithId = Member & { id: string }

/** Generic "Data Science Centre" entry point shown for cross-team scenarios, where
 * the helping people span several teams so naming one team would mislead. Used by
 * the reveal, the recap shortlist and the directory so they all agree. */
export const GENERIC_DSC: TeamWithId = {
  id: 'dsc',
  name: 'Data Science Centre',
  kind: 'dsc',
  icon: 'brain',
  blurb: 'The DSC brings together the right people across its teams to help.',
  link: 'https://www.embl.org/about/info/data-science-centre/',
  ticket: 'https://bio-it.embl.de/datascience-consulting/',
}
export type PlatformWithId = Platform & { id: string }
export type TrainingWithId = TrainingItem & { id: string }
export type ChannelWithId = Channel & { id: string }

/** A scenario with its `team` resolved and the matching people computed. */
export type ResolvedScenario = Scenario & {
  teamRef: TeamWithId
  /** The resolved `team_also` partner, for `shared` scenarios. */
  teamRefAlso?: TeamWithId
  /** Resolved `teams:` — other teams that could also handle this (excludes the
   * primary `team` and any `team_also` partner). */
  otherTeamRefs: TeamWithId[]
  /** People who can help (members of the DSC-side routed team(s) matching `needs`, or all of them). */
  matchedMembers: MemberWithId[]
  /** Community channels whose competencies overlap the scenario's `needs`. */
  matchedChannels: ChannelWithId[]
}

export interface Content {
  competencies: Record<string, Competency>
  teams: Record<string, Team>
  members: MemberWithId[]
  platforms: Record<string, Platform>
  training: Record<string, TrainingItem>
  consulting: Record<string, Consulting>
  initiatives: Record<string, Initiative>
  channels: Record<string, Channel>
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

const RECORD_SECTIONS = new Set([
  'teams',
  'members',
  'platforms',
  'training',
  'consulting',
  'initiatives',
  'channels',
  'competencies',
])

/** Map a ZodError onto human-readable, section/id-aware issues. */
function zodIssues(error: z.ZodError, raw: unknown): ContentIssue[] {
  const scenarios = (raw as { scenarios?: unknown[] })?.scenarios
  return error.issues.map((issue) => {
    const [head, ...rest] = issue.path
    let where = issue.path.length ? issue.path.join('.') : '(root)'
    if (head === 'scenarios' && typeof rest[0] === 'number' && Array.isArray(scenarios)) {
      const sc = scenarios[rest[0]] as { id?: string } | undefined
      const idLabel = sc?.id ? `"${sc.id}"` : `#${rest[0]}`
      const field = rest.slice(1).join('.')
      where = `scenario ${idLabel}${field ? ` → ${field}` : ''}`
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
  const competencies = parsed.data.competencies ?? {}
  const membersRec = parsed.data.members ?? {}
  const platforms = parsed.data.platforms ?? {}
  const training = parsed.data.training ?? {}
  const consulting = parsed.data.consulting ?? {}
  const initiatives = parsed.data.initiatives ?? {}
  const channels = parsed.data.channels ?? {}

  const issues: ContentIssue[] = []
  const knownCompetency = (c: string) => c in competencies

  // Members: team must exist, competencies must be known.
  for (const [id, m] of Object.entries(membersRec)) {
    if (!teams[m.team]) issues.push({ where: `member "${id}" → team`, message: `references unknown team "${m.team}".` })
    for (const c of m.competencies ?? []) if (!knownCompetency(c)) issues.push({ where: `member "${id}" → competencies`, message: `unknown competency "${c}".` })
  }

  // Channels: tagged competencies must be known.
  for (const [id, ch] of Object.entries(channels))
    for (const c of ch.competencies ?? []) if (!knownCompetency(c)) issues.push({ where: `channel "${id}" → competencies`, message: `unknown competency "${c}".` })

  // Scenarios: team(s) must exist, needs must be known competencies, ids unique.
  for (const sc of scenarios) {
    if (!teams[sc.team]) issues.push({ where: `scenario "${sc.id}" → team`, message: `references unknown team "${sc.team}". Add it under teams: or fix the reference.` })
    if (sc.team_also && !teams[sc.team_also]) issues.push({ where: `scenario "${sc.id}" → team_also`, message: `references unknown team "${sc.team_also}". Add it under teams: or fix the reference.` })
    for (const t of sc.teams ?? []) if (!teams[t]) issues.push({ where: `scenario "${sc.id}" → teams`, message: `references unknown team "${t}". Add it under teams: or fix the reference.` })
    for (const c of sc.needs ?? []) if (!knownCompetency(c)) issues.push({ where: `scenario "${sc.id}" → needs`, message: `unknown competency "${c}".` })
    for (const ch of sc.channels ?? []) if (!channels[ch]) issues.push({ where: `scenario "${sc.id}" → channels`, message: `unknown channel "${ch}". Add it under channels: or fix the reference.` })
    for (const p of sc.people ?? []) if (!membersRec[p]) issues.push({ where: `scenario "${sc.id}" → people`, message: `unknown member "${p}". Add it under members: or fix the reference.` })
  }
  const seen = new Map<string, number>()
  for (const sc of scenarios) seen.set(sc.id, (seen.get(sc.id) ?? 0) + 1)
  for (const [id, count] of seen) if (count > 1) issues.push({ where: `scenario "${id}"`, message: `duplicate id used ${count} times; ids must be unique.` })

  if (issues.length) throw new ContentError(issues)

  const members: MemberWithId[] = Object.entries(membersRec).map(([id, m]) => ({ id, ...m }))
  const channelList: ChannelWithId[] = Object.entries(channels).map(([id, c]) => ({ id, ...c }))

  const resolved: ResolvedScenario[] = scenarios.map((sc) => {
    const teamRef: TeamWithId = { id: sc.team, ...teams[sc.team] }
    const teamRefAlso: TeamWithId | undefined = sc.team_also
      ? { id: sc.team_also, ...teams[sc.team_also] }
      : undefined
    // `teams:` lists other teams that could also handle this — exclude the
    // primary team and any shared partner so they aren't shown twice.
    const otherTeamRefs: TeamWithId[] = (sc.teams ?? [])
      .filter((id) => id !== sc.team && id !== sc.team_also)
      .map((id) => ({ id, ...teams[id] }))

    // People are surfaced from the DSC-side routed team(s): the primary/partner
    // plus any `teams:` helpers. Deduped, primary's members first.
    const routeIds = [sc.team, ...(sc.team_also ? [sc.team_also] : []), ...(sc.teams ?? [])]
    const dscRouteIds = [...new Set(routeIds)].filter((id) => teams[id]?.kind === 'dsc')
    const needs = sc.needs ?? []
    // Candidate pool: all DSC people for a `cross_team` scenario (skill matters more
    // than team), otherwise just the routed DSC team(s).
    const candidatePool = sc.cross_team
      ? members.filter((m) => teams[m.team]?.kind === 'dsc')
      : members.filter((m) => dscRouteIds.includes(m.team))
    // An explicit `people:` list wins (e.g. the person who owns a service); else
    // match the candidate pool by `needs`, or show the whole pool when none given.
    const matchedMembers = sc.people
      ? (sc.people.map((id) => members.find((m) => m.id === id)).filter(Boolean) as MemberWithId[])
      : needs.length === 0
        ? candidatePool
        : candidatePool.filter((m) => (m.competencies ?? []).some((c) => needs.includes(c)))
    // Related channels: an explicit `channels:` list wins; otherwise fall back to
    // those whose competency tags overlap the scenario's needs.
    const matchedChannels = sc.channels
      ? sc.channels.map((id) => ({ id, ...channels[id] }))
      : needs.length === 0
        ? []
        : channelList.filter((ch) => (ch.competencies ?? []).some((c) => needs.includes(c)))
    return { ...sc, teamRef, teamRefAlso, otherTeamRefs, matchedMembers, matchedChannels }
  })

  return { competencies, teams, members, platforms, training, consulting, initiatives, channels, scenarios: resolved }
}
