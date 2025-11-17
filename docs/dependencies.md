# Dependencies

This document lists the project's real runtime and developer dependencies (matched to `package.json`) and provides guidance for managing them.

## Key runtime dependencies (selected)

These are the libraries used at runtime by the application (not an exhaustive npm list — see `package.json` for the full set):

- `express` — HTTP server and routing
- `express-session` — server-side sessions
- `connect-redis` / `redis` — Redis client and session-store integration
- `mongoose` — MongoDB ODM
- `zod` — request/response validation
- `cloudinary` — media uploads and CDN
- `openai` — AI recipe generation integration
- `nodemailer` — email sending (verification, reset)
- `bcryptjs` — password hashing
- `multer` — multipart file parsing for uploads
- `csv-parse` — CSV parsing for bulk imports
- `xlsx` — spreadsheet parsing for import/export
- `dotenv` — environment variable loading

Additionally, various utility libraries are present (`uuid`, `streamifier`, `morgan`, `helmet`, `cors`, `cookie-parser`, etc.). See `package.json` for the complete list and exact versions.

## Dev & test dependencies

- `bun` — runtime, package manager and test runner used by this project
- `supertest` — HTTP integration testing helper
- `mongodb-memory-server` — in-memory MongoDB for fast tests
- `eslint`, `prettier`, `@typescript-eslint/*` — linting and formatting
- TypeScript types for common packages (`@types/*`) are present as dependencies in the repo (some projects keep them under `dependencies` to make tooling consistent; check `package.json`).

## Where to check the authoritative list

The single source of truth for precise dependency names and versions is `package.json` and the lockfile `bun.lock`. If you need to audit or update versions, use Bun (`bun add`, `bun upgrade`) and update lockfile in CI with `bun install --frozen-lockfile`.

## Tips for keeping dependencies healthy

- Keep `bun.lock` committed to the repo for reproducible installs.
- Use automated security checks (Dependabot, Snyk) to open PRs for updates and scan for vulnerabilities.
- Upgrade dependencies incrementally and run the full test suite and CI before merging.

## Quick commands

```zsh
# Add a runtime dependency
bun add <package>

# Add a dev dependency
bun add -d <package>

# Upgrade a package
bun upgrade <package>

# Install using the lockfile in CI
bun install --frozen-lockfile
```

For a complete list of installed packages and exact versions, open `package.json` in the project root.

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
