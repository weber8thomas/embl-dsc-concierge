import { resolveIcon } from './icons'

/**
 * Visual marker for a team. Teams are distinguished by icon only (the EMBL
 * no-colour-coding rule), shown inside a green roundel so every team reads as
 * the same brand. Unknown icon names fall back to a neutral icon.
 */
export function TeamIcon({
  icon,
  sizeClass = 'h-14 w-14',
  iconClass = 'h-7 w-7',
}: {
  icon?: string
  sizeClass?: string
  iconClass?: string
}) {
  const Icon = resolveIcon(icon)
  return (
    <span className={`grid ${sizeClass} shrink-0 place-items-center rounded-roundel bg-embl-green-lightest text-embl-green-darkest`}>
      <Icon className={iconClass} aria-hidden="true" />
    </span>
  )
}
