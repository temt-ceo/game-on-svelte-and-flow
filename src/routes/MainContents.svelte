<script lang="ts">
	import { scale, slide } from 'svelte/transition';
	import { Clock } from 'svelte-loading-spinners';

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
		<div>
			Balance: {data.yourInfo['balance']?.substring(0, 5) ?? '--'}
			<span class="unit">Digital Currency</span>
		</div>
		<div>
			EN: {data.yourInfo['cyber_energy']}
		</div>
		<div>
			Score: {data.yourInfo['score']?.length ?? '--'} games {data.yourInfo['win_count'] ?? '--'} win
		</div>
		<button class="left-end" on:click={data.handleOnGetADrink}>Get a drink</button>
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
		<div class="clock">
			<Clock size="80" color="#F03E50" unit="px" duration="240s" pause={false} />
		</div>
	</div>
</div>

<style lang="scss">
	@import '../style/common.scss';

	#own_cards,
	#deck_field {
		margin: 8px 20px;
		border: 2px dashed #fff;
	}

	#own_cards {
		width: 56%;
		height: 130px;
		padding: 15px 10px;

		&.ring {
			border: 2px dashed rgb(58, 19, 231);
		}
	}

	#deck_field {
		width: 900px;
		height: 390px;
		margin-left: auto;
		margin-right: 5%;

		&.ring {
			border: 2px dashed rgb(58, 19, 231);
		}
	}

	.clock {
		margin-right: 10px;
		transform: rotate(-90deg);

		> :global(div::before) {
			animation: none !important;
		}
	}
</style>
