<script lang="ts">
	import MainContents from './MainContents.svelte';
	import { onCreateGameServerProcess } from '../graphql/subscriptions';

	export let data;

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

	/** GraphQL part */
	data.client.graphql({ query: onCreateGameServerProcess }).subscribe({
		next: (gameProcess) => {
			console.log(gameProcess.data);
			data.showSpinner = true;
			setTimeout(() => {
				data.showSpinner = false;
			}, 10000);
		}
	});
</script>

<MainContents {data} />
