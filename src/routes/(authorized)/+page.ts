import type { DrinkType } from '../../types';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import config from '../../config.json';

/** @type {import('./$types').Load} */
export async function load({ fetch }) {
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

	Amplify.configure(config);
	const client = generateClient();

	return {
		props: drinkProp,
		client: client,
		walletUser: null,
		funcPlayerMatching: null,
		funcSignInWallet: null
	};
}
