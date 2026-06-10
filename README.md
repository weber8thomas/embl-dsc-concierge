# DSC Concierge

A swipe-based triage game and self-service router for the **EMBL Data Science Centre (DSC)**.
A scenario appears, the player guesses whether it's a *Data Science question*, and the app
reveals the answer and points to the right team and communication channels.

Built for an event booth (open on a phone via a QR code) and the DSC intranet. Fully static —
no backend required.

- **Stack:** Vite + React + TypeScript, Tailwind CSS (EMBL design tokens), Framer Motion,
  lucide-react, js-yaml + zod.
- **All content lives in one human-editable file:** [`public/content.yaml`](public/content.yaml).
  A non-technical editor can add a question by editing that file and refreshing — no code, no rebuild.

---

## Quick start

```bash
npm install        # install dependencies (once)
npm run dev        # start the dev server → http://localhost:5173
```

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run dev` | Run the app locally with hot reload. |
| `npm run validate` | Check `public/content.yaml` and print friendly errors. |
| `npm test` | Run the data-layer unit tests (Vitest). |
| `npm run build` | Produce the static site in `dist/`. |
| `npm run preview` | Serve the built `dist/` locally to sanity-check a build. |

---

## ✏️ How to add a question (no coding needed)

Everything the app shows comes from one file: **`public/content.yaml`**. You only ever edit this file.

It has two parts:

1. **`entities:`** — the teams / places people get sent to (defined **once** each).
2. **`scenarios:`** — the questions shown in the game (each points at one entity).

### To add a question for a team that already exists

1. Open `public/content.yaml`.
2. Find the `scenarios:` section and **copy an existing question block** (everything from `- id:`
   down to its last line).
3. Paste it at the end and change the text. Keep the indentation exactly the same.

```yaml
  - id: my-new-question          # a short unique name, no spaces
    persona: postdoc             # predoc | postdoc | staff | PI | core-facility
    question: My question text shown on the card.
    data_science: yes            # is this a DSC question?  yes / no  ← the correct answer
    entity: image-analysis       # which team — must match an id under entities:
    why: One sentence explaining the answer.
    difficulty: easy             # optional: easy | boundary | hard
```

4. Save the file. In the dev server, just **refresh the page** — your question appears.

### To add a new team

Add a block under `entities:`. Only `name` and `kind` are required; everything else is optional
and only shows up if you fill it in (a team with no Mattermost link simply shows no Mattermost
button).

```yaml
  my-team:                       # the id you reference from scenarios
    name: My Team
    kind: dsc                    # dsc = part of the Data Science Centre | external = redirect elsewhere
    blurb: One line about what we help with.
    icon: microscope             # optional, see the icon list below
    image: images/my-team.png    # optional illustration (see Images)
    people:
      - name: Jane Doe
        role: Analyst
        email: jane.doe@embl.org
    ticket: https://tickets.embl.org/new?queue=my-team       # optional
    mattermost: https://chat.embl.org/dsc/channels/my-team   # optional
    link: https://www.embl.org/my-team                       # optional (external redirect)
```

### Images

Drop image files into **`public/images/`** and reference them by path, e.g. `image: images/cells.jpg`
on a scenario (card illustration) or an entity (team marker).

### Available `icon` names

Teams are distinguished by **icon**, not colour (an EMBL design rule). If you don't set an `image`,
pick an `icon` from this list (anything else falls back to a neutral icon):

`beaker`, `book`, `brain`, `building`, `calculator`, `camera`, `cloud`, `cpu`, `database`, `flask`,
`folder`, `graduation-cap`, `hard-drive`, `image`, `laptop`, `line-chart`, `mail`, `megaphone`,
`microscope`, `network`, `palette`, `server`, `settings`, `share`, `sigma`, `spreadsheet`,
`workflow`, `wrench`.

### Check your file

Run `npm run validate`. If something is off, it names the exact scenario and field, e.g.:

```
✖ content.yaml is not valid:
   • scenario "cells" → persona: Invalid enum value. Expected 'predoc' | 'postdoc' | ...
   • scenario "poster" → entity: references unknown entity "comms". Add it under entities: or fix the reference.
```

The running app shows the same friendly errors on screen if the file is broken, so it never just
crashes.

---

## Building & deploying

The build is a folder of static files (`dist/`) with a **relative base path**, so it works served
from a domain root, a project sub-path, or an intranet path without changes.

```bash
npm run build      # → dist/
```

### GitLab Pages (self-hosted GitLab)

A ready-to-use [`.gitlab-ci.yml`](.gitlab-ci.yml) is included. On a push to the default branch it
validates the content, runs the tests, builds, and publishes to GitLab Pages. The site appears at
your project's Pages URL (e.g. `https://<group>.pages.embl.org/<project>/`).

### Docker / Kubernetes (self-hosted)

A multi-stage [`Dockerfile`](Dockerfile) builds the site and serves it with nginx
([`nginx.conf`](nginx.conf) handles SPA fallback and serves `content.yaml` uncached).

```bash
docker build -t dsc-concierge .
docker run --rm -p 8080:80 dsc-concierge      # → http://localhost:8080
```

Deploy that image behind your usual Kubernetes Deployment + Service + Ingress. It listens on port 80.

### Any static host

`dist/` can also be dropped onto Netlify, Vercel, GitHub Pages, or any web server / intranet path.

---

## QR code for the booth

1. Deploy the app and copy its URL (e.g. `https://dsc-concierge.embl.org/`).
2. Generate a QR code pointing at that URL — for example with the
   [`qrcode`](https://www.npmjs.com/package/qrcode) CLI:

   ```bash
   npx qrcode "https://dsc-concierge.embl.org/" -o dsc-qr.png
   ```

   (or any QR generator / your phone's built-in one).
3. Print it for the booth. Visitors scan it and play on their own phones — no install.

Tip: deep-link straight to the directory with `#directory`, e.g.
`https://dsc-concierge.embl.org/#directory`.

---

## Design

Implements the [EMBL Corporate Design Guidelines](https://www.embl.org/guidelines/design/):
green-led and white-led, IBM Plex Sans typography, EMBL colour tokens, organic roundels as the
signature element, and **no per-team colour coding** (teams differ by icon/illustration only).
Interactive elements use EMBL link blue; red is reserved for the "not quite" alert beat.

The EMBL logo is **not** bundled — it's protected and needs Design-team sign-off. There's a
placeholder slot top-right (`src/components/Logo.tsx`); drop the approved asset into `public/` and
swap the markup there.

Accessibility: keyboard play (`→`/`Y` = yes, `←`/`N` = no), visible focus, sufficient contrast,
meaning never carried by colour alone, and `prefers-reduced-motion` respected.

---

## Project layout

```
public/content.yaml      ← the only file content editors touch
src/content/             schema.ts (zod + types), loadContent.ts (runtime), content.test.ts
src/game/useGame.ts      game state (deck, score, streak)
src/screens/             Landing, Swipe, Reveal, Recap, Directory
src/components/           ScenarioCard, EntityActions, EntityIcon, OrganicShape, …
scripts/validate-content.ts   `npm run validate`
```

---

## Future work (extension points, not built in v1)

v1 is intentionally backend-free. The typed content/game data layer (`src/content`, `src/game`) is
the clean seam for adding a backend later. Each of these would need server-side support:

- **Shared leaderboard** — persist scores/streaks across players at the booth.
- **"Submit your own question"** — let visitors propose scenarios for review.
- **Usage analytics** — which scenarios are seen, answer accuracy, popular routes.

None of these are implemented yet; they're noted here so the data layer stays the place to plug
them in.
