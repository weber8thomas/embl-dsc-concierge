import { useMemo, useState } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import type { Content, Scenario } from '../content/schema'
import { PERSONAS } from '../content/schema'
import { Shell } from '../components/Shell'
import { EntityIcon } from '../components/EntityIcon'
import { EntityActions } from '../components/EntityActions'
import { PersonaBadge } from '../components/PersonaBadge'
import { PERSONA_META } from '../components/personas'

const ALL = '__all__'

const SELECT_CLASS =
  'rounded-lg border border-embl-grey-lightest bg-white px-3 py-2 text-sm font-medium text-embl-grey-darkest focus-visible:outline-embl-link'

export function Directory({ content, onBack }: { content: Content; onBack: () => void }) {
  const [entityId, setEntityId] = useState<string>(ALL)
  const [persona, setPersona] = useState<string>(ALL)
  const [query, setQuery] = useState('')

  // Service areas sorted by name for a stable, scannable dropdown.
  const entityOptions = useMemo(
    () =>
      Object.entries(content.entities)
        .map(([id, e]) => ({ id, name: e.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [content.entities],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return content.scenarios.filter((sc) => {
      if (entityId !== ALL && sc.entity !== entityId) return false
      if (persona !== ALL && sc.persona !== persona) return false
      if (q && !(`${sc.question} ${sc.why} ${sc.entityRef.name}`.toLowerCase().includes(q))) return false
      return true
    })
  }, [content.scenarios, entityId, persona, query])

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
        <h1 className="text-3xl font-bold text-embl-grey-darkest">Directory</h1>
        <p className="mt-1 text-embl-grey-dark">Where do I go for…? Browse and filter every scenario.</p>

        {/* Filters */}
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
            <span className="text-sm font-medium text-embl-grey-dark">Area</span>
            <select className={SELECT_CLASS} value={entityId} onChange={(e) => setEntityId(e.target.value)}>
              <option value={ALL}>All</option>
              {entityOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
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

        <ul className="mt-3 grid gap-4 sm:grid-cols-2">
          {results.map((sc) => (
            <li key={sc.id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-embl-grey-lightest">
              <div className="flex items-center justify-between gap-2">
                <PersonaBadge persona={sc.persona} />
                <span className="text-xs font-semibold uppercase tracking-wide text-embl-grey">
                  {sc.data_science ? 'Data Science' : 'Not DSC'}
                </span>
              </div>

              <p className="mt-3 font-medium text-embl-grey-darkest">{sc.question}</p>
              <p className="mt-2 text-sm text-embl-grey-dark">{sc.why}</p>

              <hr className="my-4 border-embl-grey-lightest" />

              <div className="mt-auto flex items-start gap-3">
                <EntityIcon entity={sc.entityRef} sizeClass="h-10 w-10" iconClass="h-5 w-5" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-embl-grey-darkest">{sc.entityRef.name}</h3>
                  <div className="mt-2">
                    <EntityActions entity={sc.entityRef} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {results.length === 0 && (
          <p className="mt-10 text-center text-embl-grey-dark">No scenarios match those filters. Try widening them.</p>
        )}
      </div>
    </Shell>
  )
}
