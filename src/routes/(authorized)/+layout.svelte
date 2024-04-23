<script lang="ts">
	import Header from '$lib/PageHeader.svelte';
	import Footer from '$lib/PageFooter.svelte';
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.data.title || 'COF Ninja'}</title>
</svelte:head>

<div class="main">
	<Header />
	<slot />
	<Footer />
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
