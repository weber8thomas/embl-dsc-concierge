import { motion } from 'framer-motion'
import { ArrowRight, CircleCheck, CircleX } from 'lucide-react'
import type { Answer } from '../game/useGame'
import type { Competency } from '../content/schema'
import { Shell } from '../components/Shell'
import { ScenarioResult } from '../components/ScenarioResult'

interface RevealProps {
  answer: Answer
  competencies: Record<string, Competency>
  isLast: boolean
  onNext: () => void
  onHome: () => void
}

export function Reveal({ answer, competencies, isLast, onNext, onHome }: RevealProps) {
  const { scenario, guess, correct } = answer
  const isDS = scenario.data_science

  return (
    <Shell onHome={onHome}>
      <div className="flex flex-1 flex-col justify-center py-6">
        {/* Correct / not-quite beat — never colour alone: icon + text both carry it. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="flex items-center gap-2"
          aria-live="polite"
        >
          {correct ? (
            <span className="inline-flex items-center gap-3 text-embl-green-dark">
              <CircleCheck className="h-10 w-10 sm:h-12 sm:w-12" aria-hidden="true" />
              <span className="text-4xl font-bold tracking-tight sm:text-5xl">Correct!</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-3 text-embl-red">
              <CircleX className="h-10 w-10 sm:h-12 sm:w-12" aria-hidden="true" />
              <span className="text-4xl font-bold tracking-tight sm:text-5xl">Not quite</span>
            </span>
          )}
        </motion.div>

        <p className="mt-3 text-lg text-embl-grey-dark sm:text-xl">
          This {isDS ? 'is' : 'is not'} a Data Science question — you answered <strong>{guess ? 'yes' : 'no'}</strong>.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mt-5 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-embl-grey-lightest sm:p-8"
        >
          <ScenarioResult scenario={scenario} competencies={competencies} />
        </motion.div>

        <button
          type="button"
          onClick={onNext}
          autoFocus
          className="mt-6 inline-flex items-center justify-center gap-2 self-center rounded-xl bg-embl-green px-8 py-3.5 text-lg font-semibold text-white transition-colors hover:bg-embl-green-dark"
        >
          {isLast ? 'See your results' : 'Next'}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </Shell>
  )
}
