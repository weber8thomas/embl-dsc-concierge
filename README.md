# DSC Concierge

A swipe based triage game and self service router for the **EMBL Data Science Centre (DSC)**.
A scenario appears, the player guesses **"Can the Data Science Centre help with this?"**, and the
app reveals the answer and points to the right team, people and channels.

Built for an event booth (open on a phone via a QR code) and the DSC intranet. Fully static, no
backend.

**Live: [dsc-concierge.embl.org](https://dsc-concierge.embl.org/)**

- **Stack:** Vite + React + TypeScript, Tailwind (EMBL design tokens), Framer Motion, lucide-react,
  js-yaml + zod.
- **All content lives in one human editable file:** [`public/content.yaml`](public/content.yaml).
  Add or change anything by editing that file and refreshing. No code, no rebuild.

---

## Quick start

```bash
npm install     # once
npm run dev     # http://localhost:5173
```

`npm run validate` checks `public/content.yaml` (friendly, located errors). Also: `npm test`,
`npm run build`, `npm run catalog` (regenerate `dsc-catalog.xlsx`).

---

## Content model

Everything the app shows comes from `public/content.yaml`. Sections:

| Section | What it is |
| --- | --- |
| `competencies` | Controlled skill tags, referenced by members, channels and scenarios. |
| `teams` | DSC teams and external targets (IT, Core Facilities, EMBL-EBI). |
| `members` | People, each tagged to a `team` and with `competencies`. |
| `platforms` | Tools and platforms catalogue (Explore tab). |
| `training` | Links to the canonical Bio-IT course resources. |
| `consulting` | The DSC consulting areas. |
| `initiatives` | Community user groups and clubs. |
| `channels` | EMBL chat (Mattermost) channels. |
| `scenarios` | The swipe questions (see below). |

`npm run validate` names the exact section, id and field on any problem, and the running app shows
the same friendly errors on screen instead of crashing.

---

## Scenarios

A scenario is one swipe card plus how its reveal is routed. **`data_science`** is both the right
answer and the routing intent:

| Value | Meaning | Routes to |
| --- | --- | --- |
| `yes` | The DSC can help | a DSC `team` |
| `no` | Someone else handles it | an external `team` (IT, Core Facilities, EMBL-EBI) |
| `shared` | The DSC and a partner each own a piece (either swipe counts correct) | `team` + `team_also` |

### Three ways to point at who helps

**1. Map to a team** (simplest): the reveal shows that team.

```yaml
  - id: phenotype-ml
    persona: fellow                 # fellow | staff | PI | core-facility
    question: I want a model to tell apart my cell phenotypes automatically.
    data_science: yes
    team: bioimage-analysis         # an id under teams:
    why: Training a classifier on images is bioimage analysis.
```

**2. Map to specific people**: pin exact members (in order) when a named person owns the thing.

```yaml
  - id: jupyter-down
    persona: fellow
    question: The shared JupyterHub server keeps crashing.
    data_science: shared
    team: internal-support
    team_also: it-services          # the partner, for a shared answer
    people: [renato-alves]          # member ids; overrides skill matching
    why: The DSC runs JupyterHub; IT provides the infrastructure under it.
```

**3. Map to competencies**: surface the right skill, wherever it sits.

```yaml
  - id: slow-script
    persona: fellow
    question: My Python script is painfully slow. Can someone speed it up?
    data_science: yes
    team: internal-support          # entry point
    needs: [software]               # the skill that matters
    cross_team: true                # find that skill in ANY DSC team
    why: Profiling and optimising code is research software engineering.
```

### All optional fields

| Field | Use it to… | Effect on the reveal |
| --- | --- | --- |
| `team_also: <id>` | name the partner on a `shared` scenario | second team under "…and who handles the rest" |
| `teams: [<id>, …]` | list other teams that could also help | adds an "Other teams that can help" list; people drawn from all |
| `cross_team: true` | match people across **all** DSC teams | entry point shows as a generic "Data Science Centre" |
| `needs: [<competency>, …]` | surface the most relevant people and channels | members whose `competencies` match, plus auto matched `channels` |
| `people: [<member-id>, …]` | pin exact people, in order | shows exactly those, overriding `needs` |
| `channels: [<channel-id>, …]` | pin exact channels | shows exactly those, overriding `needs` based channels |
| `image: images/…` | add a card illustration | drop the file in `public/images/` |

Precedence: `people:` wins; else `needs` filters the routed team(s), or all DSC teams when
`cross_team: true`; with no `needs` the whole routed team is shown. The reveal shows 3 people by
default with a "show all" toggle.

### Adding a team, member or channel

```yaml
teams:
  my-team:
    name: My Team
    kind: dsc                 # dsc | external
    blurb: One line about what we help with.
    icon: microscope          # see icon list below
    ticket: https://bio-it.embl.de/...  # optional "open a ticket" / booking link

members:
  jane-doe:
    name: Jane Doe
    team: my-team
    competencies: [image-analysis]      # optional, drives needs matching
    photo: https://content.embl.org/...  # optional
```

Teams are distinguished by **icon**, not colour (an EMBL rule). Unknown names fall back to a neutral
icon: `beaker`, `book`, `brain`, `building`, `calculator`, `camera`, `cloud`, `cpu`, `database`,
`flask`, `folder`, `graduation-cap`, `hard-drive`, `image`, `laptop`, `line-chart`, `mail`,
`megaphone`, `microscope`, `network`, `palette`, `server`, `settings`, `share`, `sigma`,
`spreadsheet`, `workflow`, `wrench`.

---

## QR code and deep links

Deploy, copy the URL, and generate a QR code (e.g. `npx qrcode "https://dsc-concierge.embl.org/" -o dsc-qr.png`).
Visitors scan and play on their phones, no install.

Routing lives in the URL hash, so these are shareable and survive refresh: `#explore`,
`#explore/<tab>` (e.g. `#explore/consulting`), `#directory`.

---

## Developers

Building, deploying, releasing, design tokens, accessibility and the project layout live in
[DEVELOPMENT.md](DEVELOPMENT.md).

## Future work

v1 is intentionally backend free; the typed content/game layer (`src/content`, `src/game`) is the
seam for adding one later: a shared leaderboard, "submit your own question", or usage analytics.

---

_Vibe-coded, with love, for the EMBL Data Science Centre._
