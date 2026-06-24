import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { GENERIC_DSC, type Competency, type ResolvedScenario, type TeamWithId } from '../content/schema'
import { TeamIcon } from './TeamIcon'
import { TeamActions } from './TeamActions'
import { ProfileCard } from './ProfileCard'

/** How many example people to show by default (a "show all" toggle reveals the rest). */
const MAX_EXAMPLE_PEOPLE = 3

interface ScenarioResultProps {
  scenario: ResolvedScenario
  competencies: Record<string, Competency>
  /** Show the scenario question quoted at the top (default true). */
  showQuestion?: boolean
}

/** One routed team: icon, name, blurb and an optional role caption ("Start here"). */
function TeamBlock({ team, caption }: { team: TeamWithId; caption?: string }) {
  return (
    <div className="flex items-start gap-4">
      <TeamIcon icon={team.icon} />
      <div className="min-w-0 flex-1">
        {caption && <p className="text-xs font-semibold uppercase tracking-wide text-embl-grey">{caption}</p>}
        <h2 className="text-xl font-bold text-embl-grey-darkest">{team.name}</h2>
        {team.blurb && <p className="mt-1 text-sm text-embl-grey-dark">{team.blurb}</p>}
      </div>
    </div>
  )
}

/**
 * The shared "where to go" result: the why, the routed team(s), the people who
 * can help (when the DSC is involved) and the contact actions. Used both by the
 * game's Reveal screen and by the scenario directory (click a card to open it).
 * For a `shared` scenario it shows both the lead team and the partner team.
 */
export function ScenarioResult({ scenario, competencies, showQuestion = true }: ScenarioResultProps) {
  const [showAll, setShowAll] = useState(false)
  const teamAlso = scenario.teamRefAlso
  const isShared = scenario.data_science === 'shared'
  const isDS = scenario.data_science === true
  // Cross-team scenarios point at the DSC as a whole rather than one specific team.
  const primaryTeam = scenario.cross_team ? GENERIC_DSC : scenario.teamRef

  // Rank example people by competency match, lead first.
  const needs = scenario.needs ?? []
  const score = (m: { competencies?: string[] }) => (m.competencies ?? []).filter((c) => needs.includes(c)).length
  // Pinned `people:` keep their authored order; otherwise rank by competency match, lead first.
  const ranked = scenario.people
    ? [...scenario.matchedMembers]
    : [...scenario.matchedMembers].sort((a, b) => score(b) - score(a) || (b.lead ? 1 : 0) - (a.lead ? 1 : 0))
  const visible = showAll ? ranked : ranked.slice(0, MAX_EXAMPLE_PEOPLE)
  const hiddenCount = ranked.length - MAX_EXAMPLE_PEOPLE

  const channels = scenario.matchedChannels.slice(0, 4)

  return (
    <div>
      {showQuestion && <p className="text-base font-medium text-embl-grey-darkest">“{scenario.question}”</p>}
      <p className={`${showQuestion ? 'mt-3 ' : ''}text-embl-grey-dark`}>{scenario.why}</p>

      <hr className="my-6 border-embl-grey-lightest" />

      <p className="text-xs font-semibold uppercase tracking-wide text-embl-grey">
        {isShared ? 'Who does what' : isDS ? 'Who in the DSC can help' : 'Where to go instead'}
      </p>

      <div className="mt-3 space-y-5">
        <TeamBlock team={primaryTeam} caption={isShared ? 'Start here' : undefined} />
        {teamAlso && <TeamBlock team={teamAlso} caption="…and who handles the rest" />}
      </div>

      {scenario.otherTeamRefs.length > 0 && (
        <div className="mt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-embl-grey">
            Other teams that can help, depending on your use case
          </p>
          <div className="space-y-4">
            {scenario.otherTeamRefs.map((t) => (
              <TeamBlock key={t.id} team={t} />
            ))}
          </div>
        </div>
      )}

      {visible.length > 0 && (
        <div className="mt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-embl-grey">For example, ask</p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((m) => (
              <li key={m.id}>
                <ProfileCard member={m} competencies={competencies} />
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 text-xs font-semibold text-embl-link transition-colors hover:text-embl-link-hover"
            >
              {showAll ? 'Show fewer' : `+${hiddenCount} more (show all)`}
            </button>
          )}
        </div>
      )}

      {channels.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-embl-grey">Related channels</p>
          <ul className="flex flex-wrap gap-2">
            {channels.map((ch) => (
              <li key={ch.id}>
                <a
                  href={ch.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-embl-grey-lightest px-3 py-1 text-sm font-medium text-embl-grey-dark transition-colors hover:bg-embl-green-lightest hover:text-embl-green-dark"
                >
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  {ch.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contact routes for the entry-point team only — the partner is shown
          above under "who does what", so we don't duplicate its team-page link. */}
      <div className="mt-5">
        <TeamActions team={primaryTeam} />
      </div>
    </div>
  )
}
