import type { ReactNode } from 'react'
import { Logo } from './Logo'
import { OrganicShape } from './OrganicShape'

interface ShellProps {
  children: ReactNode
  /** Optional element shown at the top-left of the header (e.g. a back button). */
  lead?: ReactNode
  /** Constrain content width; swipe uses a narrower column than the directory. */
  width?: 'narrow' | 'wide'
}

/**
 * Consistent page frame: EMBL logo slot top-right, soft green roundels in the
 * background (the signature element), and a centred content column. Green-led,
 * white-led, whitespace-driven.
 */
export function Shell({ children, lead, width = 'narrow' }: ShellProps) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-white">
      {/* Background roundels — purely decorative */}
      <OrganicShape
        variant="green-lightest"
        blob={0}
        opacity={0.5}
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72"
      />
      <OrganicShape
        variant="green-lightest"
        blob={2}
        opacity={0.4}
        className="pointer-events-none absolute -right-28 bottom-0 h-96 w-96"
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <div className="min-h-[2rem]">{lead}</div>
        <Logo />
      </header>

      <main
        className={`relative z-10 mx-auto flex w-full flex-1 flex-col px-5 pb-10 sm:px-8 ${
          width === 'narrow' ? 'max-w-xl' : 'max-w-4xl'
        }`}
      >
        {children}
      </main>
    </div>
  )
}
