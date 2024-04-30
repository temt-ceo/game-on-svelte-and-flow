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
			Cyber EN: {data.yourInfo['cyber_energy']}
		</div>
		{#if data.gameObject == null}
			<div>
				Score: {data.yourInfo['score']?.length ?? '--'} games {data.yourInfo['win_count'] ?? '--'} win
			</div>
		{/if}
		{#if data.walletUser?.addr}
			{#if data.gameObject == null}
				<img
					class="menu-button logout left-end"
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
					alt="edit deck"
				/>
				<img on:click={data.funcPlayerMatching} src="/image/button/playButton.png" alt="play" />
			{/if}
		{/if}
		{#if !data.walletUser?.addr}
			<img
				class="menu-button activate left-end"
				on:click={data.funcSignInWallet}
				src="/image/button/use.png"
				alt="activate"
			/>
		{/if}
	</div>

	<div class="main_container">
		<div class="info-area">
			{#if data.gameObject != null}
				<div id="opponent_trigger_zone">
					{#each 'A_'.repeat(parseInt(data.gameObject.opponent_trigger_cards)).split('_') as _}
						{#if _ != ''}
							<img
								in:slide
								class="card-thumb opponent-trigger"
								src="/image/button/enemyHand.png"
								alt="drink thuumb"
							/>
						{/if}
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
						<div class="parameter1">CP: {('0' + data.yourCp).slice(-2)}</div>
					</div>
					<div
						id="trigger_zone"
						class:ring={data.isDraggingOverTriggerZone}
						class:ring_ng={data.isDraggingNGOverTriggerZone}
						on:dragover={data.dragOver}
						on:drop={data.dropToTriggerZone}
						on:dragenter={data.dragEnterToTriggerZone}
						on:dragleave={data.dragLeaveToTriggerZone}
					>
						{#each Object.keys(data.triggerCards) as index}
							<img
								in:slide
								on:click={data.showCardInfo}
								id={data.triggerCards[index]}
								class="card-thumb trigger-card"
								src="/image/card_{data.triggerCards[index]}.jpeg"
							/>
						{/each}
					</div>
				</div>
			{/if}
		</div>
		<div class="drop-area">
			{#if data.gameObject != null}
				<div
					id="battle_field"
					class:ring={data.isDraggingOverBattleField}
					class:ring_ng={data.isDraggingNGOverBattleField}
					on:dragover={data.dragOver}
					on:drop={data.dropToBattleField}
					on:dragenter={data.dragEnterToBattleField}
					on:dragleave={data.dragLeaveToBattleField}
				>
					<div>
						{#each [1, 2, 3, 4, 5] as position}
							<div class="opponent_unit">
								{#if parseInt(data.gameObject.opponent_field_unit[position]) >= 1}
									<img
										on:click={data.showCardInfo}
										in:slide
										id={data.gameObject.opponent_field_unit[position]}
										class="card-thumb field-card"
										src="/image/card_{data.gameObject.opponent_field_unit[position]}.jpeg"
										alt="Opponent's field unit"
									/>
									<img class="status" src="/image/status.png" alt="card" />
									<div class="status_name">
										{data.cardInfo[data.gameObject.opponent_field_unit[position]]?.name ??
											'loading...'}
									</div>
									<div class="status_bp">
										{data.cardInfo[data.gameObject.opponent_field_unit[position]]?.bp ??
											'loading...'}
									</div>
									<div class="status_sword">
										{#if data.gameObject.opponent_field_unit_action[position] == '2'}
											🗡️
										{/if}
									</div>
									<div class="status_shield">
										{#if data.gameObject.opponent_field_unit_action[position] == '1' || data.gameObject.opponent_field_unit_action[position] == '2'}
											🛡️
										{/if}
									</div>
									{#if data.waitPlayerChoice}
										{#if data.selectTargetType == data.CardNeedsSelectTarget || (data.selectTargetType == data.CardNeedsSelectActedTarget && data.gameObject.opponent_field_unit_action[position] == data.ActedUp)}
											<img
												in:slide
												on:click={() => {
													data.skillTargetUnitPos = position;
												}}
												class="target-select"
												src="/image/button/select.png"
											/>
										{/if}
									{/if}
								{:else}
									<div class="field-no-card"></div>
								{/if}
							</div>
						{/each}
					</div>
					<div class="battle-space"></div>
					<div>
						{#each [1, 2, 3, 4, 5] as position}
							<div class="your_unit">
								{#if parseInt(data.fieldCards[position]) >= 1}
									<img
										on:click={data.showCardInfo}
										in:slide
										id={data.fieldCards[position]}
										class="card-thumb field-card"
										src="/image/card_{data.fieldCards[position]}.jpeg"
										alt="Your field unit"
									/>
									<img class="status" src="/image/status.png" alt="card" />
									<div class="status_name">
										{data.cardInfo[data.gameObject.your_field_unit[position]]?.name ?? 'loading...'}
									</div>
									<div class="status_bp">
										{data.cardInfo[data.gameObject.your_field_unit[position]]?.bp ?? 'loading...'}
									</div>
									<div class="status_sword">
										{#if data.gameObject.your_field_unit_action[position] == '2'}
											🗡️
										{/if}
									</div>
									<div class="status_shield">
										{#if data.gameObject.your_field_unit_action[position] == '1' || data.gameObject.your_field_unit_action[position] == '2'}
											🛡️
										{/if}
									</div>
								{:else}
									<div class="field-no-card"></div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
				<div class="info">
					<div class="round_text">Round {data.gameObject['turn']}</div>
					<div class="turn_text">
						{data.gameObject['is_first'] ? 'First Turn' : 'Second Turn'}
						({data.gameObject['is_first'] == data.gameObject['is_first_turn']
							? 'Your Turn'
							: 'Opponent Turn'})
					</div>
				</div>
			{/if}
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
					{#if parseInt(data.selectedCard.bp) > 0}
						<div>[BP: {data.selectedCard.bp}]</div>
					{/if}
					<div class="skill-description">{data.selectedCard.skill?.description}</div>
				</div>
			{/if}
		</div>
		<div id="hand_cards">
			<div class="card_list">
				{#each data.handCards as card_id, index}
					<img
						on:dragstart={data.dragFromHand}
						on:click={data.showHandCardInfo}
						out:scale
						id={index.toString()}
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
			<div>
				<div class="clock">
					<Clock size="80" color="#F03E50" unit="px" duration="300s" pause={false} />
				</div>
				<img
					class="turn-end-btn"
					on:click={data.funcTurnEnd}
					src="/image/button/turnChangeEn.png"
					alt="Redo"
				/>
			</div>
		{/if}
		{#if data.gameObject && data.gameObject['is_first'] != data.gameObject['is_first_turn']}
			<div class="opponent_clock">
				<Clock size="80" color="#F03E50" unit="px" duration="300s" pause={false} />
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	@import '../style/common.scss';
</style>
