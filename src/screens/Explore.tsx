import { useState } from 'react'
import { ArrowLeft, ExternalLink, Search } from 'lucide-react'
import type { Content } from '../content/schema'
import { Shell } from '../components/Shell'
import { ProfileCard } from '../components/ProfileCard'

const ALL = '__all__'
const TABS = ['people', 'platforms', 'training', 'services'] as const
type Tab = (typeof TABS)[number]
const TAB_LABEL: Record<Tab, string> = { people: 'People', platforms: 'Platforms', training: 'Training', services: 'Services' }

const SELECT_CLASS =
  'rounded-lg border border-embl-grey-lightest bg-white px-3 py-2 text-sm font-medium text-embl-grey-darkest focus-visible:outline-embl-link'
const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'

function PillarChips({ pillars, labels }: { pillars?: string[]; labels: Record<string, string> }) {
  if (!pillars || pillars.length === 0) return null
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {pillars.map((p) => (
        <li key={p} className="rounded-full bg-embl-green-lightest px-2.5 py-0.5 text-xs font-medium text-embl-green-darkest">
          {labels[p] ?? p}
        </li>
      ))}
    </ul>
  )
}

function CardLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-embl-link transition-colors hover:text-embl-link-hover"
    >
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
      Learn more
    </a>
  )
}

/**
 * "Explore the DSC" — the reference catalogue of the Data Science Centre,
 * separate from the Concierge game: People, Platforms, Training and Services.
 */
export function Explore({ content, onBack, initialTab = 'people' }: { content: Content; onBack: () => void; initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [query, setQuery] = useState('')
  const [team, setTeam] = useState<string>(ALL)
  const [competency, setCompetency] = useState<string>(ALL)

  const q = query.trim().toLowerCase()
  const pillarLabels = Object.fromEntries(Object.entries(content.pillars).map(([id, p]) => [id, p.name]))

  const members = content.members.filter((m) => {
    if (team !== ALL && m.team !== team) return false
    if (competency !== ALL && !(m.competencies ?? []).includes(competency)) return false
    if (q && !`${m.name} ${m.position ?? ''}`.toLowerCase().includes(q)) return false
    return true
  })
  const peopleByTeam = Object.keys(content.teams)
    .map((id) => ({ id, team: content.teams[id], members: members.filter((m) => m.team === id) }))
    .filter((g) => g.members.length > 0)

  const platforms = Object.entries(content.platforms).filter(
    ([, p]) => !q || `${p.name} ${p.blurb ?? ''} ${p.category ?? ''}`.toLowerCase().includes(q),
  )
  const training = Object.entries(content.training).filter(([, t]) => !q || `${t.name} ${t.blurb ?? ''}`.toLowerCase().includes(q))
  const services = content.services.filter((s) => !q || `${s.name} ${s.blurb ?? ''}`.toLowerCase().includes(q))

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
        <h1 className="text-3xl font-bold text-embl-grey-darkest">Explore the DSC</h1>
        <p className="mt-1 text-embl-grey-dark">The people, platforms, training and services of the EMBL Data Science Centre.</p>

        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Explore sections">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                tab === t ? 'bg-embl-green text-white' : 'bg-embl-grey-lightest text-embl-grey-dark hover:bg-embl-green-lightest'
              }`}
            >
              {TAB_LABEL[t]}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label className="relative flex-1 basis-56">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-embl-grey" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-lg border border-embl-grey-lightest bg-white py-2 pl-9 pr-3 text-sm text-embl-grey-darkest focus-visible:outline-embl-link"
            />
          </label>

          {tab === 'people' && (
            <>
              <label className="flex items-center gap-2">
                <span className="text-sm font-medium text-embl-grey-dark">Team</span>
                <select className={SELECT_CLASS} value={team} onChange={(e) => setTeam(e.target.value)}>
                  <option value={ALL}>All</option>
                  {Object.entries(content.teams).map(([id, t]) => (
                    <option key={id} value={id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-sm font-medium text-embl-grey-dark">Competency</span>
                <select className={SELECT_CLASS} value={competency} onChange={(e) => setCompetency(e.target.value)}>
                  <option value={ALL}>Any</option>
                  {Object.entries(content.competencies).map(([id, c]) => (
                    <option key={id} value={id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>

        {tab === 'people' && (
          <>
            <p className="mt-4 text-sm text-embl-grey" aria-live="polite">
              {members.length} {members.length === 1 ? 'person' : 'people'}
            </p>
            {peopleByTeam.map((g) => (
              <section key={g.id} className="mt-6">
                <h2 className="text-lg font-bold text-embl-grey-darkest">{g.team.name}</h2>
                <ul className={`mt-3 ${GRID}`}>
                  {g.members.map((m) => (
                    <li key={m.id}>
                      <ProfileCard member={m} competencies={content.competencies} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {members.length === 0 && <Empty />}
          </>
        )}

        {tab === 'platforms' && (
          <ul className={`mt-5 ${GRID}`}>
            {platforms.map(([id, p]) => (
              <li key={id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-embl-grey-lightest">
                {p.category && <span className="text-xs font-semibold uppercase tracking-wide text-embl-grey">{p.category}</span>}
                <h3 className="mt-1 font-semibold text-embl-grey-darkest">{p.name}</h3>
                {p.blurb && <p className="mt-1 text-sm text-embl-grey-dark">{p.blurb}</p>}
                <PillarChips pillars={p.pillars} labels={pillarLabels} />
                {p.url && <CardLink href={p.url} />}
              </li>
            ))}
          </ul>
        )}

        {tab === 'training' && (
          <ul className={`mt-5 ${GRID}`}>
            {training.map(([id, t]) => (
              <li key={id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-embl-grey-lightest">
                <h3 className="font-semibold text-embl-grey-darkest">{t.name}</h3>
                {t.blurb && <p className="mt-1 text-sm text-embl-grey-dark">{t.blurb}</p>}
                <PillarChips pillars={t.pillars} labels={pillarLabels} />
                {t.url && <CardLink href={t.url} />}
              </li>
            ))}
          </ul>
        )}

        {tab === 'services' && (
          <ul className={`mt-5 ${GRID}`}>
            {services.map((s) => (
              <li key={s.id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-embl-grey-lightest">
                <h3 className="font-semibold text-embl-grey-darkest">{s.name}</h3>
                {s.blurb && <p className="mt-1 text-sm text-embl-grey-dark">{s.blurb}</p>}
                {s.team && content.teams[s.team] && (
                  <p className="mt-2 text-xs font-medium text-embl-grey">{content.teams[s.team].name}</p>
                )}
                <div className="mt-auto pt-3">
                  {s.link ? <CardLink href={s.link} /> : <span className="text-xs italic text-embl-grey">Link coming soon</span>}
                </div>
              </li>
            ))}
            {services.length === 0 && <Empty />}
          </ul>
        )}
      </div>
    </Shell>
  )
}

function Empty() {
  return <p className="mt-10 text-center text-embl-grey-dark">Nothing matches those filters. Try widening them.</p>
}
