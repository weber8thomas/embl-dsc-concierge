import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import yaml from 'js-yaml'
import { describe, expect, it } from 'vitest'
import { buildContent, ContentError, type Content } from './schema'

const here = dirname(fileURLToPath(import.meta.url))
const contentPath = resolve(here, '..', '..', 'public', 'content.yaml')

const parse = (src: string): unknown => yaml.load(src)

const valid = `
competencies:
  statistics: { label: Statistics }
  image-analysis: { label: Image analysis }
teams:
  internal-support:
    name: Internal Support
    kind: dsc
scenarios:
  - id: which-test
    persona: fellow
    question: Which statistical test should I use?
    data_science: yes
    team: internal-support
    needs: [statistics]
    why: Stats help.
`

const withMembers = `${valid}members:
  sam:
    name: Sam Mean
    team: internal-support
    competencies: [statistics]
  ina:
    name: Ina Image
    team: internal-support
    competencies: [image-analysis]
`

describe('buildContent', () => {
  it('accepts a minimal valid document and resolves the team reference', () => {
    const content = buildContent(parse(valid)) as Content
    expect(content.scenarios).toHaveLength(1)
    const sc = content.scenarios[0]
    expect(sc.data_science).toBe(true)
    expect(sc.teamRef.id).toBe('internal-support')
    expect(sc.teamRef.kind).toBe('dsc')
  })

  it('matches members to a scenario by competency `needs`', () => {
    const content = buildContent(parse(withMembers)) as Content
    const sc = content.scenarios[0]
    expect(sc.matchedMembers.map((m) => m.id)).toEqual(['sam']) // statistics, not image-analysis
  })

  it('falls back to all team members when a scenario has no `needs`', () => {
    const src = withMembers.replace('    needs: [statistics]\n', '')
    const sc = (buildContent(parse(src)) as Content).scenarios[0]
    expect(sc.matchedMembers.map((m) => m.id).sort()).toEqual(['ina', 'sam'])
  })

  it('parses YAML yes/no into booleans', () => {
    const content = buildContent(parse(valid.replace('data_science: yes', 'data_science: no'))) as Content
    expect(content.scenarios[0].data_science).toBe(false)
  })

  it('reports a dangling team reference by scenario id', () => {
    try {
      buildContent(parse(valid.replace('team: internal-support\n    needs', 'team: nope\n    needs')))
      throw new Error('expected ContentError')
    } catch (err) {
      expect(err).toBeInstanceOf(ContentError)
      const issues = (err as ContentError).issues
      expect(issues.some((i) => i.where.includes('"which-test"') && i.where.includes('team') && i.message.includes('nope'))).toBe(true)
    }
  })

  it('reports an unknown competency in needs', () => {
    try {
      buildContent(parse(valid.replace('needs: [statistics]', 'needs: [bogus]')))
      throw new Error('expected ContentError')
    } catch (err) {
      expect(err).toBeInstanceOf(ContentError)
      expect((err as ContentError).issues.some((i) => i.where.includes('needs') && i.message.includes('bogus'))).toBe(true)
    }
  })

  it('reports a member referencing an unknown team', () => {
    const src = `${valid}members:
  sam:
    name: Sam Mean
    team: ghost
`
    try {
      buildContent(parse(src))
      throw new Error('expected ContentError')
    } catch (err) {
      expect(err).toBeInstanceOf(ContentError)
      expect((err as ContentError).issues.some((i) => i.where.includes('member "sam"') && i.message.includes('ghost'))).toBe(true)
    }
  })

  it('reports an invalid persona naming the offending scenario', () => {
    expect(() => buildContent(parse(valid.replace('persona: fellow', 'persona: professor')))).toThrow(ContentError)
  })

  it('reports a missing required field (why)', () => {
    expect(() => buildContent(parse(valid.replace('    why: Stats help.\n', '')))).toThrow(ContentError)
  })

  it('rejects a team missing its required kind', () => {
    expect(() => buildContent(parse(valid.replace('    kind: dsc\n', '')))).toThrow(ContentError)
  })
})

describe('seed public/content.yaml', () => {
  it('is valid and ships a full catalogue', () => {
    const content = buildContent(parse(readFileSync(contentPath, 'utf8'))) as Content
    expect(content.scenarios.length).toBeGreaterThanOrEqual(20)
    expect(content.members.length).toBeGreaterThanOrEqual(20)
    // Every scenario resolves to a real team.
    for (const sc of content.scenarios) expect(content.teams[sc.team]).toBeDefined()
    // Every DS-yes scenario routed to a DSC team surfaces at least one person.
    const dsTeamScenarios = content.scenarios.filter((s) => s.data_science && content.teams[s.team].kind === 'dsc')
    for (const sc of dsTeamScenarios) expect(sc.matchedMembers.length).toBeGreaterThan(0)
  })
})
