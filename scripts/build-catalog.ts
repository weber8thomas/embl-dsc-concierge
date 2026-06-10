/**
 * `npm run catalog` — build dsc-catalog.xlsx from public/content.yaml.
 *
 * One sheet per section (Pillars, Teams, Members, Competencies, Platforms,
 * Training, Services, Scenarios) so the DSC taxonomy can be reviewed/edited in
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

const pillars = Object.entries(content.pillars).map(([id, p]) => ({ id, name: p.name, blurb: p.blurb ?? '' }))

const competencies = Object.entries(content.competencies).map(([id, c]) => ({ id, label: c.label }))

const teams = Object.entries(content.teams).map(([id, t]) => ({
  id,
  name: t.name,
  kind: t.kind,
  pillars: list(t.pillars),
  blurb: t.blurb ?? '',
  link: t.link ?? '',
  mattermost: t.mattermost ?? '',
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
  pillars: list(p.pillars),
  blurb: p.blurb ?? '',
  url: p.url ?? '',
}))

const training = Object.entries(content.training).map(([id, t]) => ({
  id,
  name: t.name,
  pillars: list(t.pillars),
  blurb: t.blurb ?? '',
  url: t.url ?? '',
}))

const services = content.services.map((s) => ({
  id: s.id,
  name: s.name,
  team: s.team ?? '',
  team_name: s.team ? (content.teams[s.team]?.name ?? '') : '',
  blurb: s.blurb ?? '',
  link: s.link ?? '',
}))

const scenarios = content.scenarios.map((s) => ({
  id: s.id,
  persona: s.persona,
  question: s.question,
  data_science: s.data_science ? 'yes' : 'no',
  team: s.team,
  team_name: s.teamRef.name,
  needs: list(s.needs),
  people: s.matchedMembers.map((m) => m.name).join(', '),
  why: s.why,
  difficulty: s.difficulty ?? '',
}))

const wb = XLSX.utils.book_new()
const add = (name: string, rows: Record<string, unknown>[]) =>
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), name)

add('Pillars', pillars)
add('Teams', teams)
add('Members', members)
add('Competencies', competencies)
add('Platforms', platforms)
add('Training', training)
add('Services', services)
add('Scenarios', scenarios)

XLSX.writeFile(wb, out)
console.log(
  `\n✓ Wrote ${out}\n  ${pillars.length} pillars · ${teams.length} teams · ${members.length} members · ` +
    `${platforms.length} platforms · ${training.length} training · ${services.length} services · ${scenarios.length} scenarios\n`,
)
