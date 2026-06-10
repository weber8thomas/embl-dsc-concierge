import type { Competency, ResolvedScenario } from '../content/schema'
import { TeamIcon } from './TeamIcon'
import { TeamActions } from './TeamActions'
import { ProfileCard } from './ProfileCard'

interface ScenarioResultProps {
  scenario: ResolvedScenario
  competencies: Record<string, Competency>
  /** Show the scenario question quoted at the top (default true). */
  showQuestion?: boolean
}

/**
 * The shared "where to go" result: the why, the routed team, the people who can
 * help (for a DS question) and the contact actions. Used both by the game's
 * Reveal screen and by the scenario directory (click a card to open it).
 */
export function ScenarioResult({ scenario, competencies, showQuestion = true }: ScenarioResultProps) {
  const team = scenario.teamRef
  const isDS = scenario.data_science
  const people = scenario.matchedMembers

  return (
    <div>
      {showQuestion && <p className="text-base font-medium text-embl-grey-darkest">“{scenario.question}”</p>}
      <p className={`${showQuestion ? 'mt-3 ' : ''}text-embl-grey-dark`}>{scenario.why}</p>

      <hr className="my-6 border-embl-grey-lightest" />

      <p className="text-xs font-semibold uppercase tracking-wide text-embl-grey">
        {isDS ? 'Who in the DSC can help' : 'Where to go instead'}
      </p>

      <div className="mt-3 flex items-start gap-4">
        <TeamIcon icon={team.icon} />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-embl-grey-darkest">{team.name}</h2>
          {team.blurb && <p className="mt-1 text-sm text-embl-grey-dark">{team.blurb}</p>}
        </div>
      </div>

      {isDS && people.length > 0 && (
        <div className="mt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-embl-grey">
            {people.length === 1 ? 'Ask' : 'People who can help'}
          </p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((m) => (
              <li key={m.id}>
                <ProfileCard member={m} competencies={competencies} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5">
        <TeamActions team={team} />
      </div>
    </div>
  )
}
