<script lang="ts">
	import { fade, scale, slide } from 'svelte/transition';
	import { Clock } from 'svelte-loading-spinners';
	import Ingredient from './Ingredient.svelte';

	export let data;
</script>

<div class="wrapper">
	<button on:click={data.funcPlayerMatching}>AppSync Test</button>
	<button on:click={data.handleOnClick2}>Get a drink</button>
	<button on:click={data.funcSignInWallet}>Login Wallet</button>
	<h2>{data.drinkState.name}</h2>
	<img class="drink-thumb" src={data.drinkState.thumbUrl} alt="drink thuumb" />
	<div class="container">
		<div id="left">
			<div class="hand_list">
				{#each data.cardData.handCards as card_id, index}
					<img
						on:dragstart={data.dragHandCard}
						out:scale
						id={(index + 1).toString()}
						class="card-thumb"
						src="/image/unit/card_{card_id}.jpeg"
						alt="drink thuumb"
						draggable="true"
					/>
				{/each}
			</div>
		</div>
		<div
			on:dragover={data.dragOver}
			on:drop={data.dropHandCard}
			on:dragenter={data.dragEnterHandCard}
			on:dragleave={data.dragLeaveHandCard}
			id="right"
			class:ring={data.isDraggingOverAssigned}
		>
			{#each data.cardData.fieldCards as card_id}
				<img in:slide class="card-thumb" src="/image/unit/card_{card_id}.jpeg" alt="drink thuumb" />
			{/each}
		</div>
	</div>

	<p>{data.drinkState.instructions}</p>

	<p>
		Indigredients
		{#each data.drinkState.ingredients as ingredient}
			<Ingredient {ingredient} />
		{/each}
	</p>
	<div class="clock">
		<Clock size="80" color="#F03E50" unit="px" duration="240s" pause={false} />
	</div>
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

	.container {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	#left,
	#right {
		width: 300px;
		min-height: 400px;
		margin: 20px;
		border: 2px dashed #fff;
	}
	#right.ring {
		border: 2px dashed #f00;
	}

	.hand_list img {
		cursor: grab;
	}

	.clock {
		transform: rotate(-90deg);
	}

	.clock > :global(div::before) {
		animation: none !important;
	}
</style>
