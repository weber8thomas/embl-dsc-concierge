import { useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D, { type ForceGraphMethods, type NodeObject } from 'react-force-graph-2d'
import { forceCollide, forceManyBody, forceX, forceY } from 'd3-force'
import type { Content, MemberWithId } from '../content/schema'

/**
 * "Network" view of the Data Science Centre. The two modes are deliberately
 * different shapes, not the same picture re-coloured:
 *
 *   • Group by Competency — a true node-link graph. Each face is linked to
 *     everyone it shares a competency with, and clusters around its primary
 *     competency. The links ARE the competencies, so nothing floats as a
 *     stand-in "node".
 *   • Group by Team       — just separate team areas. Faces are packed into one
 *     translucent blob per team; no links, no hubs.
 *
 * The list view remains the accessible, canonical representation of the data.
 */

export type GroupBy = 'team' | 'competency'

// EMBL palette (mirrors the CSS custom properties in index.css).
const C = {
  green: '#18974c',
  greenDarkest: '#0a5032',
  greenDark: '#007b53',
  greenLight: '#6cc24a',
  greenLightest: '#d0debb',
  grey: '#707372',
  greyDark: '#54585a',
  greyDarkest: '#373a36',
  amber: '#e8a33d',
  link: '#2a57a3',
  white: '#ffffff',
} as const

// The scientific-leadership team; its people get a distinct ring.
const CHAIRS_TEAM = 'chairs'

// Distinct (but muted) hues cycled across the groups so each team / competency
// reads as its own colour. Green leads, per the EMBL brand.
const AREA_COLORS = ['#18974c', '#2a9d8f', '#4f86c6', '#8a6fb0', '#c75d8f', '#6b8e23', '#1f9bb0', '#707372']

const NODE_R = 9

interface PNode {
  kind: 'person'
  id: string
  name: string
  member: MemberWithId
  team: string
  comps: string[]
  lead: boolean
  chair: boolean
  x?: number
  y?: number
  fx?: number
  fy?: number
}

type GNode = PNode
type RFNode = NodeObject<GNode>

// A link between two people who share a competency. `comp` is the (primary)
// shared competency that colours the edge; `count` is how many they share.
interface GLink {
  source: string
  target: string
  comp: string
  count: number
}

interface GroupDef {
  id: string
  label: string
  /** Acronym / short name (teams only); when set it's the heading, label the subtitle. */
  short?: string
  members: Set<string>
  color: string
  seed: number
}

function buildPeople(content: Content): PNode[] {
  return content.members.map((m) => ({
    kind: 'person',
    id: `p:${m.id}`,
    name: m.name,
    member: m,
    team: m.team,
    comps: m.competencies ?? [],
    lead: Boolean(m.lead),
    chair: m.team === CHAIRS_TEAM,
  }))
}

/** The competency a person is clustered into (their first-listed one). */
function primaryComp(p: PNode): string | null {
  return p.comps[0] ?? null
}

/**
 * Groups for the clustering dimension. In Team mode these are drawn as areas;
 * in Competency mode they only provide cluster centroids, labels and colours.
 */
function buildGroups(content: Content, people: PNode[], groupBy: GroupBy): GroupDef[] {
  const groups: Omit<GroupDef, 'color' | 'seed'>[] = []
  if (groupBy === 'team') {
    for (const [id, team] of Object.entries(content.teams)) {
      const members = new Set(people.filter((p) => p.team === id).map((p) => p.id))
      if (members.size === 0) continue
      groups.push({ id, label: team.name, short: team.short, members })
    }
    // Chairs, then Management lead the order so they sit at the top-left of the
    // grid; the rest keep their content order.
    const order = Object.keys(content.teams)
    const head = [CHAIRS_TEAM, 'management']
    const rank = (id: string) => (head.includes(id) ? head.indexOf(id) : head.length + order.indexOf(id))
    groups.sort((a, b) => rank(a.id) - rank(b.id))
  } else {
    for (const [id, comp] of Object.entries(content.competencies)) {
      const members = new Set(people.filter((p) => primaryComp(p) === id).map((p) => p.id))
      if (members.size === 0) continue
      groups.push({ id, label: comp.label, members })
    }
  }
  // The Chairs area is blue to match the blue rings on chair faces.
  let ci = 0
  return groups.map((g, i) => ({
    ...g,
    color: g.id === CHAIRS_TEAM ? C.link : AREA_COLORS[ci++ % AREA_COLORS.length],
    seed: (i * 2.39996) % (2 * Math.PI),
  }))
}

/** Competency mode only: link every pair of people that shares a competency. */
function buildCompLinks(people: PNode[]): GLink[] {
  const links: GLink[] = []
  for (let i = 0; i < people.length; i++) {
    for (let j = i + 1; j < people.length; j++) {
      const shared = people[i].comps.filter((c) => people[j].comps.includes(c))
      if (shared.length === 0) continue
      links.push({ source: people[i].id, target: people[j].id, comp: shared[0], count: shared.length })
    }
  }
  return links
}

/** Preload member photos as HTMLImageElements, keyed by person node id. */
function usePhotos(people: PNode[]) {
  const ref = useRef<Map<string, HTMLImageElement>>(new Map())
  const [, force] = useState(0)
  useEffect(() => {
    const map = ref.current
    for (const p of people) {
      if (!p.member.photo || map.has(p.id)) continue
      const img = new Image()
      img.onload = () => force((n) => n + 1)
      img.src = p.member.photo
      map.set(p.id, img)
    }
  }, [people])
  return ref
}

function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}

interface NetworkGraphProps {
  content: Content
  groupBy: GroupBy
  onSelectMember?: (member: MemberWithId) => void
  focusTeam?: string | null
  focusCompetency?: string | null
}

export default function NetworkGraph({ content, groupBy, onSelectMember, focusTeam, focusCompetency }: NetworkGraphProps) {
  const fgRef = useRef<ForceGraphMethods<RFNode, GLink> | undefined>(undefined)
  const didFit = useRef(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastNodeClick = useRef(0)
  const [wrapRef, { width, height }] = useMeasure<HTMLDivElement>()
  const people = useMemo(() => buildPeople(content), [content])
  const photos = usePhotos(people)
  const [hover, setHover] = useState<string | null>(null)
  // Tap/click selects a person and locks the focus on their connections — this
  // is what makes the graph usable on touch, where there is no hover.
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const groups = useMemo(() => buildGroups(content, people, groupBy), [content, people, groupBy])
  // Links exist in Competency mode only; Team mode is areas-only.
  const links = useMemo(() => (groupBy === 'competency' ? buildCompLinks(people) : []), [people, groupBy])

  // Competency id → colour, so edges match the cluster they belong to.
  const compColor = useMemo(() => {
    const m = new Map<string, string>()
    if (groupBy === 'competency') for (const g of groups) m.set(g.id, g.color)
    return m
  }, [groups, groupBy])

  // Group centroids on a grid whose column count matches the canvas aspect
  // ratio, so the layout fills the (wide) frame instead of collapsing into a
  // central ball. Teams pack tighter; competency clusters get more elbow room
  // since their faces fan out around each centroid.
  const anchors = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>()
    const n = Math.max(1, groups.length)
    const aspect = width > 0 && height > 0 ? width / height : 1.8
    const cols = Math.max(1, Math.min(n, Math.round(Math.sqrt(n * aspect))))
    const rows = Math.ceil(n / cols)
    const gapX = groupBy === 'team' ? 108 : 172
    const gapY = groupBy === 'team' ? 108 : 150
    groups.forEach((g, i) => {
      const c = i % cols
      const r = Math.floor(i / cols)
      m.set(g.id, { x: (c - (cols - 1) / 2) * gapX, y: (r - (rows - 1) / 2) * gapY })
    })
    return m
  }, [groups, groupBy, width, height])

  // Per-person target positions. In Team mode each person gets a fixed slot in a
  // tidy grid inside its team's cell, so faces read as a structured block rather
  // than a random blob. In Competency mode everyone in a cluster shares the
  // cluster anchor and the force/link layout arranges them organically.
  const targets = useMemo(() => {
    const t = new Map<string, { x: number; y: number }>()
    if (groupBy === 'team') {
      const cell = NODE_R * 2 + 6
      for (const g of groups) {
        const a = anchors.get(g.id) ?? { x: 0, y: 0 }
        const ids = [...g.members]
        const cols = Math.max(1, Math.ceil(Math.sqrt(ids.length)))
        const rows = Math.ceil(ids.length / cols)
        ids.forEach((id, i) => {
          const c = i % cols
          const r = Math.floor(i / cols)
          t.set(id, { x: a.x + (c - (cols - 1) / 2) * cell, y: a.y + (r - (rows - 1) / 2) * cell })
        })
      }
    } else {
      for (const p of people) t.set(p.id, anchors.get(primaryComp(p) ?? '') ?? { x: 0, y: 0 })
    }
    return t
  }, [groups, anchors, people, groupBy])

  // Seed each node near its target so the layout starts settled (rather than
  // exploding out from the origin and throwing off the initial zoom-to-fit).
  const graphData = useMemo(() => {
    for (const p of people) {
      const a = targets.get(p.id) ?? { x: 0, y: 0 }
      const j = jitter(p.id)
      const scale = groupBy === 'team' ? 0.1 : 1
      p.x = a.x + j[0] * scale
      p.y = a.y + j[1] * scale
    }
    return { nodes: [...people], links }
  }, [people, links, targets, groupBy])

  const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people])

  // Adjacency over the shared-competency links, for graph highlighting.
  const adj = useMemo(() => {
    const a = new Map<string, Set<string>>()
    const add = (x: string, y: string) => {
      if (!a.has(x)) a.set(x, new Set())
      a.get(x)!.add(y)
    }
    for (const l of links) {
      add(l.source, l.target)
      add(l.target, l.source)
    }
    return a
  }, [links])

  const targetOf = useMemo(() => {
    return (p: PNode): { x: number; y: number } => targets.get(p.id) ?? { x: 0, y: 0 }
  }, [targets])

  // (Re)configure the force layout whenever the grouping changes.
  //   Team mode       — faces snap firmly to their grid slot (strong X/Y, light
  //                      charge), giving a structured block per team.
  //   Competency mode — clusters are spread wide and faces repel strongly so the
  //                      shared-competency graph is airy, not a tight ball.
  useEffect(() => {
    const fg = fgRef.current
    if (!fg) return
    const team = groupBy === 'team'
    // Release pins from a previous layout so the new one can settle freely.
    for (const p of people) {
      p.fx = undefined
      p.fy = undefined
    }
    fg.d3Force('center', null)
    fg.d3Force('charge', forceManyBody<GNode>().strength(team ? -4 : -24) as never)
    fg.d3Force('x', forceX<GNode>((n) => targetOf(n).x).strength(team ? 0.9 : 0.45) as never)
    fg.d3Force('y', forceY<GNode>((n) => targetOf(n).y).strength(team ? 0.9 : 0.45) as never)
    fg.d3Force('collide', forceCollide<GNode>(NODE_R + (team ? 1.5 : 3)).strength(0.9) as never)
    const link = fg.d3Force('link') as unknown as { distance?: (d: number) => void; strength?: (s: number) => void } | undefined
    link?.distance?.(40)
    link?.strength?.(0.04)
    didFit.current = false
    fg.d3ReheatSimulation()
  }, [targetOf, groupBy, people])

  // The focused person: a live hover wins, otherwise the tapped/selected one.
  const focusId = hover ?? selectedId
  const selectedPerson = selectedId ? peopleById.get(selectedId) ?? null : null

  // Clear any selection when the grouping changes (the node may not exist there).
  useEffect(() => {
    setSelectedId(null)
  }, [groupBy])

  // What lights up for the focused person: the node, its graph neighbours, and
  // (in Team mode) its area-mates so the cluster reads as one.
  const highlight = useMemo(() => {
    if (!focusId) return null
    const set = new Set<string>([focusId])
    for (const n of adj.get(focusId) ?? []) set.add(n)
    if (groupBy === 'team') {
      const p = peopleById.get(focusId)
      if (p) for (const other of people) if (other.team === p.team) set.add(other.id)
    }
    return set
  }, [focusId, adj, peopleById, people, groupBy])

  const focusActive = (p: PNode) =>
    (!focusTeam || p.team === focusTeam) && (!focusCompetency || p.comps.includes(focusCompetency))

  const personDimmed = (p: PNode) => !focusActive(p) || (highlight != null && !highlight.has(p.id))

  // Debounce hover: a brief settle before committing the change so that moving
  // across (or near the edge of) faces can't rapidly toggle the highlight and
  // flicker the whole canvas.
  const onHover = (n: RFNode | null) => {
    const id = n ? n.id : null
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setHover((cur) => (cur === id ? cur : id)), 60)
  }

  return (
    <div
      ref={wrapRef}
      className="relative h-[68vh] min-h-[440px] w-full overflow-hidden rounded-2xl bg-embl-grey-lightest/25 ring-1 ring-embl-grey-lightest"
    >
      <Legend groupBy={groupBy} />
      {width > 0 && (
        <ForceGraph2D<GNode, GLink>
          ref={fgRef}
          width={width}
          height={height}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          nodeId="id"
          nodeLabel={() => ''}
          cooldownTicks={150}
          d3VelocityDecay={0.55}
          onEngineStop={() => {
            // Fit once per layout, then leave the engine idle so the canvas
            // stops repainting — a static graph can't flicker on hover.
            if (!didFit.current) {
              fgRef.current?.zoomToFit(600, 40)
              didFit.current = true
            }
            // Pin nodes at their settled spots. Clicking a node makes
            // react-force-graph reheat the sim (it treats a click as a drag);
            // pinning keeps the layout from drifting when that happens.
            for (const p of people) {
              p.fx = p.x
              p.fy = p.y
            }
          }}
          enableNodeDrag={true}
          linkColor={(l) => {
            // At rest: a calm, faint grey web so faces/clusters read first.
            if (!focusId) return 'rgba(112,115,114,0.10)'
            // Focused: light ONLY the edges incident to the focused person
            // (its star — source→targets), not edges among its neighbours.
            const inc = linkEnd(l.source) === focusId || linkEnd(l.target) === focusId
            return inc ? hexA(compColor.get(l.comp) ?? C.link, 0.75) : 'rgba(112,115,114,0.02)'
          }}
          linkWidth={(l) => {
            if (!focusId) return 0.45
            const inc = linkEnd(l.source) === focusId || linkEnd(l.target) === focusId
            return inc ? 1.5 + Math.min(l.count - 1, 2) * 0.5 : 0.35
          }}
          onNodeHover={(n) => onHover((n as RFNode) ?? null)}
          onNodeClick={(n) => {
            const node = n as RFNode
            if (node.kind !== 'person') return
            lastNodeClick.current = Date.now()
            setSelectedId(node.id)
          }}
          onBackgroundClick={() => {
            // Ignore the background event that can accompany a node click; only a
            // genuine empty-space click clears the selection.
            if (Date.now() - lastNodeClick.current < 150) return
            setSelectedId(null)
          }}
          onRenderFramePre={(ctx) => {
            const t = performance.now() / 1000
            for (const g of groups) {
              const pts: [number, number][] = []
              for (const id of g.members) {
                const p = peopleById.get(id) as PNode | undefined
                if (p && p.x != null && p.y != null) pts.push([p.x, p.y])
              }
              const lit = !highlight || [...g.members].some((id) => highlight.has(id))
              const focusLit =
                (!focusTeam || groupBy !== 'team' || g.id === focusTeam) &&
                (!focusCompetency || groupBy !== 'competency' || g.id === focusCompetency)
              if (groupBy === 'team') drawArea(ctx, pts, NODE_R + 9, g, lit && focusLit, t)
              else drawClusterLabel(ctx, pts, NODE_R + 9, g, lit && focusLit)
            }
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            const n = node as RFNode
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(n.x ?? 0, n.y ?? 0, NODE_R + 2, 0, 2 * Math.PI)
            ctx.fill()
          }}
          nodeCanvasObject={(node, ctx) => {
            const n = node as RFNode
            drawFace(n, ctx, photos.current.get(n.id), personDimmed(n), n.id === focusId)
          }}
        />
      )}
      {selectedPerson && (
        <SelectedCard
          member={selectedPerson.member}
          competencies={content.competencies}
          onClose={() => setSelectedId(null)}
          onOpenProfile={() => onSelectMember?.(selectedPerson.member)}
        />
      )}
    </div>
  )
}

/** Compact card for the tapped person — the touch-friendly counterpart to hover. */
function SelectedCard({
  member,
  competencies,
  onClose,
  onOpenProfile,
}: {
  member: MemberWithId
  competencies: Content['competencies']
  onClose: () => void
  onOpenProfile: () => void
}) {
  const tags = member.competencies ?? []
  return (
    <div className="absolute right-3 top-3 z-10 w-60 rounded-xl bg-white/95 p-3 text-left shadow-md ring-1 ring-embl-grey-lightest backdrop-blur">
      <button
        type="button"
        onClick={onClose}
        aria-label="Clear selection"
        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full text-embl-grey transition-colors hover:bg-embl-grey-lightest hover:text-embl-grey-darkest"
      >
        ✕
      </button>
      <div className="flex items-center gap-2.5 pr-5">
        {member.photo ? (
          <img src={member.photo} alt="" loading="lazy" className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-embl-green-lightest" />
        ) : (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-embl-green-lightest text-sm font-bold text-embl-green-darkest ring-2 ring-embl-green-lightest">
            {initials(member.name)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight text-embl-grey-darkest">{member.name}</p>
          {member.position && <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-embl-grey-dark">{member.position}</p>}
        </div>
      </div>
      {tags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1">
          {tags.map((t) => (
            <li key={t} className="rounded-full bg-embl-green-lightest px-2 py-0.5 text-[11px] font-medium text-embl-green-darkest">
              {competencies[t]?.label ?? t}
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={onOpenProfile}
        className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-embl-link transition-colors hover:text-embl-link-hover"
      >
        View full profile →
      </button>
    </div>
  )
}

function linkEnd(end: GLink['source'] | GLink['target']): string {
  return typeof end === 'object' && end !== null ? ((end as RFNode).id as string) : String(end)
}

/** Deterministic small offset from a node id, to spread seeded positions. */
function jitter(id: string): [number, number] {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return [((h % 37) - 18) * 0.9, (((h >> 5) % 37) - 18) * 0.9]
}

// ── Drawing ───────────────────────────────────────────────────────────────────

function drawFace(
  n: RFNode & PNode,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | undefined,
  dimmed: boolean,
  active: boolean,
) {
  const x = n.x ?? 0
  const y = n.y ?? 0
  const r = NODE_R
  ctx.save()
  ctx.globalAlpha = dimmed ? 0.2 : 1

  const ready = img && img.complete && img.naturalWidth > 0
  if (ready) {
    const side = Math.min(img!.naturalWidth, img!.naturalHeight)
    const sx = (img!.naturalWidth - side) / 2
    const sy = (img!.naturalHeight - side) / 2
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.clip()
    ctx.drawImage(img!, sx, sy, side, side, x - r, y - r, r * 2, r * 2)
    ctx.restore()
  } else {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fillStyle = C.greenLightest
    ctx.fill()
    ctx.fillStyle = C.greenDarkest
    ctx.font = `600 ${r * 0.8}px Inter, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initials(n.name), x, y)
  }

  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  // Ring: leads = amber, chairs = blue, everyone else = green.
  ctx.lineWidth = n.lead || n.chair ? 2.6 : active ? 2 : 1.3
  ctx.strokeStyle = n.lead ? C.amber : n.chair ? C.link : active ? C.green : C.greenLight
  ctx.stroke()

  // Names are shown only for the hovered face, to keep the view uncluttered.
  if (active && !dimmed) {
    ctx.font = `${n.lead ? 700 : 500} 3.4px Inter, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const ly = y + r + 1.5
    ctx.lineWidth = 2.6
    ctx.strokeStyle = 'rgba(255,255,255,0.92)'
    ctx.strokeText(n.name, x, ly)
    ctx.fillStyle = n.lead ? C.greenDarkest : C.greyDarkest
    ctx.fillText(n.name, x, ly)
  }
  ctx.restore()
}

function drawArea(ctx: CanvasRenderingContext2D, pts: [number, number][], pad: number, g: GroupDef, lit: boolean, t: number) {
  if (pts.length === 0) return
  ctx.save()
  ctx.globalAlpha = lit ? 1 : 0.25

  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
  const phase = g.seed

  const hull = convexHull(pts)
  ctx.beginPath()
  if (hull.length < 3) {
    const base = Math.max(...pts.map((p) => Math.hypot(p[0] - cx, p[1] - cy)), 0) + pad
    blobPath(ctx, circlePoints(cx, cy, base, 10), cx, cy, t, phase)
  } else {
    const exp = hull.map(([px, py]) => {
      const dx = px - cx
      const dy = py - cy
      const len = Math.hypot(dx, dy) || 1
      return [px + (dx / len) * pad, py + (dy / len) * pad] as [number, number]
    })
    blobPath(ctx, exp, cx, cy, t, phase)
  }
  ctx.fillStyle = hexA(g.color, lit ? 0.13 : 0.08)
  ctx.fill()
  ctx.lineWidth = 1
  ctx.strokeStyle = hexA(g.color, lit ? 0.55 : 0.3)
  ctx.stroke()

  const topY = Math.min(...pts.map((p) => p[1])) - pad
  drawGroupLabel(ctx, g, cx, topY - 6, lit)
  ctx.restore()
}

/** Competency mode: no blob, just the cluster's label floating over its faces. */
function drawClusterLabel(ctx: CanvasRenderingContext2D, pts: [number, number][], pad: number, g: GroupDef, lit: boolean) {
  if (pts.length === 0) return
  ctx.save()
  ctx.globalAlpha = lit ? 1 : 0.3
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
  const topY = Math.min(...pts.map((p) => p[1])) - pad
  drawGroupLabel(ctx, g, cx, topY - 4, lit)
  ctx.restore()
}

/**
 * Shared pill label for a group, centred at (cx, top). When the group has a
 * short name / acronym it's the heading, with the full name small underneath.
 */
function drawGroupLabel(ctx: CanvasRenderingContext2D, g: GroupDef, cx: number, top: number, lit: boolean) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const padX = 2.8
  ctx.fillStyle = lit ? hexA(g.color, 0.95) : hexA(g.color, 0.5)

  if (g.short) {
    ctx.font = '800 4.6px Inter, system-ui, sans-serif'
    const w1 = ctx.measureText(g.short).width
    ctx.font = '500 3px Inter, system-ui, sans-serif'
    const w2 = ctx.measureText(g.label).width
    const w = Math.max(w1, w2)
    const h = 11
    roundRect(ctx, cx - w / 2 - padX, top, w + padX * 2, h, 3)
    ctx.fill()
    ctx.fillStyle = C.white
    ctx.font = '800 4.6px Inter, system-ui, sans-serif'
    ctx.fillText(g.short, cx, top + 3.6)
    ctx.font = '500 3px Inter, system-ui, sans-serif'
    ctx.fillText(g.label, cx, top + 8)
  } else {
    ctx.font = '700 4px Inter, system-ui, sans-serif'
    const w = ctx.measureText(g.label).width
    roundRect(ctx, cx - w / 2 - padX, top, w + padX * 2, 6.5, 3)
    ctx.fill()
    ctx.fillStyle = C.white
    ctx.fillText(g.label, cx, top + 3.4)
  }
}

function circlePoints(cx: number, cy: number, r: number, n: number): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
  }
  return out
}

/** Trace a smooth, gently-breathing blob through `points`. */
function blobPath(ctx: CanvasRenderingContext2D, points: [number, number][], cx: number, cy: number, t: number, phase: number) {
  const wob = points.map((p, i): [number, number] => {
    const dx = p[0] - cx
    const dy = p[1] - cy
    const len = Math.hypot(dx, dy) || 1
    const amp = 2.2 * Math.sin(t * 0.7 + phase + i * 1.3)
    return [p[0] + (dx / len) * amp, p[1] + (dy / len) * amp]
  })
  const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const start = mid(wob[wob.length - 1], wob[0])
  ctx.moveTo(start[0], start[1])
  for (let i = 0; i < wob.length; i++) {
    const cur = wob[i]
    const m = mid(cur, wob[(i + 1) % wob.length])
    ctx.quadraticCurveTo(cur[0], cur[1], m[0], m[1])
  }
  ctx.closePath()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Andrew's monotone chain convex hull. */
function convexHull(points: [number, number][]): [number, number][] {
  const pts = [...new Set(points.map((p) => `${p[0]},${p[1]}`))].map((s) => s.split(',').map(Number) as [number, number])
  if (pts.length < 3) return pts
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower: [number, number][] = []
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop()
    lower.push(p)
  }
  const upper: [number, number][] = []
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop()
    upper.push(p)
  }
  lower.pop()
  upper.pop()
  return lower.concat(upper)
}

function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '')
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function Legend({ groupBy }: { groupBy: GroupBy }) {
  return (
    <ul className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-x-4 gap-y-1 rounded-xl bg-white/85 px-3 py-2 text-xs font-medium text-embl-grey-dark shadow-sm backdrop-blur">
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full ring-2 ring-embl-green-light" style={{ background: C.greenLightest }} />
        Person
      </li>
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full" style={{ boxShadow: `inset 0 0 0 2px ${C.amber}` }} />
        Team lead
      </li>
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full" style={{ boxShadow: `inset 0 0 0 2px ${C.link}` }} />
        Chair
      </li>
      {groupBy === 'competency' ? (
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded" style={{ background: hexA(C.green, 0.55) }} />
          Shared competency
        </li>
      ) : (
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded" style={{ background: hexA(C.green, 0.18), boxShadow: `inset 0 0 0 1px ${hexA(C.green, 0.5)}` }} />
          Team area
        </li>
      )}
    </ul>
  )
}
