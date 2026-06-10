import type { ReactNode } from 'react'
import { Home } from 'lucide-react'
import { Logo } from './Logo'
import { OrganicShape } from './OrganicShape'
import { DataField } from './DataField'

interface ShellProps {
  children: ReactNode
  /** Optional element shown at the top-left of the header (e.g. a back button). */
  lead?: ReactNode
  /** If set, shows a Home button at the top-left that returns to the landing screen. */
  onHome?: () => void
  /** Constrain content width; swipe uses a narrower column than the directory. */
  width?: 'narrow' | 'wide'
}

/**
 * Consistent page frame: EMBL logo slot top-right, soft green roundels in the
 * background (the signature element), and a centred content column. Green-led,
 * white-led, whitespace-driven.
 */
export function Shell({ children, lead, onHome, width = 'narrow' }: ShellProps) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-white">
      {/* Subtle data-science motif (dot grid + node-link), behind the organic shapes */}
      <DataField />

      {/* Background organic shapes — subtle, green, bleeding off the edges (EMBL rule) */}
      <OrganicShape
        gradient="light-depth"
        blob={0}
        opacity={0.5}
        className="pointer-events-none absolute -left-28 top-16 h-80 w-80"
      />
      <OrganicShape
        gradient="light-depth"
        blob={2}
        opacity={0.4}
        className="pointer-events-none absolute -right-32 bottom-0 h-[26rem] w-[26rem]"
      />

      {/* Logo top-left (EMBL digital rule); navigation top-right. */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <Logo />
        <div className="flex min-h-[2rem] items-center">
          {lead}
          {!lead && onHome && (
            <button
              type="button"
              onClick={onHome}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-embl-link transition-colors hover:text-embl-link-hover"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Home
            </button>
          )}
        </div>
      </header>

      <main
        className={`relative z-10 mx-auto flex w-full flex-1 flex-col px-5 pb-10 sm:px-8 ${
          width === 'narrow' ? 'max-w-xl' : 'max-w-6xl'
        }`}
      >
        {children}
      </main>
    </div>
  )
}
