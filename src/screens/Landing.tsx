import { motion } from 'framer-motion'
import { ArrowRight, BookOpen } from 'lucide-react'
import { Shell } from '../components/Shell'
import { OrganicShape, Roundel } from '../components/OrganicShape'

interface LandingProps {
  onStart: () => void
  onDirectory: () => void
}

export function Landing({ onStart, onDirectory }: LandingProps) {
  return (
    <Shell>
      <motion.div
        className="flex w-full flex-1 flex-col items-center justify-center text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative mb-8 grid place-items-center">
          {/* Organic shape framing the roundel (signature EMBL pairing) */}
          <OrganicShape gradient="light-depth" blob={1} opacity={0.75} className="absolute h-44 w-44" />
          <Roundel ring className="relative h-28 w-28 text-3xl font-bold tracking-tight">
            DSC
          </Roundel>
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-embl-green-dark">
          EMBL Data Science Centre
        </p>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-embl-grey-darkest sm:text-5xl">
          DSC Concierge
        </h1>
        <p className="mt-4 w-full max-w-md text-balance text-lg text-embl-grey-dark">
          Is it a question for the Data Science Centre? Find out where to go.
        </p>

        <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-embl-green px-6 py-3.5 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-embl-green-dark"
          >
            Start
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDirectory}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-embl-link transition-colors hover:text-embl-link-hover"
          >
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            Browse the directory
          </button>
        </div>

        <p className="mt-12 w-full max-w-sm text-sm text-embl-grey">
          A quick game from the EMBL Data Science Centre — swipe to guess, then see who to contact.
        </p>
      </motion.div>
    </Shell>
  )
}
