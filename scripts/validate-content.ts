/**
 * `npm run validate` — check public/content.yaml without starting the app.
 *
 * Uses the SAME zod schema and reference checks as the runtime loader, so a file
 * that passes here will load in the app. Prints friendly, located errors and
 * exits non-zero on failure (handy for CI / pre-commit).
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import yaml from 'js-yaml'
import { buildContent, ContentError } from '../src/content/schema'

const here = dirname(fileURLToPath(import.meta.url))
const file = resolve(here, '..', 'public', 'content.yaml')

function fail(lines: string[]): never {
  console.error(`\n✖ content.yaml is not valid:\n`)
  for (const l of lines) console.error(`   • ${l}`)
  console.error('\nFix the items above and run `npm run validate` again.\n')
  process.exit(1)
}

let text: string
try {
  text = readFileSync(file, 'utf8')
} catch {
  fail([`Could not read ${file}. Does the file exist?`])
}

let data: unknown
try {
  data = yaml.load(text)
} catch (err) {
  const e = err as { reason?: string; mark?: { line?: number } }
  const line = e.mark?.line != null ? ` (line ${e.mark.line + 1})` : ''
  fail([`content.yaml${line} is not valid YAML: ${e.reason ?? (err as Error).message}`])
}

try {
  const content = buildContent(data)
  const teamCount = Object.keys(content.teams).length
  console.log(
    `\n✓ content.yaml is valid — ${content.scenarios.length} scenario(s), ${teamCount} team(s), ` +
      `${content.members.length} member(s), ${Object.keys(content.platforms).length} platform(s).\n`,
  )
} catch (err) {
  if (err instanceof ContentError) {
    fail(err.issues.map((i) => `${i.where}: ${i.message}`))
  }
  throw err
}
