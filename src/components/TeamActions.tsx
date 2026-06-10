import { ExternalLink, MessageSquare, Ticket } from 'lucide-react'
import type { TeamWithId } from '../content/schema'

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
 * Contact routes for a team, each rendered only if present: a link to the team's
 * page, the Mattermost #channel, and an "Open a ticket" queue. Interactive
 * elements use EMBL link blue. (Email was intentionally removed.)
 */
export function TeamActions({ team }: { team: TeamWithId }) {
  if (!team.link && !team.mattermost && !team.ticket) return null
  return (
    <div className="flex flex-wrap gap-2">
      {team.link && (
        <a className={ACTION_CLASS} href={team.link} target="_blank" rel="noreferrer">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Visit the team page
        </a>
      )}
      {team.mattermost && (
        <a className={ACTION_CLASS} href={team.mattermost} target="_blank" rel="noreferrer">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Join {channelLabel(team.mattermost)}
        </a>
      )}
      {team.ticket && (
        <a className={ACTION_CLASS} href={team.ticket} target="_blank" rel="noreferrer">
          <Ticket className="h-4 w-4" aria-hidden="true" />
          Open a ticket
        </a>
      )}
    </div>
  )
}
