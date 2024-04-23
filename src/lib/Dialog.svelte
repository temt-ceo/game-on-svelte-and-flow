<script>
	export let dialog;
	export let value = '';
	export let label = '';

	const id = 'textInput';
	const name = 'text';
	const placeholder = '名前を入力して下さい';
</script>

<dialog bind:this={dialog} on:close>
	<div>プレイヤーネームを入力してください。</div>
	<label for={id}>{label}</label>
	<input bind:value {placeholder} {id} {name} type="text" />
	<slot />
</dialog>
