<script lang="ts">
	import { scale, slide } from 'svelte/transition';
	import { Clock, Jumper } from 'svelte-loading-spinners';

	export let data;
</script>

{#if data.showSpinner}
	<div class="spinner">
		<Jumper size="80" color="#F03E50" unit="px" duration="1.1s" />
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
		<button class="menu-button left-end" on:click={data.handleOnGetADrink}>Get a drink</button>
		{#if data.walletUser?.addr}
			<img
				class="menu-button logout"
				on:click={data.funcSignOutWallet}
				src="/image/button/logout.png"
				alt="activate"
			/>
			{#if data.gameObject == null}
				<img
					class="menu-button edit-deck"
					on:click={() => {
						location.href = './deck-editor';
					}}
					src="/image/button/editDeck.png"
					alt="edit deck"
				/>
				<img on:click={data.funcPlayerMatching} src="/image/button/playButton.png" alt="play" />
			{/if}
		{/if}
		{#if !data.walletUser?.addr}
			<img
				class="menu-button activate"
				on:click={data.funcSignInWallet}
				src="/image/button/use.png"
				alt="activate"
			/>
		{/if}
	</div>

	<div class="main_container">
		<div class="info-area">
			{#if data.gameObject != null}
				<div id="opponent_trigger_field" class:ring={data.isDraggingOverFromCardList}>
					{#each Object.keys(data.gameObject.your_trigger_cards) as card_id, index}
						<img
							in:slide
							id={card_id.toString()}
							class="card-thumb"
							src="/image/card_{card_id}.jpeg"
							alt="drink thuumb"
							draggable="true"
						/>
					{/each}
				</div>
				<div>
					Opponent: {data.opponentInfo.player_name}
					<span class="score">
						Score: {`${data.opponentInfo['score']?.length} games ${data.opponentInfo['win_count']} win`}
					</span>
				</div>
				<div class="parameter1">LIFE: {data.gameObject.opponent_life}</div>
				<div class="parameter1">CP: {('0' + data.gameObject.opponent_cp).slice(-2)}</div>
				<div class="opponent">
					You: {data.yourInfo.player_name}
					<span class="score">
						Score: {`${data.yourInfo['score']?.length} games ${data.yourInfo['win_count']} win`}
					</span>
				</div>
				<div class="your_info">
					<div>
						<div class="parameter1">LIFE: {data.gameObject.your_life}</div>
						<div class="parameter1">CP: {('0' + data.gameObject.your_cp).slice(-2)}</div>
					</div>
					<div
						on:dragover={data.dragOver}
						on:drop={data.dropFromCardList}
						on:dragenter={data.dragEnterFromCardList}
						on:dragleave={data.dragLeaveFromCardList}
						id="trigger_field"
						class:ring={data.isDraggingOverFromCardList}
					>
						{#each Object.keys(data.gameObject.your_trigger_cards) as card_id, index}
							<img
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
			{/if}
		</div>
		<div class="drop-area">
			<div
				id="battle_field"
				class:ring={data.isDraggingOverFromCardList}
				on:dragover={data.dragOver}
				on:drop={data.dropFromCardList}
				on:dragenter={data.dragEnterFromCardList}
				on:dragleave={data.dragLeaveFromCardList}
			>
				{#if data.gameObject != null}
					<div class="opponent_unit">
						{#each Object.keys(data.gameObject.your_field_unit) as index}
							<img
								on:click={data.showCardInfo}
								in:slide
								id={data.gameObject.your_field_unit[index]}
								class="card-thumb"
								src="/image/card_{data.gameObject.your_field_unit[index]}.jpeg"
								alt="drink thuumb"
								draggable="true"
							/>
						{/each}
					</div>
					<div></div>
					<div class="your_unit">
						{#each Object.keys(data.gameObject.your_field_unit) as index}
							<img
								on:click={data.showCardInfo}
								in:slide
								id={data.gameObject.your_field_unit[index]}
								class="card-thumb"
								src="/image/card_{data.gameObject.your_field_unit[index]}.jpeg"
								alt="drink thuumb"
								draggable="true"
							/>
						{/each}
					</div>
				{/if}
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
		<div id="own_cards">
			<div class="card_list">
				{#each data.handCards as card_id, index}
					<img
						on:dragstart={data.dragFromCardList}
						on:click={data.showHandCardInfo}
						out:scale
						id={(index + 1).toString()}
						class="card-thumb"
						src="/image/card_{card_id}.jpeg"
						alt="card"
						draggable="true"
					/>
				{/each}
				{#if data.canMarigan}
					<img
						class="menu-button marigan-btn"
						on:click={data.retryMarigan}
						src="/image/button/redo.png"
						alt="Redo"
					/>
					<div class="marigan-clock">
						<Clock size="100" color="#F03EFF" unit="px" duration="20s" pause={false} />
					</div>
				{/if}
			</div>
		</div>
		{#if data.gameObject && data.gameObject['is_first'] == data.gameObject['is_first_turn']}
			<div class="clock">
				<Clock size="80" color="#F03E50" unit="px" duration="240s" pause={false} />
			</div>
		{/if}
		{#if data.gameObject && data.gameObject['is_first'] != data.gameObject['is_first_turn']}
			<div class="opponent_clock">
				<Clock size="80" color="#F03E50" unit="px" duration="240s" pause={false} />
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	@import '../style/common.scss';

	#own_cards,
	#battle_field,
	#trigger_field {
		margin: 8px 20px;
		border: 2px dashed #fff;
	}

	#own_cards {
		width: 60%;
		height: 120px;
		padding: 15px 10px;

		&.ring {
			border: 2px dashed rgb(58, 19, 231);
		}

		img {
			margin-right: 5px;
		}
	}

	#battle_field {
		width: 550px;
		height: 355px;
		margin-left: 6vw;
		margin-bottom: 40px;

		&.ring {
			border: 2px dashed rgb(58, 19, 231);
		}
		.opponent_unit,
		.your_unit {
			height: 120px;
		}
	}

	#trigger_field {
		min-width: 330px;
		height: 120px;
		background-image: url('/image/trigger.png');
		margin-left: auto;
		margin-right: 5%;

		&.ring {
			border: 2px dashed rgb(58, 19, 231);
		}
	}

	#opponent_trigger_field {
		width: 132px;
		height: 48px;
		background-image: url('/image/trigger.png');
		background-size: contain;
		margin-left: auto;
		margin-right: 5%;
	}
</style>
