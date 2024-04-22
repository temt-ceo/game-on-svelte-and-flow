<script lang="ts">
	import GraphQLFrame from './graphQLFrame.svelte';
	import { createGameServerProcess } from '../../graphql/mutations';
	import * as fcl from '@onflow/fcl';
	import * as types from '@onflow/types';

	fcl.config({
		'accessNode.api': 'https://rest-testnet.onflow.org',
		'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
		'app.detail.title': 'Sample App',
		'app.detail.icon': 'https://fcl-discovery.onflow.org/images/blocto.png',
		'0xCOF': '0x9e447fb949c3f1b6' // The account address where the smart contract lives
	});

	export let data;

	/** FCL part */
	data.funcPlayerMatching = async () => {
		data.client.graphql({
			query: createGameServerProcess,
			variables: { input: { type: 'player_matching', message: '', playerId: '1' } }
		});
	};

	data.funcSignInWallet = async () => {
		fcl.authenticate();
	};

	fcl.currentUser.subscribe((user) => {
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

<GraphQLFrame {data} />
