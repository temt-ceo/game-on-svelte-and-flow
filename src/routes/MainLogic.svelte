<script lang="ts">
	import MainContents from './MainContents.svelte';

	export let data;

	data.cardData = {
		handCards: [1, 2, 3],
		fieldCards: []
	};

	data.handleOnGetADrink = async () => {
		const result = await (await fetch(`/api/`)).json();
		data.drinkState = result;
	};

	data.draggingCardPosition = null;
	data.dragHandCard = (e: DragEvent) => {
		data.draggingCardPosition = (e.target as HTMLElement).getAttribute('id');
	};
	data.dropHandCard = (e: DragEvent) => {
		const trimed = data.cardData.handCards.splice(parseInt(data.draggingCardPosition) - 1, 1);
		data.cardData.fieldCards.push(trimed[0]);
		data.cardData = data.cardData;
		data.isDraggingOverAssigned = false;
	};
	data.dragOver = (e: DragEvent) => {
		e.preventDefault();
	};
	data.isDraggingOverAssigned = false;
	data.dragEnterHandCard = (e: DragEvent) => {
		data.isDraggingOverAssigned = true;
	};
	data.dragLeaveHandCard = (e: DragEvent) => {
		data.isDraggingOverAssigned = false;
	};
</script>

<MainContents {data} />
