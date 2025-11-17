```markdown
# Technologies

This file explains the primary technologies used in Chefify, why they were chosen, where configuration lives, and guidance for contributors when adding or changing technologies.

## Core stack

- **Runtime & Tooling:** Bun — fast JavaScript/TypeScript runtime, package manager and test runner. Chosen for developer feedback speed and a single-tool developer experience. (Alternative: Node.js + npm/yarn/pnpm.)
- **Language:** TypeScript for static typing and safer refactors.
- **Web framework:** Express — lightweight, well-understood HTTP framework that fits the project's needs.
- **Database:** MongoDB, accessed with Mongoose ODM for schema modeling and validation at the DB layer.
- **Session store:** Redis using `express-session` plus a Redis session store (`connect-redis` / `redis`). Sessions are server-side; cookies are HttpOnly.

## Validation & Data

- **Zod** — runtime schema validation integrated with request validation helpers and schemas under `src/schemas`.

## Media & External Integrations

- **Cloudinary** — image/media uploads and CDN (configured in `src/config/cloudinary.config.ts`).
- **OpenAI** — optional AI features for recipe generation (wrapper helpers in `src/utils/openai.helper.ts`).
- **SMTP / Email provider** — email verification and password reset flows are configurable via `src/config/email.config.ts`.

## Testing & Development tooling

- **Bun test runner** — used for unit and integration tests. Commands live in `package.json` scripts.
- **Supertest** — used for HTTP integration tests.
- **ESLint & Prettier** — linting and formatting; configured at repo root.

## Logging & Observability

- The project exposes a small logger abstraction (console-based by default). The implementation can be swapped for `pino` or another structured logger; see the logger helper and usage points in `src/utils`.

## Other Notable Libraries

- `multer` — multipart file handling for uploads (used in media endpoints).
- `csv-parse` / custom CSV reader in `src/utils/csvReader.ts` — used for bulk ingredient imports.

## Where configuration lives

- `src/config/*.ts` — central configuration files (Mongo, Redis, Cloudinary, email, multer). Update env var names here when adding services.
- `.env.example` — canonical list of environment variables needed to run the app.
- `bun.lock` / `package.json` — pinned versions & scripts.

## Rationale & trade-offs

- **Bun**: speeds up local iteration and simplifies developer toolchain (runtime, package manager, test runner). Trade-off: smaller ecosystem and occasional native-compatibility caveats with some Node-native binaries — prefer pure JS libraries or check native compatibility on contributor PRs.
- **Express + Mongoose**: simple, well-known patterns for REST APIs and document modeling. If needs grow (complex domain rules, strict typing across persistence), consider moving toward a ports-and-adapters pattern or a strongly typed ORM.
- **Redis sessions**: makes revocation and short-term state management straightforward. If you need fully stateless auth (horizontal scale without session store), reconsider JWTs or signed cookies with short expirations and a revocation list.

## Adding or replacing a technology

1. Add an ADR in `docs/architecture/adr/` describing the decision, alternatives considered, and migration plan.
2. Add configuration in `src/config/` and document required env vars in `.env.example`.
3. Add tests and CI changes (if services are required in CI, update `.github/workflows/*`).

## Quick pointers for contributors

- To change session behavior: edit `src/config/session` (or `src/config/mongo.config.ts` / `src/config/multer.config.ts`) and update middleware in `src/middlewares`.
- To add a new external integration (analytics, search, etc.), add a thin adapter under `src/adapters/` and an interface under `src/ports/` to keep the core logic decoupled.
```
