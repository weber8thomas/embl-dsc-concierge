import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import yaml from 'js-yaml'
import { describe, expect, it } from 'vitest'
import { buildContent, ContentError, type Content } from './schema'

const here = dirname(fileURLToPath(import.meta.url))
const contentPath = resolve(here, '..', '..', 'public', 'content.yaml')

function parse(src: string): unknown {
  return yaml.load(src)
}

const validEntity = `
entities:
  image-analysis:
    name: Bioimage Analysis
    kind: dsc
scenarios:
  - id: cells
    persona: postdoc
    question: Count cells in my images.
    data_science: yes
    entity: image-analysis
    why: Core image-analysis work.
`

describe('buildContent', () => {
  it('accepts a minimal valid document and resolves the entity reference', () => {
    const content = buildContent(parse(validEntity)) as Content
    expect(content.scenarios).toHaveLength(1)
    const sc = content.scenarios[0]
    expect(sc.data_science).toBe(true)
    expect(sc.entityRef.id).toBe('image-analysis')
    expect(sc.entityRef.name).toBe('Bioimage Analysis')
    expect(sc.entityRef.kind).toBe('dsc')
  })

  it('parses YAML yes/no into booleans for data_science', () => {
    const src = validEntity.replace('data_science: yes', 'data_science: no')
    const content = buildContent(parse(src)) as Content
    expect(content.scenarios[0].data_science).toBe(false)
  })

  it('reports a dangling entity reference by scenario id', () => {
    const src = validEntity.replace('entity: image-analysis', 'entity: nope')
    try {
      buildContent(parse(src))
      throw new Error('expected ContentError')
    } catch (err) {
      expect(err).toBeInstanceOf(ContentError)
      const issues = (err as ContentError).issues
      expect(issues[0].where).toContain('"cells"')
      expect(issues[0].message).toContain('nope')
    }
  })

  it('reports an invalid persona naming the offending scenario', () => {
    const src = validEntity.replace('persona: postdoc', 'persona: professor')
    try {
      buildContent(parse(src))
      throw new Error('expected ContentError')
    } catch (err) {
      expect(err).toBeInstanceOf(ContentError)
      const issues = (err as ContentError).issues
      expect(issues.some((i) => i.where.includes('"cells"') && i.where.includes('persona'))).toBe(true)
    }
  })

  it('reports a missing required field (why)', () => {
    const src = validEntity.replace('    why: Core image-analysis work.\n', '')
    expect(() => buildContent(parse(src))).toThrow(ContentError)
  })

  it('rejects duplicate scenario ids', () => {
    const dup = `${validEntity}
  - id: cells
    persona: staff
    question: Another one with the same id.
    data_science: no
    entity: image-analysis
    why: Duplicate id on purpose.
`
    try {
      buildContent(parse(dup))
      throw new Error('expected ContentError')
    } catch (err) {
      expect(err).toBeInstanceOf(ContentError)
      expect((err as ContentError).issues.some((i) => i.message.includes('duplicate'))).toBe(true)
    }
  })

  it('rejects an entity missing its required kind', () => {
    const src = validEntity.replace('    kind: dsc\n', '')
    expect(() => buildContent(parse(src))).toThrow(ContentError)
  })
})

describe('seed public/content.yaml', () => {
  it('is valid and ships several scenarios', () => {
    const content = buildContent(parse(readFileSync(contentPath, 'utf8'))) as Content
    expect(content.scenarios.length).toBeGreaterThanOrEqual(6)
    // Every scenario must resolve to a real entity.
    for (const sc of content.scenarios) {
      expect(content.entities[sc.entity]).toBeDefined()
    }
  })
})
