# web-service-lod Constitution

> This constitution **extends** the [infra-k8s primary constitution](../../infra-k8s/.specify/memory/constitution.md). All principles defined there — GitOps, sealed secrets, network policies, resource constraints, security defaults, clean code, documentation, and changelog — apply here in full. This document adds what is specific to this repo.

## I. This Is a Single-Package API Service

web-service-lod is a standalone RESTful microservice — not a monorepo. There is no frontend. The entire service lives under `src/`.

- Do not split into a monorepo or add a frontend here. If a UI for querying linked data is needed, it belongs in a separate repo.
- `src/routes/` defines URL paths. `src/controllers/` contains request handlers. `src/middleware/` contains cross-cutting concerns. This structure is the contract — maintain it.
- Base URL is `/api/v1`. This version prefix is a public API contract. Never change or remove it without a migration plan and a spec.

## II. The Controllers Are Placeholders — Integration Is the First Spec

All controllers currently return mock responses awaiting integration with the `linked-data-toolkit` library. This is the primary pending work.

- Before writing any other feature spec, write `001-linked-data-toolkit-integration` covering: which sources to integrate first, the error contract when an upstream source is unavailable, and how to test without hitting live external APIs.
- Mock responses in controllers must be replaced with real integration, not left as permanent stubs. A controller that always returns a mock is not a shipped feature.
- The integration spec must address: rate limiting, upstream timeouts, upstream errors, and what the service returns to callers in each case.

## III. Tests Are a Hard Gate and Coverage Thresholds Must Be Raised

Tests exist (`src/__tests__/app.test.js`) but the coverage thresholds are set too low — 40% branches, 50% functions, 60% lines. This is below the standard for a production service.

- Raise thresholds to **75% across all metrics** (branches, functions, lines, statements) as part of the linked-data-toolkit integration spec.
- `continue-on-error: true` must be removed from CI test steps. Failures must block merging.
- Every new route must have a test covering: happy path, missing required parameters, upstream error handling.
- External API calls must be mocked in tests. Tests must not make real network requests to DBPedia, Geonames, Getty, etc.
- The watch mode (`yarn test:watch`) is for development. CI always runs `yarn test` (coverage mode).

## IV. Each Data Source Is an Isolated Module

Five distinct external data sources are exposed: DBPedia, Geonames, Library of Congress, Ordnance Survey, and Heritage/Archaeological sources. Treat each as its own bounded context.

- Each source has its own route file and its own controller. Do not add cross-source logic into a shared controller.
- When implementing a source, document in the README: the upstream API, authentication requirements, rate limits, and the response shape returned to callers.
- Upstream failures are isolated — one source being unavailable must not affect the others. Return a clear `503` with a source-identifying error message, not a generic 500.
- If a new source is added, it must have its own route file, controller, and tests before it is considered shipped.

## V. The API Contract Is Versioned and Stable

The `/api/v1` prefix is a promise to callers. Breaking changes require a new version prefix.

- All routes live under `/api/v1/<source>/`. The root `/` and `/health` and `/metrics` paths are infrastructure — do not put business logic on them.
- Request validation uses `express-validator`. Every parameter and query string must be validated before the controller logic runs. Return `400` with a descriptive message for invalid input.
- Error responses follow a consistent shape: `{ error: string, source?: string, timestamp: string }`. Never return raw upstream error objects to callers.
- `/api/v1/docs` must stay accurate. When a new endpoint is added or an existing one changes, update the docs endpoint response in the same PR.

## VI. External Dependencies Are Handled Defensively

This service is a proxy to multiple external APIs. The external world is unreliable.

- Set explicit timeouts on all upstream requests. Do not rely on the default (no timeout).
- Log upstream errors with enough context to diagnose (source, endpoint, status code, latency). Do not swallow errors silently.
- Prometheus metrics must cover upstream call success/failure rates per source. This is how you know which source is degraded without checking logs.
- Do not cache upstream responses without a spec. Caching introduces staleness and invalidation complexity — only add it when there is a demonstrated need.

## VII. Images Are Built for ARM64

Same as the other repos — the cluster is ARM64.

- The Dockerfile produces a `linux/arm64` image via QEMU cross-compilation in GitHub Actions.
- Images are tagged by short SHA and pushed to GHCR (`ghcr.io/mcharno/linked-data-service`).
- Image tags in `infra/k8s/base/deployment.yaml` are updated by the CI workflow on merge to `main`. Do not edit them manually.
- Base image: `node:18-alpine`. Update to `node:20-alpine` when Node 18 reaches end-of-life (April 2025 — this is overdue).

## VIII. Containers Run Least-Privilege

- Non-root user (UID 1001), `runAsNonRoot: true`.
- `allowPrivilegeEscalation: false`.
- `capabilities: drop: [ALL]`.
- `seccompProfile: RuntimeDefault`.
- Resource limits are defined: 200m CPU, 128Mi RAM. Revisit when real controller logic is in place — mock responses consume far less than live upstream calls.

## Constraints & Requirements

- **Runtime**: Node.js 18+ (upgrade to 20 — Node 18 EOL April 2025)
- **Framework**: Express 4, single package (no Yarn workspaces)
- **Testing**: Jest 29 + Supertest, targets 75% coverage (currently below — raise as part of first spec)
- **Linting**: ESLint 8 with `eslint:recommended` — must pass with zero warnings before merge; CI currently non-blocking (fix this)
- **Deployment**: GitHub Actions → GHCR → ArgoCD → k3s, `web` namespace
- **Domain**: `lod.charno.net` (external only)
- **Port**: ClusterIP on 3000
- **External sources**: DBPedia, Geonames, Library of Congress, Ordnance Survey, Nomisma, FISH, Getty AAT, ADS, NFDI4Objects, PeriodO

## Development Workflow

1. `yarn dev` — starts service on port 3000 with nodemon auto-reload.
2. `yarn test` — runs Jest with coverage. Must pass before pushing.
3. `yarn lint` — ESLint. Must pass with zero warnings before pushing.
4. Open a PR → CI validates → merge to `main` → GitHub Actions builds image → ArgoCD deploys.
5. Verify: `lod.charno.net/health`.

## Governance

This constitution extends the infra-k8s primary constitution. Conflicts resolve in favour of infra-k8s unless overridden here with a documented reason. Amendments increment the version and are recorded in the Decisions Log.

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-27 | Controllers left as placeholders at initial setup | `linked-data-toolkit` integration is a distinct body of work; routes and structure defined first to establish the API contract |
| 2026-04-27 | Coverage thresholds set too low (40-60%) — must be raised | Initial thresholds were conservative while controllers were stubs; must reach 75% when real logic lands |
| 2026-04-27 | Single-package (no monorepo) | Service has no frontend; a workspace split would add overhead for no benefit |

---

**Version**: 1.0.0 | **Ratified**: 2026-04-27 | **Last Amended**: 2026-04-27
