import xlsx from 'xlsx';

type TemplateResult =
	| { type: 'xlsx'; buffer: Buffer; filename: string; mime: string }
	| { type: 'csv'; csv: string; filename: string; mime: string };

export const ImportsService = {
	buildRecipesTemplate(format: 'csv' | 'xlsx' = 'csv'): TemplateResult {
		const headers = [
			'title',
			'ingredients',
			'instructions',
			'servings',
			'prepTime',
			'categories',
			'utensils',
			'imgUrl',
		];

		const ingredientExample = JSON.stringify([
			{ ingredientName: 'Sugar', unit: 'gr', quantity: 100 },
			{ ingredientName: 'Milk', unit: 'ml', quantity: 200 },
		]);

		const instructionsExample = JSON.stringify([
			'Preheat oven to 180C',
			'Mix sugar and butter until fluffy',
			'Bake for 20 minutes',
		]);

		const categoriesExample = JSON.stringify(['vegan', 'dessert']);
		const utensilsExample = JSON.stringify(['spoon', 'bowl']);

		if (format === 'xlsx') {
			const ws = xlsx.utils.aoa_to_sheet([headers]);
			const wb = xlsx.utils.book_new();
			xlsx.utils.book_append_sheet(wb, ws, 'recipes_template');

			const idxIngredients = headers.indexOf('ingredients');
			const idxInstructions = headers.indexOf('instructions');
			const idxCategories = headers.indexOf('categories');
			const idxUtensils = headers.indexOf('utensils');

			xlsx.utils.sheet_add_aoa(ws, [[ingredientExample]], {
				origin: { r: 1, c: idxIngredients },
			});
			xlsx.utils.sheet_add_aoa(ws, [[instructionsExample]], {
				origin: { r: 1, c: idxInstructions },
			});
			xlsx.utils.sheet_add_aoa(ws, [[categoriesExample]], {
				origin: { r: 1, c: idxCategories },
			});
			xlsx.utils.sheet_add_aoa(ws, [[utensilsExample]], {
				origin: { r: 1, c: idxUtensils },
			});

			const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
			return {
				type: 'xlsx',
				buffer,
				filename: 'recipes-template.xlsx',
				mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			};
		}

		// CSV
		const csvRows: string[] = [];
		csvRows.push(headers.join(','));
		const escaped = (s: string) => '"' + s.replace(/"/g, '""') + '"';
		const exampleRow = new Array(headers.length).fill('');
		const idxIngredients = headers.indexOf('ingredients');
		const idxInstructions = headers.indexOf('instructions');
		const idxCategories = headers.indexOf('categories');
		const idxUtensils = headers.indexOf('utensils');
		exampleRow[idxIngredients] = escaped(ingredientExample);
		exampleRow[idxInstructions] = escaped(instructionsExample);
		exampleRow[idxCategories] = escaped(categoriesExample);
		exampleRow[idxUtensils] = escaped(utensilsExample);
		csvRows.push(exampleRow.join(','));
		const csv = csvRows.join('\n') + '\n';

		return {
			type: 'csv',
			csv,
			filename: 'recipes-template.csv',
			mime: 'text/csv',
		};
	},
	buildUsersTemplate(format: 'csv' | 'xlsx' = 'csv'): TemplateResult {
		const headers = [
			'name',
			'email',
			'password',
			'role',
			'shortBio',
			'isVerified',
		];

		const example = [
			'Alice Example',
			'alice@example.com',
			'changeme123',
			'user',
			'Short bio',
			'false',
		];

		if (format === 'xlsx') {
			const ws = xlsx.utils.aoa_to_sheet([headers]);
			const wb = xlsx.utils.book_new();
			xlsx.utils.book_append_sheet(wb, ws, 'users_template');
			xlsx.utils.sheet_add_aoa(ws, [example], { origin: { r: 1, c: 0 } });
			const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
			return {
				type: 'xlsx',
				buffer,
				filename: 'users-template.xlsx',
				mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			};
		}

		const csvRows: string[] = [];
		csvRows.push(headers.join(','));
		const escaped = (s: string) => '"' + String(s).replace(/"/g, '""') + '"';
		csvRows.push(example.map(escaped).join(','));
		const csv = csvRows.join('\n') + '\n';

		return {
			type: 'csv',
			csv,
			filename: 'users-template.csv',
			mime: 'text/csv',
		};
	},
};

export default ImportsService;
