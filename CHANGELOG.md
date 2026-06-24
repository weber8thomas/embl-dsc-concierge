# Changelog

## v1.2.1

- Balanced rounds: each round draws a configurable mix of verdicts (default 5 yes, 3 shared, 2 no), set under `game:` in `content.yaml`, with backfill if a verdict is short.
- Docs: README rewritten around content editing with three scenario examples (map to a team, to people, to competencies); build, deploy and design notes moved to `DEVELOPMENT.md`.

## v1.2.0

- Reframe the prompt to **"Can the Data Science Centre help with this?"**; richer scenario routing (multi team, cross team, pinned people and channels); drop `difficulty` and `pillars`.
- Explore: Training links to Bio-IT resources, **Services becomes Consulting**, **Channels becomes Community**, and platforms show real logos.
- Lightweight URL-hash routing (refresh, Back/Forward, shareable Explore and Directory); 10 random questions per round.

## v1.1.0

- Add a **shared** verdict (DSC + partner, either swipe correct) and broaden scenarios — Core Facilities (borderline), EMBL-EBI, data-transfer (IT-first); 35 scenarios grouped DSC / Shared / Not-DSC.
- Explore: new **Channels** tab (EMBL Mattermost) + topic-matched channels in reveals; reveals now show a few example people instead of the whole team.
- Fix Ingress TLS: issue the certificate via cert-manager **`harica-issuer`** (was the non-working Traefik `sectigo` resolver).
