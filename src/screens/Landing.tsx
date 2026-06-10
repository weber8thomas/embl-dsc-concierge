import { motion } from 'framer-motion'
import { ArrowRight, BookOpen } from 'lucide-react'
import { Shell } from '../components/Shell'
import { OrganicShape } from '../components/OrganicShape'

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
        <div className="relative mb-8">
          <OrganicShape variant="green" blob={2} className="h-32 w-32" />
          <span className="absolute inset-0 grid place-items-center text-4xl font-bold text-white">DSC</span>
        </div>

        <h1 className="text-balance text-4xl font-bold tracking-tight text-embl-grey-darkest sm:text-5xl">
          DSC Concierge
        </h1>
        <p className="mt-4 w-full max-w-md text-balance text-lg text-embl-grey-dark">
          Is it a data science question? Find out where to go.
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
