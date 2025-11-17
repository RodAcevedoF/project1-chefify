# Dependencies

Key dependencies and where they are used:

- `express` — HTTP server and routing.
- `express-session` — session middleware.
- `connect-redis` / `redis` — Redis client and session store integration.
- `mongoose` — MongoDB ODM.
- `zod` — schema validation.
- `supertest` — HTTP assertions in tests.
- `cloudinary` — image uploads.
- `jsonwebtoken` — (legacy) token utilities; retained only if required for tokens (most app flows are session-based).

Dev & testing

- `bun` — runtime and test runner.

````markdown
# Dependencies

This document describes the project's dependencies, where they are used, and recommendations for managing and upgrading them.

## Overview

The project runs on Bun and uses Express + Mongoose for the API and MongoDB persistence. Sessions are stored in Redis. We split packages into:

- **Production dependencies**: required at runtime by the app.
- **Dev dependencies**: required for building, testing and local development.

When possible, prefer pinning to specific minor/patch versions and keep a lockfile (`bun.lock`) checked into the repo to ensure reproducible installs.

## Runtime & Tooling

- `bun` — runtime, package manager, and test runner for local development and CI (see `bun.lock`).
- `typescript` — static typing and compilation step.
- `ts-node` / Bun-native TS support — used for running TypeScript in development (project uses Bun runtime with TypeScript config).

## Key Production Dependencies

- `express` — HTTP server and routing.
- `express-session` — session middleware for server-side sessions.
- `connect-redis` and `redis` — Redis client + session store integration.
- `mongoose` — MongoDB ODM used for models & schema definitions.
- `cloudinary` — image/media uploads and transformations.
- `zod` — validation schemas for request/response shapes (runtime + static typing aid).
- `bcrypt` or `bcryptjs` — password hashing (check `package.json` for the exact chosen implementation).

Note: `jsonwebtoken` may still exist in `package.json` for legacy utilities, but the app is session-first; remove only after verifying no code uses it.

## Dev & Test Dependencies

- `bun` (test runner + package manager) — used to run the test suite.
- `supertest` — HTTP assertions and integration testing helpers.
- `mocha` / `vitest` / `bun:test` — project test tooling (the repo uses Bun's test runner compatibility; check `package.json` scripts).
- TypeScript types (`@types/express`, `@types/node`, etc.) — developer ergonomics.
- `eslint` / `prettier` — linting and formatting.

## Dependency Management & Lockfiles

- Keep `bun.lock` in source control. This ensures deterministic installs across developers and CI.
- In `package.json` choose a versioning policy and be consistent:
  - Pin exact patch versions for critical runtime libs, or
  - Use caret ranges `^` for controlled minor updates and run CI to validate.
- In CI, install with a frozen lockfile to avoid unexpected resolution changes:

```zsh
# using Bun
bun install --frozen-lockfile
```
````

If CI uses `npm`/`pnpm` as part of existing pipelines, prefer the equivalent frozen-lockfile flag for those tools.

## Upgrading Dependencies Safely

1. Create a short-lived branch for the dependency update.
2. Update one or a small group of related packages at a time.
3. Run the full test suite and smoke tests locally and in CI.
4. Review CHANGELOG/release notes for breaking changes.
5. Deploy to a staging/canary environment before promoting to production.

Common commands (Bun-centered):

```zsh
# Add a new dependency
bun add <package>

# Add as dev dependency
bun add -d <package>

# Upgrade a package to latest satisfying version constraints
bun upgrade <package>

# Install with lockfile enforcement in CI
bun install --frozen-lockfile
```

If you also use `npm` locally in some contexts, you can run `npm audit` for vulnerability checks (see scanning section below).

## Vulnerability Scanning & Automation

- Use automated tools to detect vulnerable dependencies:
  - GitHub Dependabot (recommended) — auto-open PRs for dependency updates.
  - Snyk or WhiteSource for deeper vulnerability scanning and policy enforcement.
  - `npm audit` or `yarn audit` as a quick local check when applicable.

- Recommended CI step: run a vulnerability scan (Snyk or `npm audit`) and fail the build if high/critical vulnerabilities are detected.

## Licensing & Compliance

- Consider running a license check (e.g., `license-checker` or `licensee`) if you need to validate third-party license compatibility.

## Useful Tools & Commands

- Run tests locally:

```zsh
bun test
```

- Run linter and formatter:

```zsh
npm run lint
npm run format
```

- Check for outdated packages (example using `npm`):

```zsh
npm outdated
```

For Bun-specific workflows, prefer Bun commands (`bun add`, `bun install`, `bun upgrade`) but keep `npm`-based checks available in CI where necessary.

## Best Practices & Policies

- Keep `bun.lock` checked into the repo.
- Automate dependency updates with Dependabot and require CI to pass before merging updates.
- Run the entire test suite and smoke tests after upgrades; require a staging deployment for major updates.
- Pin critical runtime libraries (DB drivers, session stores) to patch-level where stability is important.

## Quick Checklist for Upgrading a Dependency

1. Read the dependency's changelog and migration notes.
2. Update on a feature branch; bump only what you need.
3. Run `bun install` and the test suite: `bun test`.
4. Run vulnerability scanner (Snyk / `npm audit`).
5. Deploy to staging and run smoke tests for real integrations (Redis, Cloudinary, DB).
6. Merge and schedule production rollout.

```markdown

```
