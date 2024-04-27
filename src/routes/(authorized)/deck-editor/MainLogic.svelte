<script lang="ts">
	import MainContents from './MainContents.svelte';
	import type { CardType } from '../../../types';

	export let data;

	data.draggingCardId = null;
	data.isDraggingOverFromCardList = false;
	data.isDraggingOverFromUserDeck = false;
	data.reserveCardData = [];

	// click event handler
	data.showCardInfo = (e: Event) => {
		const card_id = parseInt((e.target as HTMLElement).getAttribute('id'));
		data.selectedCard = data.cardInfo[card_id];
		data.draggingCardId = parseInt((e.target as HTMLElement).getAttribute('id'));
	};

	// drag & drop event handler
	data.dragFromCardList = (e: DragEvent) => {
		data.draggingCardId = parseInt((e.target as HTMLElement).getAttribute('id'));
	};
	data.dragFromUserDeck = (e: DragEvent) => {
		data.draggingCardId = parseInt((e.target as HTMLElement).getAttribute('id'));
	};
	data.dropFromCardList = (e: DragEvent) => {
		data.userDeck.push(data.draggingCardId);
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
</script>

<MainContents {data} />
