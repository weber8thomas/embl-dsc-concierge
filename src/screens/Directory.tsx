import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ChevronRight, Search, X } from 'lucide-react'
import type { Content, ResolvedScenario, Scenario } from '../content/schema'
import { GENERIC_DSC, PERSONAS } from '../content/schema'
import { Shell } from '../components/Shell'
import { TeamIcon } from '../components/TeamIcon'
import { PersonaBadge } from '../components/PersonaBadge'
import { PERSONA_META } from '../components/personas'
import { ScenarioResult } from '../components/ScenarioResult'

const ALL = '__all__'
const SELECT_CLASS =
  'rounded-lg border border-embl-grey-lightest bg-white px-3 py-2 text-sm font-medium text-embl-grey-darkest focus-visible:outline-embl-link'

/** The three verdict buckets the directory groups scenarios into, in display order. */
const GROUPS: { key: string; label: string; match: (sc: ResolvedScenario) => boolean }[] = [
  { key: 'ds', label: 'Data Science Centre', match: (sc) => sc.data_science === true },
  { key: 'shared', label: 'Shared', match: (sc) => sc.data_science === 'shared' },
  { key: 'no', label: 'Not the DSC', match: (sc) => sc.data_science === false },
]

/**
 * Part of the *game*: a no-timer, filterable browse of the scenarios. Each card
 * opens the same "where do I go" result the game shows (team + people who can
 * help). The broader DSC reference lives separately in the Explore screen.
 */
export function Directory({ content, onBack }: { content: Content; onBack: () => void }) {
  const [team, setTeam] = useState<string>(ALL)
  const [persona, setPersona] = useState<string>(ALL)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ResolvedScenario | null>(null)

  const teamOptions = useMemo(() => Object.entries(content.teams).map(([id, t]) => ({ id, name: t.name })), [content.teams])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return content.scenarios.filter((sc) => {
      if (team !== ALL && sc.team !== team) return false
      if (persona !== ALL && sc.persona !== persona) return false
      if (q && !`${sc.question} ${sc.why} ${sc.teamRef.name}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [content.scenarios, team, persona, query])

  return (
    <Shell
      width="wide"
      lead={
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-embl-link transition-colors hover:text-embl-link-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
      }
    >
      <div className="py-2">
        <h1 className="text-3xl font-bold text-embl-grey-darkest">Scenario directory</h1>
        <p className="mt-1 text-embl-grey-dark">Where do I go for…? Tap any scenario to see who can help.</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="relative flex-1 basis-56">
            <span className="sr-only">Search scenarios</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-embl-grey" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-lg border border-embl-grey-lightest bg-white py-2 pl-9 pr-3 text-sm text-embl-grey-darkest focus-visible:outline-embl-link"
            />
          </label>

          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-embl-grey-dark">Team</span>
            <select className={SELECT_CLASS} value={team} onChange={(e) => setTeam(e.target.value)}>
              <option value={ALL}>All</option>
              {teamOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-embl-grey-dark">Who</span>
            <select className={SELECT_CLASS} value={persona} onChange={(e) => setPersona(e.target.value)}>
              <option value={ALL}>Anyone</option>
              {PERSONAS.map((p) => (
                <option key={p} value={p}>
                  {PERSONA_META[p as Scenario['persona']].label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-4 text-sm text-embl-grey" aria-live="polite">
          {results.length} {results.length === 1 ? 'scenario' : 'scenarios'}
        </p>

        {results.length === 0 ? (
          <p className="mt-10 text-center text-embl-grey-dark">No scenarios match those filters. Try widening them.</p>
        ) : (
          <div className="mt-4 space-y-8">
            {GROUPS.map((g) => {
              const items = results.filter(g.match)
              if (items.length === 0) return null
              return (
                <section key={g.key}>
                  <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-embl-grey">
                    {g.label}
                    <span className="rounded-full bg-embl-grey-lightest px-2 py-0.5 text-xs font-semibold text-embl-grey-dark">
                      {items.length}
                    </span>
                  </h2>
                  <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((sc) => (
                      <li key={sc.id}>
                        <button
                          type="button"
                          onClick={() => setSelected(sc)}
                          className="flex h-full w-full flex-col rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-embl-grey-lightest transition hover:shadow-md hover:ring-embl-green focus-visible:outline-embl-link"
                        >
                          <PersonaBadge persona={sc.persona} />
                          <p className="mt-3 font-medium text-embl-grey-darkest">{sc.question}</p>
                          {(() => {
                            // Cross-team scenarios show the generic DSC label, matching the reveal.
                            const card = sc.cross_team ? GENERIC_DSC : sc.teamRef
                            return (
                              <div className="mt-auto flex items-center gap-2 pt-4 text-sm font-semibold text-embl-link">
                                <TeamIcon icon={card.icon} sizeClass="h-7 w-7" iconClass="h-4 w-4" />
                                <span className="min-w-0 flex-1 truncate text-embl-grey-darkest">{card.name}</span>
                                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                              </div>
                            )
                          })()}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </div>

      {selected && (
        <ScenarioDialog key={selected.id} scenario={selected} competencies={content.competencies} onClose={() => setSelected(null)} />
      )}
    </Shell>
  )
}

function ScenarioDialog({
  scenario,
  competencies,
  onClose,
}: {
  scenario: ResolvedScenario
  competencies: Content['competencies']
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-embl-grey-darkest/60 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Scenario result"
    >
      <div
        className="relative my-auto w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Close"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-embl-grey-dark transition-colors hover:bg-embl-grey-lightest"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <ScenarioResult scenario={scenario} competencies={competencies} />
      </div>
    </div>
  )
}
