# FAQ

Q: Why server-side sessions instead of JWTs?

A: Sessions centralize authentication state on the server (Redis in our deployment). Benefits:

- **Revocation:** you can immediately invalidate a session server-side.
- **Simpler frontend:** the browser handles session cookies (`withCredentials` + HttpOnly cookie). No client-side token refresh logic required.
- **Smaller tokens:** avoids large JWT payloads sent with every request.

Q: How do sessions work in this project?

A: On login we create a server-side session object stored in Redis and set an HttpOnly cookie containing the session id. Subsequent requests use the cookie; `express-session` loads the session from Redis and `req.session.user` contains the authenticated user payload.

Q: How do I run tests locally?

A: Steps:

1. Copy `.env.example` to `.env` and populate values for `MONGO_URI`, `REDIS_URL`, and `SESSION_SECRET`.
2. Start required services (if you don't have a local Redis/Mongo, use Docker Compose or run them locally):

```zsh
# start with docker-compose (example)
docker compose up -d redis mongo
```

3. Install dependencies and run tests:

```zsh
bun install --frozen-lockfile
bun test
```

Q: What environment variables are required?

A: Minimum required env vars (see `.env.example`):

- `MONGO_URI` — MongoDB connection string
- `REDIS_URL` — Redis connection URL
- `SESSION_SECRET` — secret used by `express-session`
- `CLOUDINARY_URL` / `CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — for media uploads (if used)
- `SMTP_*` — SMTP settings for outgoing email (verification/reset)
- `OPENAI_API_KEY` — if using AI features

Q: How should the frontend handle authentication after the migration?

A: Frontend should send requests with credentials enabled and rely on cookies for auth:

```js
// axios example
axios.defaults.withCredentials = true;
const resp = await axios.post('/auth/login', { email, password });
```

Important: keep `HttpOnly` on the session cookie; the frontend cannot read or modify it.

Q: How do I manually revoke a user's sessions?

A: Admin or service code can remove sessions stored for a given user in Redis. The project exposes AuthService helpers for adding/removing sessions — check `src/services/auth.service.ts`.

Q: The tests fail with Redis connection errors — what do I do?

A: Common causes and fixes:

- **Redis not running** — start Redis locally or via Docker Compose.
- **Wrong `REDIS_URL`** — verify `.env` matches your local/CI Redis address.
- **CI context** — ensure CI config spins up Redis before running tests (e.g., GitHub Actions services or `docker compose up -d`).

Q: How do I run the app locally (development)?

A: Typical dev workflow:

```zsh
# install deps
bun install

# start local dev server
bun run start:dev
```

Check `package.json` scripts for exact commands used by this project.

Q: Where are media uploads stored and how are they configured?

A: Media is uploaded to Cloudinary. Configuration is in `src/config/cloudinary.config.ts` and helpers in `src/utils/cloudinary.helpers.ts`. Ensure Cloudinary env vars are present in `.env` for dev and in your deployment secrets for production.

Q: What about OpenAI usage and costs?

A: OpenAI integration (used for AI recipe generation) requires `OPENAI_API_KEY`. We track use via `aiUsage` counters on the user model and apply simple limits in middleware (`src/middlewares/AIUsage.ts`). Monitor usage and set quotas to avoid runaway costs.

Q: Common errors & quick fixes

- **Mongoose CastError (invalid ObjectId)** — often caused by tests or requests sending plain strings where ObjectId is expected. Use `new Types.ObjectId(id)` in scripts, or validate IDs in requests.
- **E11000 duplicate key** — unique index violation (e.g., duplicate email/title). Handle these errors in service layer and return friendly messages.
- **CORS / cookie not sent** — ensure frontend requests include credentials and server CORS allows credentials (`origin` must be exact, `credentials: true`).

Q: How to contribute or add features?

A: Preferred workflow:

1. Open an issue describing the change.
2. Fork and create a small focused branch for the change.
3. Add or update tests for new behavior.
4. Run `bun test` locally and ensure CI passes.
5. Open a PR and request review.

Q: Where can I get more help or context?

A: Check the `README.md`, `docs/` folder (architecture, API, migration notes) and reach out to the repository owner or assigned maintainer in the project channel.
