import { useCallback, useMemo, useState } from 'react'
import type { EntityWithId, ResolvedScenario } from '../content/schema'

export interface Answer {
  scenario: ResolvedScenario
  guess: boolean
  correct: boolean
}

/** Fisher–Yates shuffle (returns a new array; input untouched). */
function shuffled<T>(input: readonly T[]): T[] {
  const a = input.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
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
  /** Distinct entities seen across answered scenarios (for the recap routing list). */
  matchedEntities: EntityWithId[]
  answer: (guess: boolean) => void
  next: () => void
  restart: () => void
}

/**
 * Owns all game state: the shuffled deck, current position, score/streak, and
 * the per-card answers used by the reveal and recap screens. Pure in-memory —
 * the clean extension point for a future shared leaderboard / analytics backend.
 */
export function useGame(scenarios: ResolvedScenario[]): Game {
  const [deck, setDeck] = useState<ResolvedScenario[]>(() => shuffled(scenarios))
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
        const correct = guess === sc.data_science
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
    setDeck(shuffled(scenarios))
    setIndex(0)
    setAnswers([])
    setStreak(0)
    setBestStreak(0)
  }, [scenarios])

  const score = answers.filter((a) => a?.correct).length
  const isFinished = index >= deck.length

  const matchedEntities = useMemo(() => {
    const byId = new Map<string, EntityWithId>()
    for (const a of answers) {
      if (a) byId.set(a.scenario.entityRef.id, a.scenario.entityRef)
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
    matchedEntities,
    answer,
    next,
    restart,
  }
}
