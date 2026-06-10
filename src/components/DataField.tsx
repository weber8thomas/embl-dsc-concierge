import { useId } from 'react'

/**
 * Subtle "data science" background motif: a faint dot-grid of data points with a
 * small node-link network, in EMBL green at low opacity. Decorative only
 * (aria-hidden) and kept quiet so the layout stays white-led, per EMBL.
 */
export function DataField({ className }: { className?: string }) {
  const dots = useId().replace(/:/g, '')
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}>
      {/* Dot grid — reads as scattered data points */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={`grid-${dots}`} width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="var(--embl-green)" opacity="0.07" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${dots})`} />
      </svg>

      {/* A small node-link network accent, top-right */}
      <svg
        className="absolute right-[-2rem] top-10 h-64 w-64 text-embl-green"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
      >
        <g opacity="0.12" strokeWidth="1.5">
          <line x1="30" y1="40" x2="90" y2="70" />
          <line x1="90" y1="70" x2="150" y2="35" />
          <line x1="90" y1="70" x2="120" y2="130" />
          <line x1="120" y1="130" x2="60" y2="150" />
          <line x1="150" y1="35" x2="170" y2="95" />
          <line x1="120" y1="130" x2="170" y2="95" />
        </g>
        <g fill="currentColor" opacity="0.18">
          <circle cx="30" cy="40" r="4" />
          <circle cx="90" cy="70" r="6" />
          <circle cx="150" cy="35" r="4" />
          <circle cx="120" cy="130" r="5" />
          <circle cx="60" cy="150" r="4" />
          <circle cx="170" cy="95" r="4" />
        </g>
      </svg>
    </div>
  )
}
