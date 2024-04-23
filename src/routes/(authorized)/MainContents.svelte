<script lang="ts">
	import { fade, scale, slide } from 'svelte/transition';
	import { Clock } from 'svelte-loading-spinners';
	import Ingredient from './ingredient.svelte';

	export let data;
</script>

<div class="wrapper">
	Hello,
	{#if data.player?.playerName}
		{data.player?.playerName}. You can choose to edit your deck first or play the game directly.
	{:else if data.walletUser?.addr}
		your wallet address is {data.walletUser?.addr}.
	{:else}
		do you wanna play a blockchain game, COF Ninja? If so, let's press the activate button!
	{/if}
	<div class="button_container">
		<button on:click={data.handleOnGetADrink}>Get a drink</button>
		{#if data.walletUser?.addr}
			<img
				class="menu-button logout"
				on:click={data.funcSignOutWallet}
				src="/image/button/logout.png"
				alt="activate"
			/>
			<img
				class="menu-button edit-deck"
				on:click={() => {
					location.href = './deck-editor';
				}}
				src="/image/button/editDeck.png"
				alt="activate"
			/>
			<img on:click={data.funcSignInWallet} src="/image/button/playButton.png" alt="activate" />
		{/if}
		{#if !data.walletUser?.addr}
			<img
				class="menu-button"
				on:click={data.funcSignInWallet}
				src="/image/button/use.png"
				alt="activate"
			/>
		{/if}
	</div>

	<div class="main_container">
		<div class="info-area"></div>
		<div class="drop-area"></div>
		{#if data.drinkState}
			<div class="drink-area">
				<h3>{data.drinkState.name}</h3>
				<img class="drink-thumb" src={data.drinkState.thumbUrl} alt="drink thuumb" />
				<p class="drink-instruction">
					{data.drinkState.instructions.length <= 350
						? data.drinkState.instructions
						: data.drinkState.instructions.slice(0, 350) + '...'}
				</p>
				<!-- <p>
				Indigredients
				{#each data.drinkState.ingredients as ingredient}
					<Ingredient {ingredient} />
				{/each}
			</p> -->
			</div>
		{/if}
	</div>
	<div class="bottom_container">
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
		<div class="clock">
			<Clock size="80" color="#F03E50" unit="px" duration="240s" pause={false} />
		</div>
	</div>
</div>

<style>
	.wrapper {
		width: 100vw;
		display: flex;
		flex-direction: column;
		align-items: center;
		font-family: Arial, Helvetica, sans-serif;
	}

	.button_container {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 0 20px 0 auto;
	}

	.button_container img {
		margin-left: 15px;
		cursor: pointer;
	}

	.main_container {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.info-area {
		width: 45vw;
	}

	.drop-area {
		width: 45vw;
	}

	.drink-area {
		width: 10vw;
	}

	.drink-thumb {
		width: 100px;
		border-radius: 1rem;
	}

	.drink-instruction {
		font-size: 9px;
	}

	.button_container img {
		width: 100px;
	}

	.button_container img.logout {
		width: 60px;
	}
	.button_container img.edit-deck {
		width: 65px;
	}

	.card-thumb {
		width: 100px;
		border-radius: 1rem;
	}

	p {
		text-align: center;
	}

	.bottom_container {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	#left,
	#right {
		width: 300px;
		min-height: 200px;
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
