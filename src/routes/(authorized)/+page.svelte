<script lang="ts">
	// import PageFrame from './pageFrame.svelte';
	import { onCreateGameServerProcess } from '../../graphql/subscriptions';

	export let data;

	/** GraphQL part */
	data.client.graphql({ query: onCreateGameServerProcess }).subscribe({
		next: (gameProcess) => {
			console.log(gameProcess);
		}
	});

	/** FCL part */
	data.fcl.currentUser.subscribe((user) => {
		try {
			data.walletUser = user;
			if (data.walletUser.addr) {
				console.log('wallet addr:', data.walletUser.addr);
				// if (player.uuid == '') {
				//   getPlayerInfo();
				//   widget.callback('game-is-ready', player.playerId, null, null, null);
				// }
			}
		} catch (e) {
			alert(
				'Please reload the browser. Maybe because changing the browser size, something went ..'
			);
		}
	});
</script>

<!-- <PageFrame {data} /> -->
