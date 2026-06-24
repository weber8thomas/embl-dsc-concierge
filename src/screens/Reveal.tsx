import { motion } from 'framer-motion'
import { ArrowRight, CircleCheck, CircleX, Handshake } from 'lucide-react'
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
  const isShared = scenario.data_science === 'shared'
  const isDS = scenario.data_science === true

  return (
    <Shell onHome={onHome} width="wide">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center py-6">
        {/* Correct / not-quite beat — never colour alone: icon + text both carry it. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="flex items-center justify-center gap-3"
          aria-live="polite"
        >
          {isShared ? (
            <span className="inline-flex items-center gap-3 text-embl-link">
              <Handshake className="h-10 w-10 sm:h-12 sm:w-12" aria-hidden="true" />
              <span className="text-4xl font-bold tracking-tight sm:text-5xl">It’s a bit of both!</span>
            </span>
          ) : correct ? (
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

        <p className="mt-3 text-center text-lg text-embl-grey-dark sm:text-xl">
          {isShared ? (
            <>The DSC and another team each own a piece of this one, so both yes and no count as correct.</>
          ) : (
            <>The Data Science Centre {isDS ? 'can' : 'is not the place to'} help with this. You answered <strong>{guess ? 'yes' : 'no'}</strong>.</>
          )}
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
