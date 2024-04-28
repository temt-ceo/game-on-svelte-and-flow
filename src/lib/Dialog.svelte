<script>
	export let dialog;
	export let playerName = '';
	let label = 'あなたのお名前';

	const id = 'textInput';
	const name = 'text';
	const placeholder = '名前を入力して下さい';
</script>

<dialog bind:this={dialog} on:close>
	<div>プレイヤーネームを入力してください。</div>
	<label for={id}>{label}</label>
	<input bind:value={playerName} {placeholder} {id} {name} type="text" />
	<slot />
</dialog>

<style>
	.note {
		color: orange;
		font-size: 10px;
	}
</style>
