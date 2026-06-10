/**
 * EMBL signature element: soft organic roundels used decoratively to frame cards
 * and divide sections. Purely presentational (aria-hidden). Rendered in green
 * tints only — no per-team colour coding.
 */
type Variant = 'green' | 'green-dark' | 'green-light' | 'green-lightest'

const FILLS: Record<Variant, string> = {
  green: 'var(--embl-green)',
  'green-dark': 'var(--embl-green-dark)',
  'green-light': 'var(--embl-green-light)',
  'green-lightest': 'var(--embl-green-lightest)',
}

// A few hand-tuned blob paths so the shapes read as organic, not circular.
const BLOBS = [
  'M44.4,-58.9C56.1,-49.4,63.2,-34.4,67.1,-18.6C71,-2.8,71.6,13.8,65.3,27.4C59,41,45.8,51.6,31.4,58.9C17,66.2,1.4,70.2,-14.7,68.3C-30.8,66.4,-47.4,58.6,-58.4,45.7C-69.4,32.8,-74.8,14.8,-73.3,-2.4C-71.8,-19.6,-63.4,-36,-51,-46.2C-38.6,-56.4,-22.2,-60.4,-4.6,-55.1C13,-49.8,26,-68.4,44.4,-58.9Z',
  'M39.3,-52.6C50.9,-44.6,60.2,-32.9,64.6,-19.2C69,-5.5,68.5,10.2,62.4,23.2C56.3,36.2,44.6,46.5,31.4,54.3C18.2,62.1,3.5,67.4,-11.9,66.7C-27.3,66,-43.4,59.3,-54.4,47.6C-65.4,35.9,-71.3,19.2,-71.6,2.3C-71.9,-14.6,-66.6,-31.7,-55.6,-43.5C-44.6,-55.3,-27.9,-61.8,-11.4,-61.4C5.1,-61,27.7,-60.6,39.3,-52.6Z',
  'M47.7,-61.6C61.1,-52,70.5,-36.8,72.9,-20.8C75.3,-4.8,70.7,12,62.6,26.6C54.5,41.2,42.9,53.6,28.6,60.8C14.3,68,-2.7,70,-18.4,65.7C-34.1,61.4,-48.5,50.8,-58.3,36.8C-68.1,22.8,-73.3,5.4,-70.6,-10.6C-67.9,-26.6,-57.3,-41.2,-44,-50.8C-30.7,-60.4,-15.3,-65,1.4,-66.9C18.2,-68.8,36.3,-71.2,47.7,-61.6Z',
]

interface OrganicShapeProps {
  variant?: Variant
  className?: string
  blob?: 0 | 1 | 2
  opacity?: number
}

export function OrganicShape({ variant = 'green-lightest', className, blob = 0, opacity = 1 }: OrganicShapeProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="-80 -80 160 160"
      className={className}
      style={{ opacity }}
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={BLOBS[blob]} fill={FILLS[variant]} />
    </svg>
  )
}
