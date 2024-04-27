<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.data.title || 'COF Ninja'}</title>
</svelte:head>

<div class="main">
	<slot />
</div>

<style>
	:global(body) {
		margin: 0;
	}

	.main {
		width: 100vw;
		height: 100vh;
		background-color: #0b0423;
		color: white;
	}
</style>
