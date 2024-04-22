<script lang="ts">
	import Ingredient from './ingredient.svelte';
	import type { DrinkType } from '../../types';

	export let data;

	let drinkState: DrinkType = data.props;
	$: cardData = {
		handCards: [1, 2, 3],
		fieldCards: []
	};

	const handleOnClick2 = async () => {
		const result = await (await fetch(`/api/`)).json();
		drinkState = result;
	};

	let draggingCardPosition = null;
	const dragHandCard = (e: DragEvent) => {
		draggingCardPosition = (e.target as HTMLElement).getAttribute('id');
	};
	const dropHandCard = (e: DragEvent) => {
		const trimed = cardData.handCards.splice(parseInt(draggingCardPosition) - 1, 1);
		cardData.fieldCards.push(trimed[0]);
		cardData = cardData;
	};
	const dragOver = (e: DragEvent) => {
		e.preventDefault();
	};
	let isDraggingOverAssigned = false;
	const dragEnterHandCard = (e: DragEvent) => {
		isDraggingOverAssigned = true;
	};
	const dragLeaveHandCard = (e: DragEvent) => {
		isDraggingOverAssigned = false;
	};
</script>

<div class="wrapper">
	<button on:click={data.funcPlayerMatching}>AppSync Test</button>
	<button on:click={handleOnClick2}>Get a drink</button>
	<button on:click={data.funcSignInWallet}>Login Wallet</button>
	<h2>{drinkState.name}</h2>
	<img class="drink-thumb" src={drinkState.thumbUrl} alt="drink thuumb" />
	<div class="container">
		<div id="left">
			<div class="hand_list">
				{#each cardData.handCards as card_id, index}
					<img
						on:dragstart={dragHandCard}
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
			on:dragover={dragOver}
			on:drop={dropHandCard}
			on:dragenter={dragEnterHandCard}
			on:dragleave={dragLeaveHandCard}
			id="right"
			class:ring={isDraggingOverAssigned}
		>
			{#each cardData.fieldCards as card_id}
				<img class="card-thumb" src="/image/unit/card_{card_id}.jpeg" alt="drink thuumb" />
			{/each}
		</div>
	</div>

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
</style>
