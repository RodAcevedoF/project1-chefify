export const seedRecipes = [
	{
		title: 'Spaghetti Aglio e Olio',
		ingredients: [
			{
				ingredient: '64a111111111111111111111',
				quantity: 200,
			}, // Spaghetti
			{
				ingredient: '64a222222222222222222222',
				quantity: 3,
			}, // Garlic
			{
				ingredient: '64a333333333333333333333',
				quantity: 3,
			}, // Olive oil
			{
				ingredient: '64a444444444444444444444',
				quantity: 0.5,
			}, // Chili flakes
			{
				ingredient: '64a555555555555555555555',
				quantity: 2,
			}, // Parsley
			{
				ingredient: '64a666666666666666666666',
				quantity: 1,
			}, // Salt
		],
		instructions: [
			'Cook spaghetti in salted boiling water until al dente.',
			'Sauté garlic in olive oil until golden.',
			'Add chili flakes and cooked spaghetti to the pan.',
			'Toss well and garnish with chopped parsley.',
			'Serve hot.',
		],
		categories: ['pasta', 'quick-meals'],
		servings: 2,
		prepTime: 20,
		utensils: ['Pan', 'Pot'],
	},
	{
		title: 'Greek Salad',
		ingredients: [
			{
				ingredient: '64b111111111111111111111',
				quantity: 2,
			}, // Tomatoes
			{
				ingredient: '64b222222222222222222222',
				quantity: 1,
			}, // Cucumber
			{
				ingredient: '64b333333333333333333333',
				quantity: 0.5,
			}, // Red onion
			{
				ingredient: '64b444444444444444444444',
				quantity: 100,
			}, // Feta
			{
				ingredient: '64b555555555555555555555',
				quantity: 50,
			}, // Olives
			{
				ingredient: '64b666666666666666666666',
				quantity: 2,
			}, // Olive oil
			{
				ingredient: '64b777777777777777777777',
				quantity: 1,
			}, // Oregano
		],
		instructions: [
			'Chop tomatoes, cucumber, and red onion.',
			'Combine in a bowl with olives and crumbled feta.',
			'Drizzle with olive oil and sprinkle with oregano.',
			'Toss gently and serve chilled.',
		],
		categories: ['salad', 'vegetarian'],
		servings: 2,
		prepTime: 10,
		utensils: ['Knife', 'Bowl'],
	},
	{
		title: 'Pancakes',
		ingredients: [
			{
				ingredient: '64c111111111111111111111',
				quantity: 150,
			}, // Flour
			{
				ingredient: '64c222222222222222222222',
				quantity: 250,
			}, // Milk
			{
				ingredient: '64c333333333333333333333',
				quantity: 2,
			}, // Eggs
			{
				ingredient: '64c444444444444444444444',
				quantity: 2,
			}, // Sugar
			{
				ingredient: '64c555555555555555555555',
				quantity: 1,
			}, // Baking powder
			{
				ingredient: '64c666666666666666666666',
				quantity: 0.5,
			}, // Salt
			{
				ingredient: '64c777777777777777777777',
				quantity: 1,
			}, // Butter
		],
		instructions: [
			'In a bowl, mix flour, sugar, baking powder, and salt.',
			'Whisk in milk and eggs until smooth.',
			'Heat butter in a skillet over medium heat.',
			'Pour batter to form pancakes and cook until bubbles form.',
			'Flip and cook the other side until golden.',
			'Serve with syrup or toppings of choice.',
		],
		categories: ['breakfast', 'dessert'],
		servings: 4,
		prepTime: 25,
		utensils: ['Bowl', 'Whisk', 'Pan'],
	},
	{
		title: 'Spanish omelette',
		ingredients: [
			{
				ingredient: '64c333333333333333333333',
				quantity: 6,
			},
			{
				ingredient: '64d222222222222222222222',
				quantity: 300,
			}, // Cucumber
			{
				ingredient: '64a333333333333333333333',
				quantity: 10,
			},
		],
		instructions: [
			'Chop potatoes.',
			'Fry potatoes on low heat.',
			'Reserve potatoes.',
			'Mixed with eggs',
			'2 minutes per side on the pan',
		],
		categories: ['mediterranean', 'high-protein'],
		servings: 2,
		prepTime: 10,
		utensils: ['Knife', 'Bowl', 'Pan'],
	},
	{
		title: 'Avocado Toast',
		ingredients: [
			{ ingredient: '650111111111111111111111', quantity: 1 }, // Avocado
			{ ingredient: '652222222222222222222222', quantity: 2 }, // Bread
			{ ingredient: '650666666666666666666666', quantity: 1 }, // Lemon
		],
		instructions: [
			'Toast the bread',
			'Mash avocado and season with lemon',
			'Spread and serve',
		],
		categories: ['breakfast', 'quick-meals'],
		servings: 1,
		prepTime: 10,
		utensils: ['Toaster', 'Knife'],
	},
	{
		title: 'Chicken Stir Fry',
		ingredients: [
			{ ingredient: '650333333333333333333333', quantity: 300 }, // Chicken
			{ ingredient: '651666666666666666666666', quantity: 2 }, // Bell pepper
			{ ingredient: '651222222222222222222222', quantity: 150 }, // Mushrooms
			{ ingredient: '650999999999999999999999', quantity: 30 }, // Soy sauce
		],
		instructions: [
			'Slice chicken and veggies',
			'Stir fry in hot pan',
			'Add soy sauce and serve with rice',
		],
		categories: ['main', 'quick-meals'],
		servings: 3,
		prepTime: 25,
		utensils: ['Wok', 'Knife'],
	},
	{
		title: 'Mushroom Risotto',
		ingredients: [
			{ ingredient: '651111111111111111111111', quantity: 300 }, // Rice
			{ ingredient: '651222222222222222222222', quantity: 200 }, // Mushrooms
			{ ingredient: '651999999999999999999999', quantity: 200 }, // Yogurt (used as creamy)
			{ ingredient: '652111111111111111111111', quantity: 50 }, // Parmesan
		],
		instructions: [
			'Sauté mushrooms',
			'Cook rice with broth',
			'Stir in yogurt and parmesan',
		],
		categories: ['main', 'vegetarian'],
		servings: 4,
		prepTime: 40,
		utensils: ['Pan', 'Spoon'],
	},
	{
		title: 'Chickpea Salad',
		ingredients: [
			{ ingredient: '64c333333333333333333331', quantity: 200 }, // Chickpeas
			{ ingredient: '64b111111111111111111111', quantity: 2 }, // Tomatoes
			{ ingredient: '650888888888888888888888', quantity: 2 }, // Cilantro
			{ ingredient: '650666666666666666666666', quantity: 1 }, // Lemon
		],
		instructions: ['Mix all ingredients', 'Season and serve chilled'],
		categories: ['salad', 'vegan'],
		servings: 2,
		prepTime: 10,
		utensils: ['Bowl', 'Spoon'],
	},
	{
		title: 'Garlic Butter Shrimp',
		ingredients: [
			{ ingredient: '653111111111111111111111', quantity: 300 }, // Shrimp
			{ ingredient: '64a222222222222222222222', quantity: 4 }, // Garlic
			{ ingredient: '64c777777777777777777777', quantity: 2 }, // Butter
		],
		instructions: [
			'Melt butter in pan',
			'Add garlic and shrimp, cook until pink',
			'Season with salt and pepper and serve',
		],
		categories: ['main', 'seafood'],
		servings: 2,
		prepTime: 15,
		utensils: ['Pan', 'Spatula'],
	},
	{
		title: 'Cinnamon Pancakes',
		ingredients: [
			{ ingredient: '64c111111111111111111111', quantity: 150 }, // Flour
			{ ingredient: '64c222222222222222222222', quantity: 250 }, // Milk
			{ ingredient: '64c333333333333333333333', quantity: 2 }, // Eggs
			{ ingredient: '653333333333333333333333', quantity: 1 }, // Cinnamon
			{ ingredient: '64c444444444444444444444', quantity: 2 }, // Sugar
		],
		instructions: [
			'Mix dry ingredients',
			'Add milk and eggs',
			'Cook in pan until golden',
		],
		categories: ['breakfast', 'dessert'],
		servings: 4,
		prepTime: 20,
		utensils: ['Bowl', 'Whisk', 'Pan'],
	},
	{
		title: 'Lemon Dill Salmon',
		ingredients: [
			{ ingredient: '650666666666666666666666', quantity: 1 }, // Lemon
			{ ingredient: '653222222222222222222222', quantity: 1 }, // Dill
			{ ingredient: '650333333333333333333333', quantity: 200 }, // Chicken used as placeholder for fish in seed
		],
		instructions: [
			'Season protein with lemon and dill',
			'Bake or pan-fry to desired doneness',
			'Serve with veggies',
		],
		categories: ['main', 'mediterranean'],
		servings: 2,
		prepTime: 25,
		utensils: ['Oven', 'Baking tray'],
	},
];
