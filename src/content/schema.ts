import { z } from 'zod'

/**
 * Schema + types for the single human-editable content file (public/content.yaml).
 *
 * This module is intentionally free of browser- or Node-specific imports so it
 * can be shared by both the runtime loader (src/content/loadContent.ts) and the
 * `npm run validate` CLI (scripts/validate-content.ts) — one source of truth.
 */

export const PERSONAS = ['predoc', 'postdoc', 'staff', 'PI', 'core-facility'] as const
export const DIFFICULTIES = ['easy', 'boundary', 'hard'] as const

/**
 * Editors write `data_science: yes` / `no` (the spec's authoring format). YAML's
 * JSON-compatible schema treats those as plain strings, so we accept yes/no/
 * true/false (case-insensitive) and coerce to a boolean, with a friendly error
 * for anything else.
 */
const dataScienceSchema = z.preprocess((v) => {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    if (s === 'yes' || s === 'true') return true
    if (s === 'no' || s === 'false') return false
  }
  return v
}, z.boolean({ invalid_type_error: 'must be yes or no', required_error: 'must be yes or no' }))

const personSchema = z
  .object({
    name: z.string().min(1),
    role: z.string().optional(),
    email: z.string().email().optional(),
  })
  .strict()

export const entitySchema = z
  .object({
    name: z.string().min(1),
    kind: z.enum(['dsc', 'external']),
    blurb: z.string().optional(),
    image: z.string().optional(),
    /** Optional lucide-react icon name, used to distinguish entities by icon. */
    icon: z.string().optional(),
    /** External redirect link (typical for kind: external). */
    link: z.string().url().optional(),
    ticket: z.string().url().optional(),
    mattermost: z.string().url().optional(),
    people: z.array(personSchema).optional(),
  })
  .strict()

export const scenarioSchema = z
  .object({
    id: z.string().min(1),
    persona: z.enum(PERSONAS),
    question: z.string().min(1),
    /** The correct answer: is this a Data Science Centre question? (yes / no) */
    data_science: dataScienceSchema,
    /** Must reference a key under `entities:`; cross-checked in refineContent. */
    entity: z.string().min(1),
    why: z.string().min(1),
    image: z.string().optional(),
    difficulty: z.enum(DIFFICULTIES).optional(),
  })
  .strict()

export const contentSchema = z
  .object({
    entities: z.record(z.string(), entitySchema),
    scenarios: z.array(scenarioSchema).min(1),
  })
  .strict()

export type Person = z.infer<typeof personSchema>
export type Entity = z.infer<typeof entitySchema>
export type Scenario = z.infer<typeof scenarioSchema>
export type RawContent = z.infer<typeof contentSchema>

/** An entity definition with its lookup key attached. */
export type EntityWithId = Entity & { id: string }

/** A scenario with its `entity` reference resolved to the entity object. */
export type ResolvedScenario = Scenario & { entityRef: EntityWithId }

export interface Content {
  entities: Record<string, Entity>
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

/** Map a ZodError onto human-readable, scenario/entity-aware issues. */
function zodIssues(error: z.ZodError, raw: unknown): ContentIssue[] {
  const scenarios = (raw as { scenarios?: unknown[] })?.scenarios
  return error.issues.map((issue) => {
    const [head, ...rest] = issue.path
    let where = issue.path.length ? issue.path.join('.') : '(root)'
    // Prefer naming a scenario by its `id` rather than its array index.
    if (head === 'scenarios' && typeof rest[0] === 'number' && Array.isArray(scenarios)) {
      const sc = scenarios[rest[0]] as { id?: string } | undefined
      const idLabel = sc?.id ? `"${sc.id}"` : `#${rest[0]}`
      const field = rest.slice(1).join('.')
      where = `scenario ${idLabel}${field ? ` → ${field}` : ''}`
    } else if (head === 'entities' && typeof rest[0] === 'string') {
      const field = rest.slice(1).join('.')
      where = `entity "${rest[0]}"${field ? ` → ${field}` : ''}`
    }
    return { where, message: issue.message }
  })
}

/**
 * Parse + validate already-parsed YAML data into a typed, reference-resolved
 * Content object. Throws ContentError with friendly, located issues on any
 * problem (schema violation or a scenario pointing at an unknown entity).
 */
export function buildContent(data: unknown): Content {
  const parsed = contentSchema.safeParse(data)
  if (!parsed.success) {
    throw new ContentError(zodIssues(parsed.error, data))
  }

  const { entities, scenarios } = parsed.data

  // Cross-reference check: every scenario.entity must exist under entities.
  const refIssues: ContentIssue[] = []
  for (const sc of scenarios) {
    if (!entities[sc.entity]) {
      refIssues.push({
        where: `scenario "${sc.id}" → entity`,
        message: `references unknown entity "${sc.entity}". Add it under entities: or fix the reference.`,
      })
    }
  }
  // Duplicate scenario ids would make recap/keys ambiguous.
  const seen = new Map<string, number>()
  for (const sc of scenarios) seen.set(sc.id, (seen.get(sc.id) ?? 0) + 1)
  for (const [id, count] of seen) {
    if (count > 1) refIssues.push({ where: `scenario "${id}"`, message: `duplicate id used ${count} times; ids must be unique.` })
  }
  if (refIssues.length) throw new ContentError(refIssues)

  const resolved: ResolvedScenario[] = scenarios.map((sc) => ({
    ...sc,
    entityRef: { id: sc.entity, ...entities[sc.entity] },
  }))

  return { entities, scenarios: resolved }
}
