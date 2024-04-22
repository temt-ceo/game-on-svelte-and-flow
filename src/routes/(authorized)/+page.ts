import type { DrinkType, IngredientType } from '../../types';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import awsconfig from '../../amplifyconfiguration.json';
import { createGameServerProcess } from '../../graphql/mutations';
import * as fcl from '@onflow/fcl';
import * as types from '@onflow/types';

fcl.config({
	'accessNode.api': 'https://rest-testnet.onflow.org',
	'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
	'app.detail.title': 'Sample App',
	'app.detail.icon': 'https://fcl-discovery.onflow.org/images/blocto.png',
	'0xCOF': '0x9e447fb949c3f1b6' // The account address where the smart contract lives
});

/** @type {import('./$types').Load} */
export async function load({ fetch }) {
	try {
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

		Amplify.configure(awsconfig);
		const client = generateClient();

		const funcPlayerMatching = async () => {
			client.graphql({
				query: createGameServerProcess,
				variables: { input: { type: 'player_matching', message: '', playerId: '1' } }
			});
		};

		const funcSignInWallet = async () => {
			fcl.authenticate();
		};

		return {
			props: drinkProp,
			fcl: fcl,
			client: client,
			walletUser: null,
			funcPlayerMatching: funcPlayerMatching,
			funcSignInWallet: funcSignInWallet
		};
	} catch (e) {}
}
