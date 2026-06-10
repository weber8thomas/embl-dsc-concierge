import { Roundel } from './OrganicShape'

/**
 * Placeholder for the EMBL Data Science Centre (DSC) logo.
 *
 * The real DSC logo isn't bundled — this is a neutral stand-in (an EMBL roundel
 * lettered "DSC"). When the approved DSC logo is available, drop it into /public
 * and swap this component's contents (e.g. render an <img>), no other change
 * needed.
 */
export function DscLogo({ className }: { className?: string }) {
  return (
    <Roundel ring className={`font-bold tracking-tight ${className ?? ''}`}>
      DSC
    </Roundel>
  )
}
