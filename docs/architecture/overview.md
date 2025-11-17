# Architecture Overview

This document explains the high-level architecture and design decisions for the Chefify backend, including component responsibilities, data flows, operational considerations and a progressive migration plan toward a Ports & Adapters (Hexagonal) architecture.

Core components

- API: An Express app written in TypeScript and run under Bun. Routes are mounted beneath `BASE_ROUTE` (default: `/chefify/api/v1`). Controllers translate HTTP requests into service calls and return HTTP responses.
- Controllers: thin HTTP adapters that validate input (via Zod), call services, and handle HTTP concerns (status codes, parsing multipart payloads). Controllers live in `src/controllers`.
- Services: application/business logic in `src/services`. Services orchestrate repositories, external integrations and domain rules.
- Repositories / Models: persistence layer using Mongoose models under `src/models` and repository helpers in `src/repositories` that encapsulate MongoDB access patterns.
- Session store: server-side sessions persisted in Redis via `express-session` and a Redis store. Session data is the authoritative authentication state (`req.session.user`).
- Utilities & Helpers: cross-cutting helpers under `src/utils` (e.g., `requestBody`, `redisCompat`, `cloudinary.helpers`, `openai.helper`).
- External integrations: Cloudinary (media storage), OpenAI (recipe generation), SMTP provider (email verification/reset), and Redis (session store).

Request / data flow (high level)

1. Client issues HTTP request to an endpoint under `/chefify/api/v1`.
2. Express route resolves middleware stack: authentication, rate-limiters, upload handlers, validation.
3. Controller receives parsed input and delegates to a Service.
4. Service coordinates domain operations: validating business constraints, calling repositories for persistence, or invoking external adapters (Cloudinary, OpenAI, email).
5. Service returns domain result to the controller, which shapes the HTTP response.

Cross-cutting concerns

- Validation: Zod schemas centralize input validation (middleware `validateBody`).
- Auth & Authorization: session-first `authenticate` middleware and specific guards (`recipeGuard`, `ingredientGuard`, `authGuard`) enforce permissions.
- File uploads: `uploadMedia` / `uploadOptionalMedia` middlewares handle multipart data; controllers parse `payload` JSON and extract buffers via `requestBody` helpers.
- Error handling: centralized `ErrorHandler` middleware maps domain and validation errors to HTTP responses with safe messages and optional stack traces in development.
- Logging & monitoring: a pluggable logger utility is used; sensitive data is redacted by policy.

Testing strategy

- Unit tests: services, repositories and utils are covered by Bun unit tests (see `tests/services`, `tests/repositories`, `tests/utils`).
- Integration tests: use Supertest + Bun for HTTP-level behavior. Tests run against in-memory or test Mongo instances; Redis is required for session-backed integration tests. Keep test fixtures isolated and reset between runs.

Operational considerations

- Session store: Redis is required in production. Prefer managed Redis (Elasticache/Memorystore) and put it in a private network. See `docs/architecture/security.md` for Redis hardening and cookie settings.
- Scaling: stateless application servers with a shared Redis session store and a managed MongoDB (Atlas) are recommended. Use a reverse proxy (NGINX) or platform-provided TLS/ingress.
- Backups & persistence: backups for Mongo only; session data can be ephemeral but ensure backups do not leak secrets.

Future direction

We intend to progressively decouple core domain logic from framework and infrastructure code by introducing small "ports" (interfaces) and adapter implementations. This will be done incrementally and only where it improves testability and maintainability, preserving current controller endpoints and behavior during the transition.
