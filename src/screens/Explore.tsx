import { lazy, Suspense, useState } from 'react'
import { ArrowLeft, ExternalLink, Search, X } from 'lucide-react'
import type { Content, MemberWithId } from '../content/schema'
import { Shell } from '../components/Shell'
import { ProfileCard } from '../components/ProfileCard'

const NetworkGraph = lazy(() => import('../components/NetworkGraph'))
type GroupBy = 'team' | 'competency'

const ALL = '__all__'
const TABS = ['people', 'network', 'platforms', 'training', 'services'] as const
type Tab = (typeof TABS)[number]
const TAB_LABEL: Record<Tab, string> = {
  people: 'People',
  network: 'Network',
  platforms: 'Platforms',
  training: 'Training',
  services: 'Services',
}

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

function logoInitials(name: string): string {
  return name
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

/**
 * Square brand mark for platform / service cards. Shows the supplied logo image
 * when present, otherwise a consistent lettered placeholder in EMBL green so
 * every card stays visually identifiable even before real logos are added.
 */
function CardLogo({ name, logo }: { name: string; logo?: string }) {
  const [ok, setOk] = useState(Boolean(logo))
  if (logo && ok) {
    return (
      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1 ring-1 ring-embl-grey-lightest">
        <img src={logo} alt="" loading="lazy" onError={() => setOk(false)} className="h-full w-full object-contain" />
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-embl-green-lightest text-sm font-bold text-embl-green-darkest ring-1 ring-embl-green-light/40"
    >
      {logoInitials(name)}
    </span>
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
  const [selected, setSelected] = useState<MemberWithId | null>(null)
  const [groupBy, setGroupBy] = useState<GroupBy>('competency')

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
          {tab !== 'network' && (
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
          )}

          {(tab === 'people' || tab === 'network') && (
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

        {tab === 'network' && (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-embl-grey-dark">Group people by</span>
              <div className="inline-flex rounded-full bg-embl-grey-lightest p-0.5" role="tablist" aria-label="Group people by">
                {(['competency', 'team'] as const).map((g) => (
                  <button
                    key={g}
                    role="tab"
                    aria-selected={groupBy === g}
                    onClick={() => setGroupBy(g)}
                    className={`rounded-full px-4 py-1 text-sm font-semibold capitalize transition-colors ${
                      groupBy === g ? 'bg-embl-green text-white' : 'text-embl-grey-dark hover:text-embl-grey-darkest'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm text-embl-grey">
              {groupBy === 'competency'
                ? 'People are linked to everyone they share a competency with, and clustered by their main competency.'
                : 'People are grouped into separate team areas.'}{' '}
              Team leads are ringed in amber, chairs in blue. Hover a face to highlight its connections; click to open the
              profile. Use the filters above to dim everything outside a team or competency.
            </p>
            <div className="mt-3">
              <Suspense fallback={<GraphLoading />}>
                <NetworkGraph
                  content={content}
                  groupBy={groupBy}
                  focusTeam={team === ALL ? null : team}
                  focusCompetency={competency === ALL ? null : competency}
                  onSelectMember={setSelected}
                />
              </Suspense>
            </div>
          </>
        )}

        {tab === 'platforms' && (
          <ul className={`mt-5 ${GRID}`}>
            {platforms.map(([id, p]) => (
              <li key={id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-embl-grey-lightest">
                <div className="flex items-start gap-3">
                  <CardLogo name={p.name} logo={p.logo} />
                  <div className="min-w-0">
                    {p.category && (
                      <span className="text-xs font-semibold uppercase tracking-wide text-embl-grey">{p.category}</span>
                    )}
                    <h3 className="font-semibold text-embl-grey-darkest">{p.name}</h3>
                  </div>
                </div>
                {p.blurb && <p className="mt-2 text-sm text-embl-grey-dark">{p.blurb}</p>}
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
                <div className="flex items-start gap-3">
                  <CardLogo name={s.name} logo={s.logo} />
                  <h3 className="font-semibold text-embl-grey-darkest">{s.name}</h3>
                </div>
                {s.blurb && <p className="mt-2 text-sm text-embl-grey-dark">{s.blurb}</p>}
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

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-embl-grey-darkest/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="absolute -right-2 -top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white text-embl-grey-dark shadow-md ring-1 ring-embl-grey-lightest transition-colors hover:text-embl-grey-darkest"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <ProfileCard member={selected} competencies={content.competencies} />
          </div>
        </div>
      )}
    </Shell>
  )
}

function GraphLoading() {
  return (
    <div className="grid h-[68vh] min-h-[420px] w-full place-items-center rounded-2xl bg-embl-grey-lightest/30 ring-1 ring-embl-grey-lightest">
      <p className="text-sm text-embl-grey-dark">Loading network…</p>
    </div>
  )
}

function Empty() {
  return <p className="mt-10 text-center text-embl-grey-dark">Nothing matches those filters. Try widening them.</p>
}
