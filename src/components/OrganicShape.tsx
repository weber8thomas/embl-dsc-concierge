import { useId } from 'react'

/**
 * EMBL signature element: soft *organic shapes* (blobs) used decoratively to give
 * background depth and frame content. Per the EMBL graphical-elements guidelines
 * they are flowing with no straight lines, used subtly, bleed off at least one
 * edge of the composition, and may carry a green→dark-green gradient for depth.
 * Green-led only — no per-team colour coding. Purely presentational (aria-hidden).
 *
 * Note: the EMBL *roundel* (a clean circle, like a petri dish / lens) is a
 * separate element — see <Roundel> below.
 */
type Fill = 'green' | 'green-dark' | 'green-light' | 'green-lightest'
type Gradient = 'green-depth' | 'light-depth'

const SOLID: Record<Fill, string> = {
  green: 'var(--embl-green)',
  'green-dark': 'var(--embl-green-dark)',
  'green-light': 'var(--embl-green-light)',
  'green-lightest': 'var(--embl-green-lightest)',
}

const GRADIENTS: Record<Gradient, [string, string]> = {
  // main green → dark green (an EMBL-approved organic-shape gradient)
  'green-depth': ['var(--embl-green)', 'var(--embl-green-darkest)'],
  // a soft tint gradient for quiet backgrounds
  'light-depth': ['var(--embl-green-lightest)', 'var(--embl-green-light)'],
}

// Flowing blob silhouettes (no straight lines). Hand-tuned to feel organic.
const BLOBS = [
  'M43.6,-57.4C56.3,-49.1,66.2,-36.3,70.6,-21.6C75,-6.9,73.9,9.7,67.6,23.7C61.3,37.7,49.8,49.1,36.4,57.8C23,66.5,7.7,72.5,-8.6,72.4C-24.9,72.3,-42.2,66.1,-54.3,54.3C-66.4,42.5,-73.3,25.1,-74.6,7.3C-75.9,-10.5,-71.6,-28.7,-61.2,-42.2C-50.8,-55.7,-34.3,-64.5,-18.2,-66.9C-2.1,-69.3,13.6,-65.3,43.6,-57.4Z',
  'M39.3,-52.6C50.9,-44.6,60.2,-32.9,64.6,-19.2C69,-5.5,68.5,10.2,62.4,23.2C56.3,36.2,44.6,46.5,31.4,54.3C18.2,62.1,3.5,67.4,-11.9,66.7C-27.3,66,-43.4,59.3,-54.4,47.6C-65.4,35.9,-71.3,19.2,-71.6,2.3C-71.9,-14.6,-66.6,-31.7,-55.6,-43.5C-44.6,-55.3,-27.9,-61.8,-11.4,-61.4C5.1,-61,27.7,-60.6,39.3,-52.6Z',
  'M47.7,-61.6C61.1,-52,70.5,-36.8,72.9,-20.8C75.3,-4.8,70.7,12,62.6,26.6C54.5,41.2,42.9,53.6,28.6,60.8C14.3,68,-2.7,70,-18.4,65.7C-34.1,61.4,-48.5,50.8,-58.3,36.8C-68.1,22.8,-73.3,5.4,-70.6,-10.6C-67.9,-26.6,-57.3,-41.2,-44,-50.8C-30.7,-60.4,-15.3,-65,1.4,-66.9C18.2,-68.8,36.3,-71.2,47.7,-61.6Z',
]

interface OrganicShapeProps {
  variant?: Fill
  gradient?: Gradient
  className?: string
  blob?: 0 | 1 | 2
  opacity?: number
}

export function OrganicShape({ variant = 'green-lightest', gradient, className, blob = 0, opacity = 1 }: OrganicShapeProps) {
  const id = useId()
  const stops = gradient ? GRADIENTS[gradient] : null
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="-80 -80 160 160"
      className={className}
      style={{ opacity }}
      preserveAspectRatio="xMidYMid meet"
    >
      {stops && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={stops[0]} />
            <stop offset="100%" stopColor={stops[1]} />
          </linearGradient>
        </defs>
      )}
      <path d={BLOBS[blob]} fill={stops ? `url(#${id})` : SOLID[variant]} />
    </svg>
  )
}

/**
 * The EMBL *roundel*: a clean circle (evoking a petri dish / lens), solid or with
 * a subtle concentric ring. Distinct from the organic blobs above.
 */
export function Roundel({
  className,
  ring = false,
  children,
}: {
  className?: string
  ring?: boolean
  children?: React.ReactNode
}) {
  return (
    <span className={`relative grid aspect-square place-items-center rounded-full bg-embl-green text-white ${className ?? ''}`}>
      {ring && <span className="pointer-events-none absolute inset-[7%] rounded-full ring-2 ring-white/35" />}
      {children}
    </span>
  )
}
