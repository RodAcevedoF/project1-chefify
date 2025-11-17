# Installation & Development

Quick start (development)

1. Install dependencies

```bash
bun install
```

2. Copy `.env.example` to `.env` and set values (see required env vars in project root/README).

3. Start a local Redis instance (recommended). Using Docker:

```bash
docker run -p 6379:6379 --name chefify-redis -d redis:7
```

4. Run database seeds (optional)

```bash
bun run admin-seed
bun run recipe-seed
```

5. Start the dev server

```bash
bun run dev
```

Testing

Run the test suite (uses Bun test runner):

```bash
bun test
```

Notes

- Ensure `REDIS_URL` and `MONGO_URI` are set in `.env`.
- If you don't want to run Redis locally, tests and the app can be configured to use an in-memory mock, but production must use a real Redis instance.

Security checklist (quick)

Follow these steps before deploying to staging or production. See the full security specification at `../architecture/security.md` for details.

- Set a strong `SESSION_SECRET` (use a secrets manager in production).
- Ensure `REDIS_URL` points to a private, authenticated Redis instance (do not expose Redis publicly).
- Enable TLS for Redis if traffic crosses networks or use a managed provider that enforces TLS.
- Configure cookies to be `HttpOnly` and `Secure` (enable `Secure` only in production over HTTPS). Set `SameSite` to `lax` or `strict` depending on your frontend requirements.
- Regenerate session identifiers on login and invalidate sessions on logout. Configure a reasonable session TTL (e.g. 24h) and consider sliding expiration on activity.
- Limit CORS origins to your frontend domains and enable `credentials: true` only for trusted origins.
- Do not store secrets in the repository. Use environment-specific secrets and rotate credentials periodically.
