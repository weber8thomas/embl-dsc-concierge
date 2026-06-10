import { useRef } from 'react'
import { motion, useReducedMotion, useTransform, type MotionValue, type PanInfo } from 'framer-motion'
import type { ResolvedScenario } from '../content/schema'
import { PersonaBadge } from './PersonaBadge'
import { OrganicShape } from './OrganicShape'

const SWIPE_THRESHOLD = 90 // px (offset + projected velocity) to count as a swipe

interface ScenarioCardProps {
  scenario: ResolvedScenario
  /** Shared horizontal drag position, owned by the Swipe screen so it can also
   *  drive the YES/NO indicators rendered above the card. */
  x: MotionValue<number>
  onAnswer: (guess: boolean) => void
}

/**
 * The swipe card. Drag right = YES, left = NO. Snaps back if released short of
 * the threshold; flings off and answers if past it. The YES/NO indicators,
 * buttons and keyboard are handled by the parent Swipe screen.
 * Honours prefers-reduced-motion: keeps drag as an input but drops the tilt.
 */
export function ScenarioCard({ scenario, x, onAnswer }: ScenarioCardProps) {
  const reduced = useReducedMotion()
  const committed = useRef(false)
  const rotate = useTransform(x, [-220, 220], reduced ? [0, 0] : [-12, 12])
  const cardImage = scenario.image ? `${import.meta.env.BASE_URL}${scenario.image.replace(/^\//, '')}` : undefined

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
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.85}
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

      <div className="relative">
        <PersonaBadge persona={scenario.persona} />

        {cardImage && (
          <img src={cardImage} alt="" className="mt-4 h-40 w-full rounded-2xl object-cover" draggable={false} />
        )}

        <p className="mt-5 text-balance text-xl font-medium leading-snug text-embl-grey-darkest sm:text-2xl">
          {scenario.question}
        </p>
      </div>
    </motion.div>
  )
}
