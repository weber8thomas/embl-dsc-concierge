import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { Check, X } from 'lucide-react'
import type { ResolvedScenario } from '../content/schema'
import { Shell } from '../components/Shell'
import { ScenarioCard } from '../components/ScenarioCard'
import { ProgressBar } from '../components/ProgressBar'
import { StreakCounter } from '../components/StreakCounter'
import { OrganicShape } from '../components/OrganicShape'

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

  // Shared drag position — drives the card tilt, the YES/NO indicators above the
  // card, and the green/red organic-shape highlights behind it. Decision is by
  // horizontal direction (left half = NO, right half = YES), Tinder-style.
  const x = useMotionValue(0)
  const noActive = useTransform(x, [-140, -10], [1, 0.35])
  const yesActive = useTransform(x, [10, 140], [0.35, 1])
  const noScale = useTransform(x, [-170, -10], [1.18, 1])
  const yesScale = useTransform(x, [10, 170], [1, 1.18])
  const noGlow = useTransform(x, [-180, -30], [0.85, 0])
  const yesGlow = useTransform(x, [30, 180], [0, 0.85])
  useEffect(() => {
    x.set(0)
  }, [scenario.id, x])

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
      <div className="mb-5 flex items-center gap-4">
        <div className="flex-1">
          <ProgressBar current={index + 1} total={total} />
        </div>
        <StreakCounter streak={streak} />
      </div>

      <div className="flex flex-1 flex-col justify-center">
        {/* The constant prompt — prominent, above the card. */}
        <h1 className="text-balance text-center text-2xl font-bold tracking-tight text-embl-grey-darkest sm:text-3xl">
          Is this a Data Science question?
        </h1>

        {/* YES / NO indicators, OUTSIDE the card (driven by the drag). */}
        <div className="mx-auto mt-4 flex w-full max-w-md items-center justify-between">
          <motion.span
            style={{ opacity: noActive, scale: noScale }}
            className="inline-flex items-center gap-2 rounded-full border-[3px] border-embl-red px-5 py-2 text-xl font-extrabold uppercase text-embl-red"
          >
            <X className="h-6 w-6" aria-hidden="true" /> No
          </motion.span>
          <motion.span
            style={{ opacity: yesActive, scale: yesScale }}
            className="inline-flex items-center gap-2 rounded-full border-[3px] border-embl-green px-5 py-2 text-xl font-extrabold uppercase text-embl-green"
          >
            <Check className="h-6 w-6" aria-hidden="true" /> Yes
          </motion.span>
        </div>

        <div className="relative mt-3">
          {/* Green (YES, right) / red (NO, left) organic-shape area highlights. */}
          <motion.div style={{ opacity: noGlow }} className="pointer-events-none absolute -left-20 top-1/2 z-0 -translate-y-1/2">
            <OrganicShape customFill="var(--embl-red)" blob={0} opacity={0.5} className="h-80 w-80" />
          </motion.div>
          <motion.div style={{ opacity: yesGlow }} className="pointer-events-none absolute -right-20 top-1/2 z-0 -translate-y-1/2">
            <OrganicShape variant="green" blob={2} opacity={0.5} className="h-80 w-80" />
          </motion.div>

          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <ScenarioCard key={scenario.id} scenario={scenario} x={x} onAnswer={answer} />
            </AnimatePresence>
          </div>
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
