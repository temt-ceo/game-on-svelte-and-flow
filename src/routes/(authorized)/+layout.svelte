<script lang="ts">
	import Header from '$lib/header.svelte';
	import Footer from '$lib/footer.svelte';
</script>

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
