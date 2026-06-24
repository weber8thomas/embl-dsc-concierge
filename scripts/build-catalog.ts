/**
 * `npm run catalog` — build dsc-catalog.xlsx from public/content.yaml.
 *
 * One sheet per section (Teams, Members, Competencies, Platforms, Training,
 * Consulting, Initiatives, Scenarios) so the DSC taxonomy can be reviewed/edited in
 * Excel. content.yaml stays the single source of truth — re-run after editing.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import yaml from 'js-yaml'
import * as XLSX from 'xlsx'
import { buildContent, ContentError } from '../src/content/schema'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const out = resolve(root, 'dsc-catalog.xlsx')

const list = (v?: string[]) => (v ?? []).join(', ')

const text = readFileSync(resolve(root, 'public', 'content.yaml'), 'utf8')
let content
try {
  content = buildContent(yaml.load(text))
} catch (err) {
  if (err instanceof ContentError) {
    console.error('\n✖ content.yaml is not valid — fix it before building the catalogue:\n')
    for (const i of err.issues) console.error(`   • ${i.where}: ${i.message}`)
    process.exit(1)
  }
  throw err
}

const competencies = Object.entries(content.competencies).map(([id, c]) => ({ id, label: c.label }))

const teams = Object.entries(content.teams).map(([id, t]) => ({
  id,
  name: t.name,
  kind: t.kind,
  blurb: t.blurb ?? '',
  link: t.link ?? '',
  ticket: t.ticket ?? '',
}))

const members = content.members.map((m) => ({
  id: m.id,
  name: m.name,
  position: m.position ?? '',
  team: m.team,
  team_name: content.teams[m.team]?.name ?? '',
  competencies: list(m.competencies),
  photo: m.photo ?? '',
}))

const platforms = Object.entries(content.platforms).map(([id, p]) => ({
  id,
  name: p.name,
  category: p.category ?? '',
  blurb: p.blurb ?? '',
  url: p.url ?? '',
}))

const training = Object.entries(content.training).map(([id, t]) => ({
  id,
  name: t.name,
  blurb: t.blurb ?? '',
  url: t.url ?? '',
}))

const consulting = Object.entries(content.consulting).map(([id, c]) => ({
  id,
  name: c.name,
  blurb: c.blurb ?? '',
  url: c.url ?? '',
}))

const initiatives = Object.entries(content.initiatives).map(([id, i]) => ({
  id,
  name: i.name,
  blurb: i.blurb ?? '',
  url: i.url,
}))

const scenarios = content.scenarios.map((s) => ({
  id: s.id,
  persona: s.persona,
  question: s.question,
  data_science: s.data_science === 'shared' ? 'shared' : s.data_science ? 'yes' : 'no',
  team: s.team,
  team_name: s.teamRef.name,
  team_also: s.team_also ?? '',
  team_also_name: s.teamRefAlso?.name ?? '',
  other_teams: s.otherTeamRefs.map((t) => t.name).join(', '),
  needs: list(s.needs),
  people: s.matchedMembers.map((m) => m.name).join(', '),
  why: s.why,
}))

const wb = XLSX.utils.book_new()
const add = (name: string, rows: Record<string, unknown>[]) =>
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), name)

add('Teams', teams)
add('Members', members)
add('Competencies', competencies)
add('Platforms', platforms)
add('Training', training)
add('Consulting', consulting)
add('Initiatives', initiatives)
add('Scenarios', scenarios)

XLSX.writeFile(wb, out)
console.log(
  `\n✓ Wrote ${out}\n  ${teams.length} teams · ${members.length} members · ` +
    `${platforms.length} platforms · ${training.length} training · ${consulting.length} consulting · ` +
    `${initiatives.length} initiatives · ${scenarios.length} scenarios\n`,
)
