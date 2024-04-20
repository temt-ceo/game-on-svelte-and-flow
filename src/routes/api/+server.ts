import type { DrinkType, IngredientType } from '../../types';

export async function GET() {
	const result: any = await (
		await fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php')
	).json();

	const ingredients: any = [...Array(15)]
		.map((_value, i) => ({
			name: result.drinks[0][`strIngredient${i + 1}`],
			amount: result.drinks[0][`strMeasure${i + 1}`]
		}))
		.filter((ingredient) => ingredient.name);

	const drinkProp: DrinkType = {
		name: result.drinks[0].strDrink,
		instructions: result.drinks[0].strInstructions,
		ingredients,
		thumbUrl: result.drinks[0].strDrinkThumb
	};

	return new Response(JSON.stringify(drinkProp));
}
