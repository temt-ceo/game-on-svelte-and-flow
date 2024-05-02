<script lang="ts">
	import { scale, slide } from 'svelte/transition';
	import { Jumper } from 'svelte-loading-spinners';

	export let data;
</script>

{#if data.showSpinner}
	<div class="spinner">
		<Jumper size="80" color="#F03E50" unit="px" duration="1s" />
	</div>
{/if}

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
			class="menu-button left-end"
			on:click={() => {
				location.href = './';
			}}>Go back</button
		>
		{#if data.walletUser?.addr}
			<img
				class="menu-button"
				on:click={data.funcResetUserDeck}
				src="/image/button/reset.png"
				alt="activate"
			/>
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
		<div class="drop-area">
			<div
				on:dragover={data.dragOver}
				on:drop={data.dropFromCardList}
				on:dragenter={data.dragEnterFromCardList}
				on:dragleave={data.dragLeaveFromCardList}
				id="deck_field"
				class:ring={data.isDraggingOverFromCardList}
			>
				{#each data.userDeck as card_id, index}
					<img
						on:dragstart={data.dragFromUserDeck}
						on:click={data.showCardInfo}
						in:slide
						id={card_id.toString()}
						class="card-thumb"
						src="/image/card_{card_id}.jpeg"
						alt="drink thuumb"
						draggable="true"
					/>
				{/each}
			</div>
		</div>
	</div>
	<div class="bottom_container">
		<div class="info-area">
			{#if data.selectedCard}
				<div class="image-area">
					<img src="/image/card_{data.selectedCard.card_id}.jpeg" alt="card" />
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
			id="own_cards"
		>
			<div class="card_list">
				{#each data.reserveCardData as card_id, index}
					<img
						on:dragstart={data.dragFromCardList}
						on:click={data.showCardInfo}
						out:scale
						id={card_id.toString()}
						class="card-thumb"
						src="/image/card_{card_id}.jpeg"
						alt="card"
						draggable="true"
					/>
				{/each}
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	@import '../../style/common.scss';
</style>
