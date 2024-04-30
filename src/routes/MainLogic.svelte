<script lang="ts">
	import { Clock } from 'svelte-loading-spinners';
	import MainContents from './MainContents.svelte';
	import { onCreateGameServerProcess } from '../graphql/subscriptions';
	import { ToastContainer, FlatToast } from 'svelte-toasts';

	export let data;
	let countdown = false;

	data.draggingCardId = null;
	data.isDraggingOverBattleField = false;
	data.isDraggingNGOverBattleField = false;
	data.isDraggingOverTriggerZone = false;
	data.isDraggingNGOverTriggerZone = false;
	data.reserveCardData = [];

	// click event handler
	data.showHandCardInfo = (e: Event) => {
		const index = parseInt((e.target as HTMLElement).getAttribute('id'));
		const card_id = data.handCards[index];
		data.selectedCard = data.cardInfo[card_id];
	};
	data.showCardInfo = (e: Event) => {
		const card_id = parseInt((e.target as HTMLElement).getAttribute('id'));
		data.selectedCard = data.cardInfo[card_id];
	};

	// drag & drop event handler
	data.dragFromHand = (e: DragEvent) => {
		data.draggingCardIndex = parseInt((e.target as HTMLElement).getAttribute('id'));
		data.draggingCardId = data.handCards[data.draggingCardIndex];
		data.selectedCard = data.cardInfo[data.draggingCardId];
	};
	data.dropToBattleField = (e: DragEvent) => {
		// PUT CARD ON THE BATTLE FIELD
		if (
			parseInt(data.draggingCardId) <= 16 &&
			Object.keys(data.fieldCards).length < 5 &&
			data.gameObject['is_first'] == data.gameObject['is_first_turn'] &&
			parseInt(data.selectedCard.cost) < data.yourCp
		) {
			const targetCard = data.handCards.splice(data.draggingCardIndex, 1);
			for (const pos of [1, 2, 3, 4, 5]) {
				if (!data.triggerCards[pos]) {
					data.fieldCards[pos] = targetCard[0];
					break;
				}
			}
			data.yourCp -= parseInt(data.selectedCard.cost);
			data.isDraggingOverBattleField = false;
			data.funcPutCardOnTheField();
		}
		if (data.isDraggingNGOverBattleField) {
			data.isDraggingNGOverBattleField = false;
		}
	};
	data.dropToTriggerZone = (e: DragEvent) => {
		// PUT CARD ON THE TRIGGER ZONE
		if (
			parseInt(data.draggingCardId) > 16 &&
			Object.keys(data.triggerCards).length < 4 &&
			data.gameObject['is_first'] == data.gameObject['is_first_turn']
		) {
			const targetCard = data.handCards.splice(data.draggingCardIndex, 1);
			for (const pos of [1, 2, 3, 4]) {
				if (!data.triggerCards[pos]) {
					data.triggerCards[pos] = targetCard[0];
					break;
				}
			}
			data.isDraggingOverTriggerZone = false;
		}
		if (data.isDraggingNGOverBattleField) {
			data.isDraggingNGOverTriggerZone = false;
		}
	};
	data.dragEnterToBattleField = (e: DragEvent) => {
		if (
			parseInt(data.draggingCardId) <= 16 &&
			Object.keys(data.fieldCards).length < 5 &&
			parseInt(data.selectedCard.cost) < data.yourCp &&
			data.gameObject['is_first'] == data.gameObject['is_first_turn']
		) {
			data.isDraggingOverBattleField = true;
		} else {
			data.isDraggingNGOverBattleField = true;
		}
	};
	data.dragEnterToTriggerZone = (e: DragEvent) => {
		if (
			parseInt(data.draggingCardId) > 16 &&
			Object.keys(data.triggerCards).length < 4 &&
			data.gameObject['is_first'] == data.gameObject['is_first_turn']
		) {
			data.isDraggingOverTriggerZone = true;
		} else {
			data.isDraggingNGOverTriggerZone = true;
		}
	};
	data.dragLeaveToBattleField = (e: DragEvent) => {
		data.isDraggingOverBattleField = false;
		data.isDraggingNGOverBattleField = false;
	};
	data.dragLeaveToTriggerZone = (e: DragEvent) => {
		data.isDraggingOverTriggerZone = false;
		data.isDraggingNGOverTriggerZone = false;
	};
	data.dragOver = (e: DragEvent) => {
		e.preventDefault();
	};

	// button function
	data.retryMarigan = () => {
		data.mariganClickCount++;
		if (data.mariganClickCount < 5) {
			data.handCards = data.mariganCards[data.mariganClickCount];
		}
	};

	/** GraphQL Subscribition part */
	data.client.graphql({ query: onCreateGameServerProcess }).subscribe({
		next: (gameProcess) => {
			const retSubscription = gameProcess.data?.onCreateGameServerProcess;
			console.log(retSubscription);
			switch (retSubscription.type) {
				case 'player_matching':
					if (data.player.playerId == retSubscription.playerId) {
						data.countdown = true;
						setTimeout(() => {
							data.countdown = false;
						}, 66000);
						data.showToast(
							'Success!',
							`You successfully entered in Alcana. Now matching is started.`,
							'success'
						);
					} else {
						data.showToast(
							'Warning!!',
							`No. ${retSubscription.playerId} has entered in Alcana.`,
							'warning'
						);
					}
					break;
				case 'game_start':
					if (data.player.playerId == data.player?.playerId) {
						data.showToast(
							'Your first cards are sent to blockchain. Please wait.',
							'Please wait a moment while loading the data.',
							'success'
						);
					} else if (data.player.playerId == data.gameObject.opponent) {
						data.showToast(
							`Opponent's first cards are sent to blockchain. Please wait.`,
							'Please wait a moment while loading the data.',
							'info'
						);
					}
					break;
				case 'turn_change':
					if (data.player.playerId == data.player?.playerId) {
						data.showToast(
							'Turn Change transaction Called!',
							'Please wait until opponent start the turn.',
							'info'
						);
					} else if (data.player.playerId == data.gameObject.opponent) {
						data.showToast(
							'Turn Change transaction Called!',
							'Please wait until coming your Turn!',
							'info'
						);
					}
					break;
			}
		}
	});
</script>

{#if data.countdown}
	<div class="clock">
		<Clock size="160" color="#4C7D8E" unit="px" duration="240s" pause={false} />
	</div>
{/if}

<MainContents {data} />

<ToastContainer placement="bottom-right" let:data>
	<FlatToast {data} />
</ToastContainer>

<style lang="scss">
	@import '../style/dialog.scss';
</style>
