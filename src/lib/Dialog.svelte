<script>
	export let dialog;
	export let playerName = '';
	export let title = '';
	let label = 'Your Name';

	const id = 'textInput';
	const name = 'text';
	const placeholder = 'Enter your name';
</script>

<dialog bind:this={dialog} on:close>
	{#if title}
		<div class="title">{title}</div>
	{:else}
		<div class="title">Please enter a player name.</div>
		<label for={id}>{label}</label>
		<input bind:value={playerName} {id} {name} {placeholder} type="text" />
	{/if}
	<slot />
</dialog>

<style>
	dialog {
		padding: 30px;
		border-radius: 10px;
		background-color: rgb(132 225 188);
		text-align: right;
	}

	dialog > div {
		margin-bottom: 15px;
	}

	dialog > div.title {
		text-align: center;
	}

	dialog > :global(button) {
		width: 100px;
		height: 30px;
		margin: 3px;
	}

	input {
		padding: 5px;
	}

	.note {
		color: orange;
		font-size: 10px;
	}
</style>
