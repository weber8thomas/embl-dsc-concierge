import { ExternalLink, Mail, MessageSquare, Ticket } from 'lucide-react'
import type { EntityWithId } from '../content/schema'

/** Pull a readable "#channel" label out of a Mattermost URL's last segment. */
function channelLabel(url: string): string {
  try {
    const seg = new URL(url).pathname.split('/').filter(Boolean).pop()
    return seg ? `#${seg}` : 'the channel'
  } catch {
    return 'the channel'
  }
}

const ACTION_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-embl-link px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-embl-link-hover focus-visible:outline-offset-2'

/**
 * Renders only the action buttons whose data is present on the entity, so a team
 * with no Mattermost simply shows no Mattermost button. Interactive elements use
 * EMBL link blue.
 */
export function EntityActions({ entity }: { entity: EntityWithId }) {
  const emails = (entity.people ?? []).map((p) => p.email).filter((e): e is string => !!e)

  const hasAny = entity.ticket || entity.mattermost || emails.length > 0 || entity.link
  if (!hasAny) return null

  return (
    <div className="flex flex-wrap gap-2">
      {entity.ticket && (
        <a className={ACTION_CLASS} href={entity.ticket} target="_blank" rel="noreferrer">
          <Ticket className="h-4 w-4" aria-hidden="true" />
          Open a ticket
        </a>
      )}
      {entity.mattermost && (
        <a className={ACTION_CLASS} href={entity.mattermost} target="_blank" rel="noreferrer">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Join {channelLabel(entity.mattermost)}
        </a>
      )}
      {emails.length > 0 && (
        <a className={ACTION_CLASS} href={`mailto:${emails.join(',')}`}>
          <Mail className="h-4 w-4" aria-hidden="true" />
          Email
        </a>
      )}
      {entity.link && (
        <a className={ACTION_CLASS} href={entity.link} target="_blank" rel="noreferrer">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Visit website
        </a>
      )}
    </div>
  )
}
