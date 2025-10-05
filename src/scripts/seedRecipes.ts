import { connect, disconnect, Types } from 'mongoose';
import { Recipe, Ingredient, User } from '../models';
import {
	seedRecipes,
	seedIngredients,
	RecipeCategories,
	type RecipeCategory,
} from '../data';
import { RecipeInputSchema, IngredientInputSchema } from '../schemas';
import 'dotenv/config';

interface MongoError {
	code?: number;
}

export const runSeed = async () => {
	if (process.env.NODE_ENV !== 'development') process.exit(1);

	try {
		const db_url = process.env.DB_URL!;
		await connect(db_url);
		console.log('Connected to MongoDB');

		await Promise.all([
			Recipe.collection.drop().catch((e) => {
				console.warn("Couldn't drop Recipe:", e.message);
			}),
			Ingredient.collection.drop().catch((e) => {
				console.warn("Couldn't drop Ingredient:", e.message);
			}),
		]);
		console.log('Dropped collections');

		await Ingredient.syncIndexes();
		await Recipe.syncIndexes();
		const admin = await User.findOne({ role: 'admin' });
		if (!admin)
			throw new Error('Admin user not found. Please run seedAdmin first.');
		console.log('Indexes synchronized');

		const validIngredients = seedIngredients.filter((raw) => {
			const parsed = IngredientInputSchema.safeParse(raw);
			if (!parsed.success) {
				console.warn('Invalid ingredient:', parsed.error);
				return false;
			}
			return true;
		});

		const insertedIngredients = [];
		const skippedIngredients = [];

		type IngredientInsert = {
			_id?: Types.ObjectId | string;
			userId?: Types.ObjectId | string;
		} & Record<string, unknown>;
		for (const ingredient of validIngredients) {
			try {
				const doc: IngredientInsert = {
					...ingredient,
					userId: String(admin._id),
				} as IngredientInsert;
				if ((ingredient as IngredientInsert)._id)
					// keep _id as ObjectId so DB doesn't auto-generate a new one
					doc._id = new Types.ObjectId(String(ingredient._id));
				await Ingredient.create(doc);
				insertedIngredients.push(ingredient.name);
			} catch (error) {
				if ((error as MongoError).code === 11000) {
					skippedIngredients.push(ingredient.name);
				} else {
					console.error('Error inserting ingredient:', error);
					process.exit(1);
				}
			}
		}

		console.log(`Inserted ${insertedIngredients.length} ingredients`);
		if (skippedIngredients.length) {
			console.log(`Skipped ${skippedIngredients.length} duplicates`);
		}

		const allIngredients = await Ingredient.find();
		const ingredientMap = new Map<string, string>();
		for (const ing of allIngredients) {
			ingredientMap.set(
				String(ing.name).toLowerCase().trim(),
				ing._id.toString(),
			);
		}

		const cleanedRecipes = seedRecipes.map((r) => ({
			...r,
			categories: (r.categories ?? []).filter((cat) =>
				RecipeCategories.includes(cat as RecipeCategory),
			),
			ingredients: r.ingredients.map(({ ingredient, quantity }) => ({
				ingredient,
				quantity,
			})),
		}));

		const insertedRecipes = [];
		const skippedRecipes = [];

		for (const recipe of cleanedRecipes) {
			const resolvedIngredients: { ingredient: string; quantity: number }[] =
				[];
			let unresolved = false;
			for (const ing of recipe.ingredients) {
				const candidate = String(ing.ingredient || '').trim();
				let foundId: string | null = null;
				if (/^[0-9a-fA-F]{24}$/.test(candidate)) {
					const doc = await Ingredient.findById(candidate);
					if (doc) foundId = doc._id.toString();
				}
				if (!foundId) {
					const byName = ingredientMap.get(candidate.toLowerCase());
					if (byName) foundId = byName;
				}
				if (!foundId) {
					// If an ingredient wasn't found by id or name, create it on-the-fly
					try {
						const created = await Ingredient.create({
							name: candidate,
							userId: String(admin._id),
						});
						foundId = created._id.toString();
						// keep map updated so future lookups find it by name
						ingredientMap.set(candidate.toLowerCase().trim(), foundId);
						console.log(
							`Auto-created missing ingredient '${candidate}' with id ${foundId}`,
						);
					} catch {
						console.warn(
							`Failed to auto-create ingredient '${candidate}' for recipe '${recipe.title}'. Skipping recipe.`,
						);
						unresolved = true;
						break;
					}
				}
				resolvedIngredients.push({
					ingredient: foundId,
					quantity: Number(ing.quantity),
				});
			}

			if (unresolved) continue;

			const toInsert = {
				...recipe,
				ingredients: resolvedIngredients,
				userId: String(admin._id), // Zod expects string for userId
			};
			const parsed = RecipeInputSchema.safeParse(toInsert);
			if (!parsed.success) {
				console.warn(
					'Invalid recipe after resolving ingredients:',
					recipe.title,
					parsed.error,
				);
				continue;
			}

			try {
				await Recipe.create(toInsert);
				insertedRecipes.push(recipe.title);
			} catch (error) {
				if ((error as MongoError).code === 11000) {
					skippedRecipes.push(recipe.title);
				} else {
					console.error('Error inserting recipe:', error);
					process.exit(1);
				}
			}
		}

		console.log(`Inserted ${insertedRecipes.length} recipes`);
		if (skippedRecipes.length) {
			console.log(`Skipped ${skippedRecipes.length} duplicates`);
		}
	} catch (error) {
		console.error('Seeding failed:', error);
		process.exit(1);
	} finally {
		await disconnect();
		console.log('MongoDB disconnected');
	}
};

runSeed();
