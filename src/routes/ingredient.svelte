<script lang="ts">
	export let ingredient;
</script>

<p class="ingredient">
	{ingredient.amount}{ingredient.name}
</p>

<style>
	.ingredient {
		margin: 2px 0;
	}
</style>
