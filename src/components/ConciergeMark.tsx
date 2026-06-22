/**
 * The DSC Concierge product mark: a central hub linked out to satellite nodes,
 * centred in the EMBL green roundel. It reads as one central place to explore
 * and visualise what the DSC offers (and echoes the network graph in Explore +
 * the constellation motif on the landing). The geometry is symmetric about the
 * centre so it sits dead-centre in the circle. The same artwork is the favicon
 * (public/favicon.svg), so it survives down to 16px.
 */
export function ConciergeMark({ className, title = 'DSC Concierge' }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <circle cx="32" cy="32" r="32" fill="var(--embl-green)" />
      <circle cx="32" cy="32" r="27.5" fill="none" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="2" />
      <g stroke="#ffffff" strokeLinecap="round">
        <path d="M32,19.5 L44.5,32 L32,44.5 L19.5,32 Z" fill="none" strokeOpacity="0.5" strokeWidth="1.3" />
        <g strokeWidth="2.3">
          <line x1="32" y1="32" x2="32" y2="19.5" />
          <line x1="32" y1="32" x2="44.5" y2="32" />
          <line x1="32" y1="32" x2="32" y2="44.5" />
          <line x1="32" y1="32" x2="19.5" y2="32" />
        </g>
      </g>
      <g fill="#ffffff">
        <circle cx="32" cy="19.5" r="2.9" />
        <circle cx="44.5" cy="32" r="2.9" />
        <circle cx="32" cy="44.5" r="2.9" />
        <circle cx="19.5" cy="32" r="2.9" />
        <circle cx="32" cy="32" r="4.5" />
      </g>
    </svg>
  )
}
