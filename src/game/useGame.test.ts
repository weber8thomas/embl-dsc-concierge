import { describe, it, expect } from 'vitest'
import { drawRound } from './useGame'
import type { ResolvedScenario } from '../content/schema'

/** Minimal scenario stubs — drawRound only reads `data_science`. */
function make(n: number, v: boolean | 'shared', tag: string): ResolvedScenario[] {
  return Array.from({ length: n }, (_, i) => ({ id: `${tag}-${i}`, data_science: v }) as unknown as ResolvedScenario)
}
const verdict = (s: ResolvedScenario) => (s.data_science === 'shared' ? 'shared' : s.data_science ? 'yes' : 'no')
const counts = (rows: ResolvedScenario[]) => {
  const c: Record<string, number> = { yes: 0, shared: 0, no: 0 }
  for (const s of rows) c[verdict(s)]++
  return c
}

// Mirrors the corpus shape: 18 yes, 11 shared, 6 no.
const pool = [...make(18, true, 'y'), ...make(11, 'shared', 's'), ...make(6, false, 'n')]

describe('drawRound', () => {
  it('draws exactly the configured mix, every time', () => {
    for (let t = 0; t < 25; t++) {
      const round = drawRound(pool, { yes: 5, shared: 3, no: 2 })
      expect(round.length).toBe(10)
      expect(counts(round)).toEqual({ yes: 5, shared: 3, no: 2 })
    }
  })

  it('never repeats a scenario within a round', () => {
    const round = drawRound(pool, { yes: 5, shared: 3, no: 2 })
    expect(new Set(round.map((s) => s.id)).size).toBe(round.length)
  })

  it('takes all available and backfills when a verdict is short', () => {
    const round = drawRound(pool, { yes: 5, shared: 3, no: 8 }) // only 6 "no" exist
    expect(round.length).toBe(16)
    const c = counts(round)
    expect(c.no).toBe(6) // all available "no"
    expect(c.yes + c.shared).toBe(10) // remaining slots backfilled from the rest
    expect(new Set(round.map((s) => s.id)).size).toBe(round.length)
  })
})
