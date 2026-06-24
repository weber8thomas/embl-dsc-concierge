import { lazy, Suspense, useState } from 'react'
import { ArrowLeft, ExternalLink, MessageSquare, Search } from 'lucide-react'
import type { Content } from '../content/schema'
import { Shell } from '../components/Shell'
import { ProfileCard } from '../components/ProfileCard'
import { resolveIcon } from '../components/icons'

const NetworkGraph = lazy(() => import('../components/NetworkGraph'))
type GroupBy = 'team' | 'competency'

const ALL = '__all__'
/** Where the Consulting tab's banner CTA sends people to book a session. */
const CONSULTING_BOOKING_URL = 'https://bio-it.embl.de/datascience-consulting/'
const TABS = ['people', 'network', 'platforms', 'training', 'consulting', 'community'] as const
export type Tab = (typeof TABS)[number]
const TAB_LABEL: Record<Tab, string> = {
  people: 'People',
  network: 'Network',
  platforms: 'Platforms',
  training: 'Training',
  consulting: 'Consulting',
  community: 'Community',
}

const SELECT_CLASS =
  'rounded-lg border border-embl-grey-lightest bg-white px-3 py-2 text-sm font-medium text-embl-grey-darkest focus-visible:outline-embl-link'
const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
/** Team ids shown first in the People tab (leadership before service teams). */
const TEAM_PRIORITY = ['chairs', 'management']

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

/** Small icon roundel for cards without a logo (training, consulting) — same
 * green-roundel language as CardLogo's placeholder, keeping the grid consistent. */
function CardIcon({ icon }: { icon?: string }) {
  const Icon = resolveIcon(icon)
  return (
    <span
      aria-hidden="true"
      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-embl-green-lightest text-embl-green-darkest ring-1 ring-embl-green-light/40"
    >
      <Icon className="h-5 w-5" />
    </span>
  )
}

function CardLink({ href, label = 'Learn more' }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-embl-link transition-colors hover:text-embl-link-hover"
    >
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  )
}

/**
 * "Explore the DSC" — the reference catalogue of the Data Science Centre,
 * separate from the Concierge game: People, Platforms, Training, Consulting and Community.
 */
export function Explore({
  content,
  onBack,
  initialTab = 'people',
  onTabChange,
}: {
  content: Content
  onBack: () => void
  initialTab?: Tab
  /** Notifies the parent (router) when the active tab changes, so it can sync the URL. */
  onTabChange?: (tab: Tab) => void
}) {
  // Guard against a bogus tab arriving from the URL hash.
  const [tab, setTab] = useState<Tab>(TABS.includes(initialTab) ? initialTab : 'people')
  function selectTab(t: Tab) {
    setTab(t)
    onTabChange?.(t)
  }
  const [query, setQuery] = useState('')
  const [team, setTeam] = useState<string>(ALL)
  const [competency, setCompetency] = useState<string>(ALL)
  const [groupBy, setGroupBy] = useState<GroupBy>('competency')

  const q = query.trim().toLowerCase()

  const members = content.members.filter((m) => {
    if (team !== ALL && m.team !== team) return false
    if (competency !== ALL && !(m.competencies ?? []).includes(competency)) return false
    if (q && !`${m.name} ${m.position ?? ''}`.toLowerCase().includes(q)) return false
    return true
  })
  // Leadership groups float to the top; everything else keeps content.yaml order.
  const teamRank = (id: string) => {
    const i = TEAM_PRIORITY.indexOf(id)
    return i === -1 ? TEAM_PRIORITY.length : i
  }
  const peopleByTeam = Object.keys(content.teams)
    .map((id) => ({ id, team: content.teams[id], members: members.filter((m) => m.team === id) }))
    .filter((g) => g.members.length > 0)
    .sort((a, b) => teamRank(a.id) - teamRank(b.id))

  const platforms = Object.entries(content.platforms).filter(
    ([, p]) => !q || `${p.name} ${p.blurb ?? ''} ${p.category ?? ''}`.toLowerCase().includes(q),
  )
  const training = Object.entries(content.training).filter(([, t]) => !q || `${t.name} ${t.blurb ?? ''}`.toLowerCase().includes(q))
  const consulting = Object.entries(content.consulting).filter(
    ([, c]) => !q || `${c.name} ${c.blurb ?? ''}`.toLowerCase().includes(q),
  )
  const initiatives = Object.entries(content.initiatives).filter(
    ([, i]) => !q || `${i.name} ${i.blurb ?? ''}`.toLowerCase().includes(q),
  )
  const channels = Object.entries(content.channels).filter(
    ([, c]) => !q || `${c.name} ${c.blurb ?? ''}`.toLowerCase().includes(q),
  )

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
        <p className="mt-1 text-embl-grey-dark">The people, platforms, training, consulting and community of the EMBL Data Science Centre.</p>

        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Explore sections">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => selectTab(t)}
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
              Team leads are ringed in amber, chairs in blue. Hover or tap a face to focus its connections; tap again or
              the background to clear. Use the filters above to dim everything outside a team or competency.
            </p>
            <div className="mt-3">
              <Suspense fallback={<GraphLoading />}>
                <NetworkGraph
                  content={content}
                  groupBy={groupBy}
                  focusTeam={team === ALL ? null : team}
                  focusCompetency={competency === ALL ? null : competency}
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
                {p.url && <CardLink href={p.url} />}
              </li>
            ))}
          </ul>
        )}

        {tab === 'training' && (
          <ul className={`mt-5 ${GRID}`}>
            {training.map(([id, t]) => (
              <li key={id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-embl-grey-lightest">
                <div className="flex items-start gap-3">
                  <CardIcon icon={t.icon} />
                  <h3 className="font-semibold text-embl-grey-darkest">{t.name}</h3>
                </div>
                {t.blurb && <p className="mt-2 text-sm text-embl-grey-dark">{t.blurb}</p>}
                {t.url && <CardLink href={t.url} />}
              </li>
            ))}
          </ul>
        )}

        {tab === 'consulting' && (
          <div className="mt-5">
            <div className="flex flex-col items-start gap-3 rounded-2xl bg-embl-green-lightest p-5 ring-1 ring-embl-green-light/40 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-embl-green-darkest">Need data-science advice?</h3>
                <p className="mt-0.5 text-sm text-embl-green-dark">
                  Book a free consultation with a Data Science Centre expert, in any of the areas below.
                </p>
              </div>
              <a
                href={CONSULTING_BOOKING_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-embl-green px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-embl-green-dark"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Ask for a consultation
              </a>
            </div>

            <ul className={`mt-5 ${GRID}`}>
              {consulting.map(([id, c]) => (
                <li key={id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-embl-grey-lightest">
                  <div className="flex items-start gap-3">
                    <CardIcon icon={c.icon} />
                    <h3 className="font-semibold text-embl-grey-darkest">{c.name}</h3>
                  </div>
                  {c.blurb && <p className="mt-2 text-sm text-embl-grey-dark">{c.blurb}</p>}
                </li>
              ))}
            </ul>
            {consulting.length === 0 && <Empty />}
          </div>
        )}

        {tab === 'community' && (
          <div className="mt-5">
            {initiatives.length > 0 && (
              <>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-embl-grey">Community-driven initiatives</h3>
                <ul className={`mt-3 ${GRID}`}>
                  {initiatives.map(([id, i]) => (
                    <li key={id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-embl-grey-lightest">
                      <h4 className="font-semibold text-embl-grey-darkest">{i.name}</h4>
                      {i.blurb && <p className="mt-1 text-sm text-embl-grey-dark">{i.blurb}</p>}
                      <CardLink href={i.url} label="Find out more" />
                    </li>
                  ))}
                </ul>
              </>
            )}

            {channels.length > 0 && (
              <>
                <h3 className={`text-xs font-semibold uppercase tracking-wide text-embl-grey ${initiatives.length > 0 ? 'mt-8' : ''}`}>
                  Chat channels
                </h3>
                <ul className={`mt-3 ${GRID}`}>
                  {channels.map(([id, c]) => (
                    <li key={id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-embl-grey-lightest">
                      <h4 className="font-semibold text-embl-grey-darkest">{c.name}</h4>
                      {c.blurb && <p className="mt-1 text-sm text-embl-grey-dark">{c.blurb}</p>}
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-embl-link transition-colors hover:text-embl-link-hover"
                      >
                        <MessageSquare className="h-4 w-4" aria-hidden="true" />
                        Join the channel
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {initiatives.length === 0 && channels.length === 0 && <Empty />}
          </div>
        )}
      </div>
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
