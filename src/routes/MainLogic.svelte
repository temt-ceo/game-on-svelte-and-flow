<script lang="ts">
	import { Clock } from 'svelte-loading-spinners';
	import MainContents from './MainContents.svelte';
	import { onCreateGameServerProcess } from '../graphql/subscriptions';
	import { ToastContainer, FlatToast } from 'svelte-toasts';

	export let data;
	let countdown = false;

	data.draggingCardId = null;
	data.isDraggingOverFromCardList = false;
	data.isDraggingOverFromUserDeck = false;
	data.reserveCardData = [];

	// click event handler
	data.showCardInfo = (e: Event) => {
		const card_id = parseInt((e.target as HTMLElement).getAttribute('id'));
		data.draggingCardId = card_id;
		data.selectedCard = data.cardInfo[card_id];
	};

	// drag & drop event handler
	data.dragFromCardList = (e: DragEvent) => {
		data.draggingCardId = parseInt((e.target as HTMLElement).getAttribute('id'));
		data.selectedCard = data.cardInfo[data.draggingCardId];
	};
	data.dragFromUserDeck = (e: DragEvent) => {
		data.draggingCardId = parseInt((e.target as HTMLElement).getAttribute('id'));
		data.selectedCard = data.cardInfo[data.draggingCardId];
	};
	data.dropFromCardList = (e: DragEvent) => {
		if (data.userDeck.length < 30) {
			data.userDeck.push(data.draggingCardId);
		}
		data.isDraggingOverFromCardList = false;
	};
	data.dropFromUserDeck = (e: DragEvent) => {
		const targetIndex = data.userDeck.findIndex((cardId) => {
			return cardId == data.draggingCardId;
		});
		data.userDeck.splice(targetIndex, 1);
		data.isDraggingOverFromUserDeck = false;
	};
	data.dragEnterFromCardList = (e: DragEvent) => {
		data.isDraggingOverFromCardList = true;
	};
	data.dragLeaveFromCardList = (e: DragEvent) => {
		data.isDraggingOverFromCardList = false;
	};
	data.dragEnterFromUserDeck = (e: DragEvent) => {
		data.isDraggingOverFromUserDeck = true;
	};
	data.dragLeaveFromUserDeck = (e: DragEvent) => {
		data.isDraggingOverFromUserDeck = false;
	};
	data.dragOver = (e: DragEvent) => {
		e.preventDefault();
	};

	// button function
	data.sortUserDeck = () => {
		data.userDeck.sort((a, b) => a - b);
		data.userDeck = data.userDeck;
		console.log(data.userDeck);
	};

	/** GraphQL Subscribition part */
	data.client.graphql({ query: onCreateGameServerProcess }).subscribe({
		next: (gameProcess) => {
			const retSubscription = gameProcess.data?.onCreateGameServerProcess;
			console.log(retSubscription);
			data.showSpinner = true;
			switch (retSubscription.type) {
				case 'save_deck':
					setTimeout(() => {
						data.showSpinner = false;
					}, 10000);
				case 'player_matching':
					if (data.player.playerId == retSubscription.playerId) {
						data.countdown = true;
						setTimeout(() => {
							data.countdown = false;
						}, 66000);
						data.showToast(
							'Success!',
							`You successfully entered in Alcana. Now matching is started.`,
							false
						);
					} else {
						data.showToast(
							'Warning!!',
							`No. ${retSubscription.playerId} has entered in Alcana.`,
							true
						);
					}
			}
		}
	});
</script>

{#if data.countdown}
	<div class="clock">
		<Clock size="80" color="#F03E50" unit="px" duration="240s" pause={false} />
	</div>
{/if}

<MainContents {data} />

<ToastContainer placement="bottom-right" let:data>
	<FlatToast {data} />
	<!-- Provider template for your toasts -->
</ToastContainer>

<style lang="scss">
	@import '../style/dialog.scss';
</style>
