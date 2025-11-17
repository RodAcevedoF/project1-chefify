# API Endpoints (Summary)

This file maps the current routes implemented under `src/routes` to provide a single reference for the API surface.

Base route: `/chefify/api/v1`

Auth

- `POST /auth/register` — create account (public)
- `POST /auth/login` — login (creates server-side session)
- `POST /auth/logout` — logout (destroys current session) — authenticated
- `POST /auth/logout-all` — destroy all sessions for the authenticated user — authenticated
- `POST /auth/logout-all/:id` — destroy all sessions for a specific user — admin only
- `POST /auth/forgot-password` — request password reset (public)
- `POST /auth/reset-password` — perform reset using token (public)
- `GET /auth/reset-password` — reset password page (public)
- `GET /auth/verify-email` — verify email using token (public)
- `POST /auth/change-password` — change password for authenticated user — authenticated
- `GET /auth/me` — get current authenticated user / session status — authenticated

Users

- `GET /user` — get current user info (authenticated). When used by admins, returns list behavior is handled in controller/ admin routes.
- `GET /user/email?email=:email` — lookup user by email (authenticated)
- `PATCH /user` — update current user (authenticated). Supports optional media upload via `uploadOptionalMedia` middleware.
- `DELETE /user` — delete current user (authenticated)
- `GET /user/saved-recipes` — get saved recipes for current user (authenticated)
- `GET /user/my-recipes` — get recipes created by current user (authenticated)
- `GET /user/ops` — get recent operations for the current user (authenticated)
- `POST /user/save-recipe/:recipeId` — save a recipe to current user's saved list (authenticated)
- `DELETE /user/remove-recipe/:recipeId` — remove saved recipe (authenticated)
- `POST /user/contact` — contact endpoint (public)

Recipes (all mounted with `authenticate()` middleware by default)

- `POST /recipe` — create recipe (authenticated). Accepts multipart upload via `uploadMedia('mediafile', false)` with optional `payload` JSON field.
- `GET /recipe` — list recipes. Supported query params: `category`, `userId`, `title` (search), `sort` (`asc`/`desc`), `limit`, `page`.
- `GET /recipe/suggested` — generate AI-suggested recipe. Protected by `limitAIUsage` middleware controlling OpenAI usage.
- `GET /recipe/:id` — get recipe by id.
- `PATCH /recipe/:id` — update recipe (requires `recipeGuard` to verify ownership or admin). Supports `uploadMedia` for image.
- `DELETE /recipe/:id` — delete recipe (requires `recipeGuard`).

Ingredients (mounted with `authenticate()`)

- `POST /ingredient` — create ingredient (body validated by `IngredientInputSchema`).
- `GET /ingredient` — list ingredients.
- `GET /ingredient/:id` — get ingredient by id.
- `PATCH /ingredient/:id` — update ingredient (requires `ingredientGuard`).
- `DELETE /ingredient/:id` — delete ingredient (requires `ingredientGuard`).

Media

- `POST /media/:type` — upload image. Route wiring and permissions depend on controllers/middlewares (some media uploads are admin-only, others allow user uploads).
- `POST /media/:type/:id` — upload image for a specific entity (user or recipe) — route-level guards enforce permissions.
- `DELETE /media/:type/:id` — delete uploaded image (guarded by ownership/role checks).

Admin

All admin routes are mounted under `/admin` and protected with `authenticate(['admin'])`:

- `POST /admin` — create user (with optional media upload)
- `POST /admin/recipes` — import recipes via CSV upload (`uploadDataFile`)
- `POST /admin/ingredients` — import ingredients via CSV upload
- `POST /admin/users/import` — import users via CSV upload
- `GET /admin/recipes/template` — download recipes CSV template
- `GET /admin/users/template` — download users CSV template
- `GET /admin/recipes` — list recipes (admin view)
- `GET /admin/users` — list users
- `GET /admin/operations` — get recent operations (audit)
- `GET /admin/:id` — get user by id (proxy to UserController.getById)
- `GET /admin/email/:email` — get user by email
- `PATCH /admin/:id` — update user (admin)
- `DELETE /admin/:id` — delete user (admin)

Follow

- `POST /:userId/follow` — follow a user (authenticated)
- `DELETE /:userId/unfollow` — unfollow a user (authenticated)
- `GET /:userId/followers` — list followers of a user (public)
- `GET /:userId/following` — list who the user follows (public)
- `GET /:userId/is-following` — check if current authenticated user follows `userId` (authenticated)

Like

- `POST /:recipeId/like` — like a recipe (authenticated)
- `DELETE /:recipeId/unlike` — unlike a recipe (authenticated)
- `GET /:recipeId/has-liked` — check if current user has liked the recipe (authenticated)

Notes & conventions

- Authentication: middleware `authenticate()` is session-first and will reject requests without a valid `req.session.user`.
- Guards: `recipeGuard`, `ingredientGuard`, and `authGuard` verify ownership or admin privileges where appropriate.
- Uploads: `uploadMedia` and `uploadOptionalMedia` are used to receive multipart/form-data with an optional `payload` field containing JSON; controllers parse `payload` and the helpers `requestBody` centralize parsing.
- Validation: Zod schemas in `src/schemas` validate payloads (see `validateBody` middleware used in some routes).
- For full request/response shapes, check the controller implementations in `src/controllers` and the schemas in `src/schemas`.
