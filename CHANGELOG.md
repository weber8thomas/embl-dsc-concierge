# Changelog

## v1.1.0

- Add a **shared** verdict (DSC + partner, either swipe correct) and broaden scenarios — Core Facilities (borderline), EMBL-EBI, data-transfer (IT-first); 35 scenarios grouped DSC / Shared / Not-DSC.
- Explore: new **Channels** tab (EMBL Mattermost) + topic-matched channels in reveals; reveals now show a few example people instead of the whole team.
- Fix Ingress TLS: issue the certificate via cert-manager **`harica-issuer`** (was the non-working Traefik `sectigo` resolver).
