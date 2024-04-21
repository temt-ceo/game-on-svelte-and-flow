<script lang="ts">
	import type { DrinkType } from '../../types';
	import * as fcl from '@onflow/fcl';
	import * as types from '@onflow/types';
	import { onCreateGameServerProcess } from '../../graphql/subscriptions';
	import { createGameServerProcess } from '../../graphql/mutations';
	import { Amplify } from 'aws-amplify';
	import { generateClient } from 'aws-amplify/api';
	import awsconfig from '../../amplifyconfiguration.json';

	Amplify.configure(awsconfig);
	const client = generateClient();
	client.graphql({ query: onCreateGameServerProcess }).subscribe({
		next: (gameProcess) => {
			console.log(gameProcess);
		}
	});

	const handleOnClick = async () => {
		client.graphql({
			query: createGameServerProcess,
			variables: { input: { type: 'player_matching', message: '', playerId: '1' } }
		});
	};

	fcl.config({
		'accessNode.api': 'https://rest-testnet.onflow.org',
		'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
		'app.detail.title': 'Sample App',
		'app.detail.icon': 'https://fcl-discovery.onflow.org/images/blocto.png',
		'0xCOF': '0x9e447fb949c3f1b6' // The account address where the smart contract lives
	});

	export let data;

	let drinkState: DrinkType = data.props;

	const handleOnClick2 = async () => {
		const result = await (await fetch(`/api/`)).json();
		drinkState = result;
		fcl.authenticate();
	};
</script>

<div class="wrapper">
	<button on:click={handleOnClick}>AppSync Test</button>
	<button on:click={handleOnClick2}>Login Wallet</button>
	<h2>{drinkState.name}</h2>
	<img class="drink-thumb" src={drinkState.thumbUrl} alt="drink thuumb" />
	<p>{drinkState.instructions}</p>

	<p>
		Indigredients
		{#each drinkState.ingredients as ingredient}
			<p class="ingredient">
				{ingredient.amount}{ingredient.name}
			</p>
		{/each}
	</p>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-family: Arial, Helvetica, sans-serif;
	}

	.drink-thumb {
		width: 300px;
		border-radius: 1rem;
	}

	p {
		max-width: 500px;
		text-align: center;
	}

	.ingredient {
		margin: 2px 0;
	}
</style>
