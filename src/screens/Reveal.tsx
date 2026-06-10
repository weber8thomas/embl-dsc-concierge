import { motion } from 'framer-motion'
import { ArrowRight, CircleCheck, CircleX } from 'lucide-react'
import type { Answer } from '../game/useGame'
import { Shell } from '../components/Shell'
import { EntityIcon } from '../components/EntityIcon'
import { EntityActions } from '../components/EntityActions'

interface RevealProps {
  answer: Answer
  isLast: boolean
  onNext: () => void
  onHome: () => void
}

export function Reveal({ answer, isLast, onNext, onHome }: RevealProps) {
  const { scenario, guess, correct } = answer
  const entity = scenario.entityRef
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
            <span className="inline-flex items-center gap-2 text-embl-green-dark">
              <CircleCheck className="h-6 w-6" aria-hidden="true" />
              <span className="text-lg font-bold">Correct!</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-embl-red">
              <CircleX className="h-6 w-6" aria-hidden="true" />
              <span className="text-lg font-bold">Not quite</span>
            </span>
          )}
        </motion.div>

        <p className="mt-2 text-sm text-embl-grey-dark">
          This {isDS ? 'is' : 'is not'} a Data Science question — you answered{' '}
          <strong>{guess ? 'yes' : 'no'}</strong>.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mt-5 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-embl-grey-lightest sm:p-8"
        >
          {/* The scenario, restated for context */}
          <p className="text-base font-medium text-embl-grey-darkest">“{scenario.question}”</p>

          {/* Why */}
          <p className="mt-3 text-embl-grey-dark">{scenario.why}</p>

          <hr className="my-6 border-embl-grey-lightest" />

          {/* Who to contact */}
          <p className="text-xs font-semibold uppercase tracking-wide text-embl-grey">
            {isDS ? 'Who in the DSC can help' : 'Where to go instead'}
          </p>

          <div className="mt-3 flex items-start gap-4">
            <EntityIcon entity={entity} />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-embl-grey-darkest">{entity.name}</h2>
              {entity.blurb && <p className="mt-1 text-sm text-embl-grey-dark">{entity.blurb}</p>}

              {entity.people && entity.people.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                  {entity.people.map((p) => (
                    <li key={p.name} className="text-embl-grey-darkest">
                      <span className="font-semibold">{p.name}</span>
                      {p.role && <span className="text-embl-grey"> — {p.role}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-5">
            <EntityActions entity={entity} />
          </div>
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
