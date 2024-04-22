<script lang="ts">
	import Ingredient from './ingredient.svelte';
	import type { DrinkType } from '../../types';

	export let data;

	let drinkState: DrinkType = data.props;

	const handleOnClick2 = async () => {
		const result = await (await fetch(`/api/`)).json();
		drinkState = result;
	};
</script>

<div class="wrapper">
	<button on:click={data.funcPlayerMatching}>AppSync Test</button>
	<button on:click={handleOnClick2}>Get a drink</button>
	<button on:click={data.funcSignInWallet}>Login Wallet</button>
	<h2>{drinkState.name}</h2>
	<img class="drink-thumb" src={drinkState.thumbUrl} alt="drink thuumb" />
	<img class="card-thumb" src="/image/unit/card_1.jpeg" alt="drink thuumb" />
	<p>{drinkState.instructions}</p>

	<p>
		Indigredients
		{#each drinkState.ingredients as ingredient}
			<Ingredient {ingredient} />
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

	.card-thumb {
		width: 100px;
		border-radius: 1rem;
	}

	p {
		max-width: 500px;
		text-align: center;
	}
</style>
