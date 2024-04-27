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
		<button
			on:click={() => {
				location.href = './';
			}}>Go back</button
		>
		{#if data.walletUser?.addr}
			<img
				class="menu-button"
				on:click={data.sortUserDeck}
				src="/image/button/sort.png"
				alt="activate"
			/>
			<img
				on:click={data.funcSaveDeck}
				class="menu-button"
				src="/image/button/save.png"
				alt="activate"
			/>
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
		{#if data.drinkState}
			<div class="drink-area">
				<h3>{data.drinkState.name}</h3>
				<img class="drink-thumb" src={data.drinkState.thumbUrl} alt="drink thuumb" />
				<p class="drink-instruction">
					{data.drinkState.instructions.length <= 350
						? data.drinkState.instructions
						: data.drinkState.instructions.slice(0, 350) + '...'}
				</p>
			</div>
		{/if}
		<div class="drop-area">
			<div
				on:dragover={data.dragOver}
				on:drop={data.dropFromCardList}
				on:dragenter={data.dragEnterFromCardList}
				on:dragleave={data.dragLeaveFromCardList}
				id="right"
				class:ring={data.isDraggingOverFromCardList}
			>
				{#each data.userDeck as card_id, index}
					{#if parseInt(card_id) <= 16}
						<img
							on:dragstart={data.dragFromUserDeck}
							on:click={data.showCardInfo}
							in:slide
							id={card_id.toString()}
							class="card-thumb"
							src="/image/unit/card_{card_id}.jpeg"
							alt="drink thuumb"
							draggable="true"
						/>
					{:else}
						<img
							on:dragstart={data.dragFromUserDeck}
							on:click={data.showCardInfo}
							in:slide
							id={card_id.toString()}
							class="card-thumb"
							src="/image/trigger/card_{card_id}.jpeg"
							alt="drink thuumb"
							draggable="true"
						/>
					{/if}
				{/each}
			</div>
		</div>
	</div>
	<div class="bottom_container">
		<div class="info-area">
			{#if data.selectedCard}
				<div class="image-area">
					{#if parseInt(data.selectedCard.card_id) <= 16}
						<img src="/image/unit/card_{data.selectedCard.card_id}.jpeg" alt="card" />
					{:else}
						<img src="/image/trigger/card_{data.selectedCard.card_id}.jpeg" alt="card" />
					{/if}
					<div>
						<div>{data.selectedCard?.name}</div>
						{#if data.selectedCard.type == '0'}
							<div class="cost red">{data.selectedCard.cost}</div>
						{:else}
							<div class="cost yellow">{data.selectedCard.cost}</div>
						{/if}
					</div>
				</div>
				<div class="data-area">
					<div>[BP: {data.selectedCard.bp}]</div>
					<div class="skill-description">{data.selectedCard.skill?.description}</div>
				</div>
			{/if}
		</div>
		<div
			on:dragover={data.dragOver}
			on:drop={data.dropFromUserDeck}
			on:dragenter={data.dragEnterFromUserDeck}
			on:dragleave={data.dragLeaveFromUserDeck}
			class:ring={data.isDraggingOverFromUserDeck}
			id="left"
		>
			<div class="card_list">
				{#each data.reserveCardData as card_id, index}
					{#if parseInt(card_id) <= 16}
						<img
							on:dragstart={data.dragFromCardList}
							on:click={data.showCardInfo}
							out:scale
							id={card_id.toString()}
							class="card-thumb"
							src="/image/unit/card_{card_id}.jpeg"
							alt="card"
							draggable="true"
						/>
					{:else}
						<img
							on:dragstart={data.dragFromCardList}
							on:click={data.showCardInfo}
							out:scale
							id={card_id.toString()}
							class="card-thumb"
							src="/image/trigger/card_{card_id}.jpeg"
							alt="card"
							draggable="true"
						/>
					{/if}
				{/each}
			</div>
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

	.drop-area {
		width: 90vw;
	}

	.drop-area img {
		cursor: grab;
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

	.button_container img.menu-button {
		width: 70px;
	}

	.card-thumb {
		width: 90px;
		border-radius: 1rem;
	}

	p {
		text-align: center;
	}

	.bottom_container {
		width: 100vw;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.info-area {
		width: 25vw;
		min-height: 135px;
	}

	.image-area {
		position: relative;
		min-height: 65px;
	}

	.image-area img {
		width: 70%;
		height: 65px;
		padding-left: 63px;
		object-fit: cover;
	}
	.image-area div {
		position: absolute;
		width: 80px;
		height: 22px;
		background-color: black;
		top: 0;
		left: 0;
		padding: 10px;
	}
	.image-area div.cost {
		height: 13px;
		top: 34px;
		padding: 10px;
	}
	.image-area div.red {
		background-color: darkred;
	}
	.image-area div.yellow {
		background-color: gold;
	}
	.data-area {
		min-height: 70px;
		padding: 20px;
		border: 2px dashed #fff;
		font-size: 12px;
	}
	.data-area .skill-description {
		font-size: 10px;
	}
	#left,
	#right {
		margin: 8px 20px;
		border: 2px dashed #fff;
	}
	#left {
		width: 76%;
		height: 130px;
		padding: 15px 10px;
	}
	#right {
		width: 900px;
		height: 390px;
		margin-left: auto;
		margin-right: 5%;
	}
	#left.ring,
	#right.ring {
		border: 2px dashed rgb(58, 19, 231);
	}
	.card_list {
		width: 100%;
		height: 145px;
		overflow-x: scroll;
		white-space: nowrap;
	}
	.card_list img {
		display: inline-block;
		cursor: grab;
	}

	.clock {
		transform: rotate(-90deg);
	}

	.clock > :global(div::before) {
		animation: none !important;
	}
</style>
