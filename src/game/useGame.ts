import { useCallback, useMemo, useState } from 'react'
import { GENERIC_DSC, type GameConfig, type TeamWithId, type ResolvedScenario } from '../content/schema'

export interface Answer {
  scenario: ResolvedScenario
  guess: boolean
  correct: boolean
}

type Verdict = 'yes' | 'shared' | 'no'

/** Fisher–Yates shuffle (returns a new array; input untouched). */
function shuffled<T>(input: readonly T[]): T[] {
  const a = input.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const verdictOf = (s: ResolvedScenario): Verdict => (s.data_science === 'shared' ? 'shared' : s.data_science ? 'yes' : 'no')

/**
 * Draw a balanced round: take `mix[v]` scenarios of each verdict (shuffled within
 * each), backfill any shortfall (a verdict with too few scenarios) from the
 * leftovers, then shuffle the result so verdicts interleave. Exported for tests.
 */
export function drawRound(scenarios: readonly ResolvedScenario[], mix: GameConfig['mix']): ResolvedScenario[] {
  const pools: Record<Verdict, ResolvedScenario[]> = { yes: [], shared: [], no: [] }
  for (const s of scenarios) pools[verdictOf(s)].push(s)

  const picked: ResolvedScenario[] = []
  const leftover: ResolvedScenario[] = []
  for (const v of ['yes', 'shared', 'no'] as const) {
    const pool = shuffled(pools[v])
    picked.push(...pool.slice(0, mix[v]))
    leftover.push(...pool.slice(mix[v]))
  }

  const target = mix.yes + mix.shared + mix.no
  if (picked.length < target) picked.push(...shuffled(leftover).slice(0, target - picked.length))
  return shuffled(picked)
}

export interface Game {
  deck: ResolvedScenario[]
  index: number
  total: number
  current: ResolvedScenario | undefined
  /** The answer for the current card, if it has already been answered. */
  currentAnswer: Answer | undefined
  answers: Answer[]
  score: number
  streak: number
  bestStreak: number
  isFinished: boolean
  /** Distinct teams seen across answered scenarios (for the recap routing list). */
  matchedTeams: TeamWithId[]
  answer: (guess: boolean) => void
  next: () => void
  restart: () => void
}

/**
 * Owns all game state: the shuffled deck, current position, score/streak, and
 * the per-card answers used by the reveal and recap screens. Pure in-memory —
 * the clean extension point for a future shared leaderboard / analytics backend.
 */
export function useGame(scenarios: ResolvedScenario[], game: GameConfig): Game {
  const [deck, setDeck] = useState<ResolvedScenario[]>(() => drawRound(scenarios, game.mix))
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  const current = deck[index]
  const currentAnswer = answers[index]

  const answer = useCallback(
    (guess: boolean) => {
      setAnswers((prev) => {
        if (prev[index]) return prev // ignore double-answers for the same card
        const sc = deck[index]
        // `shared` scenarios are owned by both sides, so either swipe is correct.
        const correct = sc.data_science === 'shared' || guess === sc.data_science
        setStreak((s) => {
          const nextStreak = correct ? s + 1 : 0
          setBestStreak((b) => Math.max(b, nextStreak))
          return nextStreak
        })
        const nextAnswers = prev.slice()
        nextAnswers[index] = { scenario: sc, guess, correct }
        return nextAnswers
      })
    },
    [deck, index],
  )

  const next = useCallback(() => setIndex((i) => i + 1), [])

  const restart = useCallback(() => {
    setDeck(drawRound(scenarios, game.mix))
    setIndex(0)
    setAnswers([])
    setStreak(0)
    setBestStreak(0)
  }, [scenarios, game])

  const score = answers.filter((a) => a?.correct).length
  const isFinished = index >= deck.length

  const matchedTeams = useMemo(() => {
    const byId = new Map<string, TeamWithId>()
    for (const a of answers) {
      if (!a) continue
      // Cross-team scenarios contribute a single generic "Data Science Centre" entry
      // (matching the reveal), since their people span several teams.
      if (a.scenario.cross_team) byId.set(GENERIC_DSC.id, GENERIC_DSC)
      else byId.set(a.scenario.teamRef.id, a.scenario.teamRef)
      // Shared scenarios route to two teams — list both in the recap shortlist.
      if (a.scenario.teamRefAlso) byId.set(a.scenario.teamRefAlso.id, a.scenario.teamRefAlso)
      // Multi-team scenarios can also route to several other teams.
      for (const t of a.scenario.otherTeamRefs) byId.set(t.id, t)
    }
    return [...byId.values()]
  }, [answers])

  return {
    deck,
    index,
    total: deck.length,
    current,
    currentAnswer,
    answers,
    score,
    streak,
    bestStreak,
    isFinished,
    matchedTeams,
    answer,
    next,
    restart,
  }
}
