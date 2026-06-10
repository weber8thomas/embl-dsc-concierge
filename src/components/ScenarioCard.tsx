import { useRef } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from 'framer-motion'
import { Check, X } from 'lucide-react'
import type { ResolvedScenario } from '../content/schema'
import { PersonaBadge } from './PersonaBadge'
import { OrganicShape } from './OrganicShape'

const SWIPE_THRESHOLD = 110 // px (offset + projected velocity) to count as a swipe

interface ScenarioCardProps {
  scenario: ResolvedScenario
  onAnswer: (guess: boolean) => void
}

/**
 * The swipe card. Drag right = YES, left = NO. Snaps back if released short of
 * the threshold; flings off and answers if past it. YES/NO buttons and keyboard
 * are handled by the parent Swipe screen (they call the same onAnswer).
 * Honours prefers-reduced-motion: keeps drag as an input but drops the fling and
 * tilt animations.
 */
export function ScenarioCard({ scenario, onAnswer }: ScenarioCardProps) {
  const reduced = useReducedMotion()
  const committed = useRef(false)
  const x = useMotionValue(0)

  const rotate = useTransform(x, [-220, 220], reduced ? [0, 0] : [-12, 12])
  const yesOpacity = useTransform(x, [20, 140], [0, 1])
  const noOpacity = useTransform(x, [-20, -140], [0, 1])
  const cardImage = scenario.image
    ? `${import.meta.env.BASE_URL}${scenario.image.replace(/^\//, '')}`
    : undefined

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (committed.current) return
    const power = info.offset.x + info.velocity.x * 0.2
    if (power > SWIPE_THRESHOLD) commit(true)
    else if (power < -SWIPE_THRESHOLD) commit(false)
    // otherwise the spring (dragConstraints) snaps the card back to centre
  }

  function commit(guess: boolean) {
    if (committed.current) return
    committed.current = true
    onAnswer(guess)
  }

  return (
    <motion.div
      className="relative w-full cursor-grab touch-none select-none rounded-3xl bg-white p-6 shadow-xl ring-1 ring-embl-grey-lightest active:cursor-grabbing sm:p-8"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: reduced ? 1 : 0.98 }}
      initial={reduced ? false : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      {/* Decorative roundel peeking behind the card content */}
      <OrganicShape
        variant="green-lightest"
        blob={1}
        className="pointer-events-none absolute -right-6 -top-8 h-28 w-28"
        opacity={0.6}
      />

      {/* Drag hint overlays */}
      <motion.div
        style={{ opacity: yesOpacity }}
        className="pointer-events-none absolute left-5 top-5 z-10 flex items-center gap-1 rounded-lg border-2 border-embl-green px-3 py-1 text-lg font-bold uppercase text-embl-green"
      >
        <Check className="h-5 w-5" /> Yes
      </motion.div>
      <motion.div
        style={{ opacity: noOpacity }}
        className="pointer-events-none absolute right-5 top-5 z-10 flex items-center gap-1 rounded-lg border-2 border-embl-red px-3 py-1 text-lg font-bold uppercase text-embl-red"
      >
        <X className="h-5 w-5" /> No
      </motion.div>

      <div className="relative">
        <PersonaBadge persona={scenario.persona} />

        {cardImage && (
          <img
            src={cardImage}
            alt=""
            className="mt-4 h-40 w-full rounded-2xl object-cover"
            draggable={false}
          />
        )}

        <p className="mt-5 text-balance text-xl font-medium leading-snug text-embl-grey-darkest sm:text-2xl">
          {scenario.question}
        </p>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-embl-grey">
          Is this a Data Science question?
        </p>
      </div>
    </motion.div>
  )
}
