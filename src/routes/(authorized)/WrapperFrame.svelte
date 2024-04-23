<script lang="ts">
	import MainLogic from './mainLogic.svelte';

	export let data;
</script>

<div class="wrapper">
	<MainLogic {data} />
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-family: Arial, Helvetica, sans-serif;
	}
</style>
