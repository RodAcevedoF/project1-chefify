# Security Specification

This document describes security controls and recommendations for the Chefify backend, with special focus on sessions and Redis usage.

Summary

- Authentication is session-based (server-side sessions stored in Redis). Clients authenticate via an HttpOnly cookie.
- Redis is used only as the session store and must be protected and configured securely in all environments.

1. Session & Cookie Configuration

- Session secret: store a strong random `SESSION_SECRET` in environment configuration or a secrets manager (do NOT commit to repo).
- Session lifetime: set a reasonable TTL for sessions (e.g. 24 hours) and consider refreshing on activity. Shorter lifetimes reduce exposure.
- Regenerate session on login: generate a new session id after successful authentication to mitigate session fixation.
- Invalidate on logout: remove session entry and clear the cookie. For `logout-all`, remove all session IDs associated with the user.
- Cookie flags:
  - `HttpOnly`: true (prevent JS access)
  - `Secure`: true in production (require HTTPS)
  - `SameSite`: `lax` or `strict` depending on cross-site needs; prefer `lax` for most single-page apps, `strict` for higher security.
  - `domain` / `path`: scope cookies to application domain and path when necessary.

2. Redis Security Best Practices

- Use a managed Redis service or place Redis inside a private VPC / network segment. Do not expose Redis to the public Internet.
- Require authentication: enable `requirepass` (or use Redis ACLs) so a password or ACL token is needed to connect.
- Use TLS: if Redis traffic crosses networks, enable TLS to protect data in transit.
- Use Redis ACLs (Redis 6+): create a dedicated user with only the commands and keyspace needed (e.g., `GET`, `SET`, `DEL`, `EXPIRE`, `SADD`, `SREM`, `SMEMBERS`). Avoid giving full admin privileges.
- Limit network access: use firewall security groups to allow only application server IPs to reach Redis.
- Use key namespacing: prefix session keys (e.g., `session:`) to avoid collisions and make monitoring simpler.
- Configure persistence carefully: if session data is sensitive, consider turning off RDB/AOF persistence or secure backups. Most session-only stores can tolerate ephemeral data but ensure backups do not leak secrets.
- Set memory policy and limits: configure `maxmemory` and `maxmemory-policy` to avoid OOM scenarios.
- Rotate credentials: rotate Redis password/ACL tokens periodically and during incidents.

3. Secrets & Environment

- Keep secrets out of the repository. Use `.env` only for local runs; for CI and production use a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault, GitHub Actions secrets).
- Required secrets: `SESSION_SECRET`, `REDIS_URL` (may include auth token), `MONGO_URI`, `SMTP_*`, `CLOUDINARY_*`, `OPENAI_API_KEY`.
- Limit scope of secrets: where possible, use different credentials for test/dev/staging/production.

4. Authentication & Authorization

- Enforce least privilege: controllers should call services that check ownership and roles via dedicated guard middlewares (`authGuard`, `recipeGuard`, `ingredientGuard`).
- Rate-limit auth endpoints: add rate limiting to `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password` to slow brute-force attempts.
- Account lockouts and monitoring: implement progressive delay or lockout after repeated failed login attempts and alert on suspicious activity.
- Password storage: always hash passwords with a modern algorithm (bcrypt, argon2) with appropriate cost factor. Never store plaintext.
- Reset & verification tokens: store one-time tokens hashed in DB (never store raw tokens) and use expiration windows.

5. Input Validation & Output Encoding

- Use Zod schemas to validate request payloads (`validateBody` middleware) and reject malformed or unexpected fields.
- Sanitize and escape any data that will be rendered or passed to downstream systems (avoid injection attacks).

6. Transport & Network

- Enforce HTTPS in production and set `Secure` cookie flag.
- Use secure CORS configuration and enable `credentials: true` only for trusted origins (frontend domain(s)).

7. Logging and Monitoring

- Avoid logging sensitive values such as passwords, session secrets, full tokens or PII. Mask or redact sensitive fields in logs.
- Monitor failed login rates, unusual session volumes, and Redis errors.
- Set up alerting for high error rates, repeated auth failures, or unauthorized Redis access attempts.

8. Operational & Deployment Recommendations

- Prefer managed Redis (AWS Elasticache / Azure Cache / GCP Memorystore) for production; they handle patching, TLS and network controls.
- If self-hosting Redis, run it inside a private network and front it with proper security groups and systemd unit management. Use Redis persistence settings and backups per your RPO/RTO.
- Use environment-specific configuration; do not reuse production credentials in staging.

9. Session Cleanup & Auditing

- Implement session listing and revocation endpoints for admin and for user `logout-all` functionality.
- Log session creation and deletion (audit) with user identifiers, timestamps and request metadata (IP, user-agent) without storing sensitive tokens.

10. Incident Response

- If session secret or Redis credentials leak, rotate the secrets and invalidate existing sessions (clear session keys or change the session secret). Have a documented rollback procedure in `docs/migration/session-auth.md`.

References & Further Reading

- Redis security checklist: https://redis.io/topics/security
- OWASP Top Ten: https://owasp.org/www-project-top-ten/
- Session fixation & management: OWASP session management cheatsheet
