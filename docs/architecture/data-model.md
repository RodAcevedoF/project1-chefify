# Data Model (ERD) — Users, Recipes, Ingredients

This document documents the main domain models: `User`, `Recipe`, and `Ingredient`. It lists key fields, relations, indexes and common queries.

## Overview

- Database: MongoDB (Mongoose). Models live under `src/models` and schemas under `src/schemas`.
- Approach: mostly normalized with references for relationships (ObjectId refs). Some denormalization is used for convenience (e.g., `savedRecipes` stored on `User`).

## User

Model: `User` (`src/schemas/user.schema.ts`)

Key fields

- `_id` (ObjectId)
- `name` (string, required)
- `email` (string, required, unique)
- `password` (string, hashed)
- `role` (enum: `user` | `admin`, default `user`)
- `savedRecipes` (Array<ObjectId ref Recipe>)
- `followersCount`, `followingCount` (Numbers)
- `imgUrl`, `imgPublicId` (strings)
- `shortBio` (string, maxlength 160)
- `aiUsage` (embedded doc: count, lastReset)
- `recentOps` (array of small embedded operation records)
- `emailVerificationToken`, `emailVerificationExpires`
- `resetPasswordToken`, `resetPasswordExpires`
- `isVerified` (boolean)
- Timestamps: `createdAt`, `updatedAt`

Virtuals

- `recipesCount` — virtual count of recipes authored by the user (Mongoose virtual).

Indexes

- `role` (ascending)
- `createdAt` (descending)
- text index on `name` for search

Common queries & patterns

- Find by email: `User.findOne({ email })` (used for auth)
- Text search on name: `User.find({ $text: { $search: '...' } })`
- Populate saved recipes: `user.populate('savedRecipes')` or repository helper
- List recent operations: `user.recentOps` array is stored on the user document

Notes

- Passwords are hashed via schema `pre('save')` and `pre('update')` hooks. Do not attempt to re-hash in services.
- `savedRecipes` is used for quick access to saved recipes; depending on scale you may want a dedicated collection for saved relations.

## Recipe

Model: `Recipe` (`src/schemas/recipe.schema.ts`)

Key fields

- `_id` (ObjectId)
- `userId` (ObjectId ref `User`) — author (optional)
- `title` (string, unique, required)
- `ingredients` (array of { ingredient: ObjectId ref `Ingredient`, quantity: Number })
- `instructions` (array of strings)
- `categories` (array of strings — enum)
- `likesCount` (Number)
- `imgUrl`, `imgPublicId` (strings)
- `servings`, `prepTime` (numbers)
- `utensils` (array of strings)
- Timestamps

Indexes

- text index: `{ title: 'text', instructions: 'text' }` for search
- `createdAt` descending index for recent queries

Common queries & patterns

- Get by id: `Recipe.findById(id)`
- Search by title/instructions: `Recipe.find({ $text: { $search: 'pizza' } })`
- List by author: `Recipe.find({ userId })` with pagination
- Update ingredient quantities and media with `findByIdAndUpdate` or repository helpers

Notes

- `title` is unique — used as a human-friendly constraint. Ensure uniqueness errors are handled gracefully in services.

## Ingredient

Model: `Ingredient` (`src/schemas/ingredient.schema.ts`)

Key fields

- `_id` (ObjectId)
- `userId` (ObjectId ref `User`) — who added the ingredient (optional)
- `name` (string, unique, required)
- `unit` (string enum: `gr`, `ml`, `tsp`, `tbsp`, `cloves`, `unit`)
- Timestamps

Indexes

- text index on `name`
- `createdAt` descending

Common queries & patterns

- Find by name: `Ingredient.findOne({ name })` or text search
- Bulk import via CSV: service validates each row against `IngredientInputSchema` and inserts safe rows only

## Relationship diagram (textual ERD)

- `User` 1 --- \* `Recipe` (user -> recipes via `userId`)
- `Recipe` _ --- _ `Ingredient` via `ingredients` array referencing `Ingredient._id`
- `User` _ --- _ `Recipe` via `savedRecipes` array

## Scaling & optimization notes

- Indexing: text indexes are used for search (`Recipe.title`, `Recipe.instructions`, `Ingredient.name`, `User.name`). Monitor index size and performance.
- Large arrays: `savedRecipes` on User can grow unbounded — consider a dedicated collection `SavedRecipe` for very active users.
- Aggregations: prefer aggregation pipelines when computing counts or performing joins across collections; rely on Mongo indexes to support common filters.

## Migration considerations

- If you move to a Ports & Adapters architecture, keep schema definitions in the persistence adapter layer so the domain core can remain framework-agnostic.
- Consider an explicit data migration plan when changing indexed fields or splitting collections.

## Example Mongoose snippets

Find recent recipes with pagination:

```js
const limit = 10;
const page = 1;
const recipes = await Recipe.find({})
	.sort({ createdAt: -1 })
	.skip((page - 1) * limit)
	.limit(limit);
```

Text search with score:

```js
const results = await Recipe.find(
	{ $text: { $search: 'pizza' } },
	{ score: { $meta: 'textScore' } },
).sort({ score: { $meta: 'textScore' } });
```

Populate saved recipes for a user:

```js
const user = await User.findById(userId);
await user.populate('savedRecipes');
```
