# Spec-Driven Development — web-service-lod

This directory follows the [Spec Kit](https://github.com/github/spec-kit) approach to spec-driven development.

## Inheritance

```
infra-k8s/.specify/memory/constitution.md        ← primary (GitOps, secrets, security, clean code)
        ↓
web-service-lod/.specify/memory/constitution.md  ← this file (API contract, external sources, testing)
```

All infra-k8s principles apply here. Read that first if you are new to the project.

## Recommended first spec

The controllers are currently placeholders awaiting integration with `linked-data-toolkit`. That integration is the most important pending work:

```
.specify/specs/001-linked-data-toolkit-integration/
├── spec.md    # Which sources first, upstream error contract, acceptance criteria
├── plan.md    # How to integrate, mocking strategy for tests, timeout/retry approach
└── tasks.md   # Ordered tasks per source, include coverage threshold raise
```

## Structure

```
.specify/
├── memory/
│   └── constitution.md   # Governing principles for this repo
└── specs/
    └── <###-feature>/    # One directory per feature/initiative
        ├── spec.md       # What to build (functional requirements)
        ├── plan.md       # How to build it (technical design)
        └── tasks.md      # Ordered implementation steps
```

## Key commands

```bash
yarn dev          # Start service with nodemon (port 3000)
yarn test         # Jest with coverage — must pass before pushing
yarn lint         # ESLint — must be zero warnings before pushing
yarn lint:fix     # Auto-fix lint issues
```
