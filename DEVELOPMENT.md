# Development & deployment

Developer and ops notes for DSC Concierge. For content editing (scenarios, teams, people), see the
[README](README.md).

---

## Building & deploying

`npm run build` produces `dist/` with a **relative base path**, so it serves from a domain root, a
project sub-path or an intranet path unchanged.

- **GitLab Pages / image build:** [`.gitlab-ci.yml`](.gitlab-ci.yml) validates, tests, builds, and on
  the default branch publishes Pages. It also builds a container image and pushes it to the EMBL
  registry, tagged with the git **tag** (e.g. `v1.2.0`) on tag pipelines, or the commit SHA otherwise.
- **Docker / Kubernetes:** a multi-stage [`Dockerfile`](Dockerfile) serves the build with nginx
  ([`nginx.conf`](nginx.conf): SPA fallback, uncached `content.yaml`). Manifests live in
  [`k8s/`](k8s/); bump `newTag` in [`k8s/kustomization.yaml`](k8s/kustomization.yaml) per release and
  `kubectl apply -k k8s/`.
- **Any static host:** `dist/` also drops onto Netlify, Vercel, GitHub Pages or a plain web server.

**Releasing:** bump `version` in `package.json` and add a `CHANGELOG.md` entry; bump `newTag` in
`k8s/kustomization.yaml`; commit, then `git tag vX.Y.Z` and push the tag (CI builds the image);
`kubectl apply -k k8s/` once the image is published.

---

## Design & accessibility

Implements the [EMBL Corporate Design Guidelines](https://www.embl.org/guidelines/design/): green
led and white led, IBM Plex Sans, EMBL colour tokens, organic roundels, and **no per-team colour
coding** (teams differ by icon only). Interactive elements use EMBL link blue; red is reserved for
the "not quite" beat.

Accessibility: keyboard play (`→`/`Y` = yes, `←`/`N` = no), visible focus, sufficient contrast,
meaning never carried by colour alone, and `prefers-reduced-motion` respected.

---

## Project layout

```
public/content.yaml      ← the only file content editors touch
public/logos/            platform logos
src/content/             schema.ts (zod + types), loadContent.ts, content.test.ts
src/game/useGame.ts      game state (deck, score, streak, matched teams)
src/Concierge.tsx        screen state machine + lightweight hash router
src/screens/             Landing, Swipe, Reveal, Recap, Directory, Explore
src/components/           ScenarioResult, TeamActions, TeamIcon, NetworkGraph, …
scripts/                 validate-content.ts, build-catalog.ts
k8s/                     Deployment, Service, Ingress, kustomization
```
