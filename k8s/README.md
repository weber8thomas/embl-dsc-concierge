# DSC-Concierge — Kubernetes deployment (EMBL cluster)

Minimal deployment of the static DSC-Concierge SPA: 3 nginx replicas behind a Traefik
ingress. No backend, no storage — the whole site (including `content.yaml`) is baked into
the image at build time.

```
k8s/
  deployment.yaml     # 3 nginx replicas, anti-affinity, rolling update (maxUnavailable 0)
  service.yaml        # ClusterIP :80
  ingress.yaml        # Traefik internal-users + Sectigo TLS, host dsc-concierge.embl.org
  kustomization.yaml  # namespace + image tag
```

## Before you deploy — fill in these values

- **`kustomization.yaml`** → `namespace:` (EMBL convention `datasci-<project>`) and the
  image `name:` `<group>` path + `newTag`.
- **`deployment.yaml`** → image `registry.git.embl.de/<group>/dsc-concierge` (kustomize
  overrides the tag).
- **`ingress.yaml`** → host `dsc-concierge.embl.org` and `internal-users` (use
  `external-users` for public access).

## Image build

CI builds the existing root `Dockerfile` (multi-stage → `nginx:1.27-alpine`) and pushes
to the project registry on every push to the default branch — see `.gitlab-ci.yml`
(`build-image` job). Tags pushed: `:$CI_COMMIT_SHORT_SHA` and `:latest`.

## Registry pull credential (private projects only)

If the GitLab project/registry is private (EMBL default), the cluster needs a read-only
pull secret. Create a **Deploy Token** (Settings → Repository → Deploy tokens, scope
`read_registry`), then:

```bash
kubectl -n <namespace> create secret docker-registry gitlab-registry \
  --docker-server=registry.git.embl.de \
  --docker-username=<deploy-token-username> \
  --docker-password=<deploy-token> \
  --docker-email=weber8thomas@embl.de
```

If the project is **public**, delete the `imagePullSecrets` block from `deployment.yaml`
and skip this step.

## Deploy

```bash
kubectl kustomize k8s/                       # preview rendered manifests
kubectl apply -k k8s/ --dry-run=server       # server-side validation
kubectl apply -k k8s/                        # deploy
kubectl -n <namespace> rollout status deploy/dsc-concierge   # wait for 3/3 Ready
```

Verify from the EMBL network: `curl -I https://dsc-concierge.embl.org` → `200`, valid TLS.

## Updating content

`content.yaml` is baked into the image, so a content change = rebuild the image (push to
the default branch) then roll the deployment:

```bash
kubectl -n <namespace> set image deploy/dsc-concierge nginx=registry.git.embl.de/<group>/dsc-concierge:<new-sha>
# or, if :latest was repushed:
kubectl -n <namespace> rollout restart deploy/dsc-concierge
```
