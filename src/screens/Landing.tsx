import { motion } from 'framer-motion'
import { ArrowRight, Compass, Play } from 'lucide-react'
import { Shell } from '../components/Shell'
import { OrganicShape } from '../components/OrganicShape'
import { ConciergeMark } from '../components/ConciergeMark'

interface LandingProps {
  onStart: () => void
  onDirectory: () => void
  onExplore: () => void
}

export function Landing({ onStart, onDirectory, onExplore }: LandingProps) {
  return (
    <Shell width="wide">
      <motion.div
        className="flex w-full flex-1 flex-col items-center justify-center py-6 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative mb-6 grid place-items-center">
          <OrganicShape gradient="light-depth" blob={1} opacity={0.75} className="absolute h-44 w-44" />
          <ConciergeMark className="relative h-28 w-28 drop-shadow-sm" />
        </div>

        <p className="mb-2 text-balance text-2xl font-bold tracking-tight text-embl-green-dark sm:text-3xl">
          EMBL Data Science Centre
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-embl-grey-darkest sm:text-4xl">
          DSC Concierge
        </h1>

        {/* The two clearly separated parts of the app. */}
        <div className="mt-10 grid w-full max-w-3xl gap-4 text-left sm:grid-cols-2">
          {/* Part 1 — the game */}
          <section className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-embl-grey-lightest">
            <span className="grid h-12 w-12 place-items-center rounded-roundel bg-embl-green text-white">
              <Play className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-embl-grey-darkest">Play the triage game</h2>
            <p className="mt-1 flex-1 text-sm text-embl-grey-dark">
              Is it a question for the Data Science Centre? Swipe to guess, then see who to ask.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={onStart}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-embl-green px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-embl-green-dark"
              >
                Start
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onDirectory}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-embl-link transition-colors hover:text-embl-link-hover"
              >
                Browse scenarios
              </button>
            </div>
          </section>

          {/* Part 2 — the DSC catalogue */}
          <section className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-embl-grey-lightest">
            <span className="grid h-12 w-12 place-items-center rounded-roundel bg-embl-green-dark text-white">
              <Compass className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-embl-grey-darkest">Explore the DSC</h2>
            <p className="mt-1 flex-1 text-sm text-embl-grey-dark">
              The people, platforms, training and services of the Data Science Centre.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={onExplore}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-embl-green px-6 py-3 text-base font-semibold text-embl-green-dark transition-colors hover:bg-embl-green-lightest"
              >
                <Compass className="h-5 w-5" aria-hidden="true" />
                Explore
              </button>
            </div>
          </section>
        </div>
      </motion.div>
    </Shell>
  )
}
