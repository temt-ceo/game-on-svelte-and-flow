<script>
	export let dialog;
	export let playerName = '';
	export let title = '';
	let label = 'あなたのお名前';

	const id = 'textInput';
	const name = 'text';
	const placeholder = '名前を入力して下さい';
</script>

<dialog bind:this={dialog} on:close>
	{#if title}
		<div>{title}</div>
	{:else}
		<div>プレイヤーネームを入力してください。</div>
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
		margin-bottom: 10px;
	}

	dialog > :global(button) {
		width: 100px;
		height: 30px;
		margin: 3px;
	}

	.note {
		color: orange;
		font-size: 10px;
	}
</style>
