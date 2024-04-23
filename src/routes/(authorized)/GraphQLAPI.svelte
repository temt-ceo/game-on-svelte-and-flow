<script lang="ts">
	import WrapperFrame from './WrapperFrame.svelte';
	import { onCreateGameServerProcess } from '../../graphql/subscriptions';

	export let data;

	/** GraphQL part */
	data.client.graphql({ query: onCreateGameServerProcess }).subscribe({
		next: (gameProcess) => {
			console.log(gameProcess);
		}
	});
</script>

<WrapperFrame {data} />
