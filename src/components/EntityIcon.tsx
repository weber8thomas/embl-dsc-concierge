import type { EntityWithId } from '../content/schema'
import { resolveIcon } from './icons'

interface EntityIconProps {
  entity: EntityWithId
  /** Tailwind size for the roundel, e.g. 'h-14 w-14'. */
  sizeClass?: string
  iconClass?: string
}

/**
 * Visual marker for an entity. Distinguishes teams by illustration/icon only
 * (the EMBL no-colour-coding rule): an `image` if the editor supplied one, else
 * the optional lucide `icon`, else a neutral fallback — always inside a green
 * roundel so every team reads as the same brand.
 */
export function EntityIcon({ entity, sizeClass = 'h-14 w-14', iconClass = 'h-7 w-7' }: EntityIconProps) {
  if (entity.image) {
    return (
      <img
        src={`${import.meta.env.BASE_URL}${entity.image.replace(/^\//, '')}`}
        alt=""
        className={`${sizeClass} rounded-roundel object-cover`}
      />
    )
  }
  const Icon = resolveIcon(entity.icon)
  return (
    <span className={`grid ${sizeClass} shrink-0 place-items-center rounded-roundel bg-embl-green-lightest text-embl-green-darkest`}>
      <Icon className={iconClass} aria-hidden="true" />
    </span>
  )
}
