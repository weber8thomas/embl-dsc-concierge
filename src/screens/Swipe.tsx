import { useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'
import type { ResolvedScenario } from '../content/schema'
import { Shell } from '../components/Shell'
import { ScenarioCard } from '../components/ScenarioCard'
import { ProgressBar } from '../components/ProgressBar'
import { StreakCounter } from '../components/StreakCounter'

interface SwipeProps {
  scenario: ResolvedScenario
  index: number // 0-based
  total: number
  streak: number
  onAnswer: (guess: boolean) => void
  onHome: () => void
}

export function Swipe({ scenario, index, total, streak, onAnswer, onHome }: SwipeProps) {
  // Guard so the three input methods can't double-answer the same card. Reset
  // only when the card actually changes, not on every render.
  const answered = useRef(false)
  const lastId = useRef<string | null>(null)
  if (lastId.current !== scenario.id) {
    lastId.current = scenario.id
    answered.current = false
  }

  function answer(guess: boolean) {
    if (answered.current) return
    answered.current = true
    onAnswer(guess)
  }

  // Keyboard play: → / Y = yes, ← / N = no.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return
      const k = e.key.toLowerCase()
      if (k === 'arrowright' || k === 'y') {
        e.preventDefault()
        answer(true)
      } else if (k === 'arrowleft' || k === 'n') {
        e.preventDefault()
        answer(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.id])

  return (
    <Shell onHome={onHome}>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1">
          <ProgressBar current={index + 1} total={total} />
        </div>
        <StreakCounter streak={streak} />
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <div className="relative">
          <AnimatePresence mode="wait">
            <ScenarioCard key={scenario.id} scenario={scenario} onAnswer={answer} />
          </AnimatePresence>
        </div>

        <p className="mt-5 text-center text-sm text-embl-grey">
          Swipe the card, tap a button, or use your <kbd className="font-mono">←</kbd> / <kbd className="font-mono">→</kbd> keys.
        </p>

        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => answer(false)}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-embl-grey-lightest px-6 py-3 text-base font-semibold text-embl-grey-darkest transition-colors hover:border-embl-red hover:text-embl-red"
            aria-label="No, this is not a data science question"
          >
            <X className="h-5 w-5" aria-hidden="true" />
            No
          </button>
          <button
            type="button"
            onClick={() => answer(true)}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-embl-grey-lightest px-6 py-3 text-base font-semibold text-embl-grey-darkest transition-colors hover:border-embl-green hover:text-embl-green"
            aria-label="Yes, this is a data science question"
          >
            <Check className="h-5 w-5" aria-hidden="true" />
            Yes
          </button>
        </div>
      </div>
    </Shell>
  )
}
