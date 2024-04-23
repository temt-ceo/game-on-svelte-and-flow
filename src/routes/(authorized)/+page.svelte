<script lang="ts">
	import GraphQLAPI from './GraphQLAPI.svelte';
	import { createGameServerProcess } from '../../graphql/mutations';
	import { isRegistered } from '$lib/cadence/scripts';
	import { createPlayer } from '$lib/cadence/transactions';
	import * as fcl from '@onflow/fcl';
	import * as types from '@onflow/types';
	import { Jumper } from 'svelte-loading-spinners';
	import Dialog from '$lib/Dialog.svelte';

	fcl.config({
		'accessNode.api': 'https://rest-mainnet.onflow.org',
		'discovery.wallet': 'https://fcl-discovery.onflow.org/authn',
		'app.detail.title': 'COF.ninja', // Shows user what dapp is trying to connect
		'app.detail.icon': 'https://cof.ninja/cof.png' // shows image to the user to display your dapp brand
	});

	export let data;
	let dialog;
	let playerName = 'Test Player';
	let noteText = '';
	let modalDisabled = false;
	let intervalRet;

	/** FCL part */
	// Wallet Signin
	data.funcSignInWallet = () => {
		fcl.authenticate();
	};

	// Wallet Signout
	data.funcSignOutWallet = () => {
		fcl.unauthenticate();
		data.player = null;
		data.walletUser = null;
	};

	data.funcCreatePlayer = async () => {
		data.showSpinner = true;
		noteText = 'ブロックチェーンにプレイヤーネームを保存します。少々お待ちください。';
		modalDisabled = true;
		setTimeout(() => {
			dialog.close();
		}, 3000);
		var ret = await createPlayer(fcl, playerName);
		console.log(ret);
		data.showSpinner = false;
		(intervalRet = setInterval(() => {
			data.getPlayerInfo();
		})),
			3000;
	};

	data.funcPlayerMatching = async () => {
		data.client.graphql({
			query: createGameServerProcess,
			variables: { input: { type: 'player_matching', message: '', playerId: '1' } }
		});
	};

	data.getPlayerInfo = async () => {
		if (data.walletUser.addr != '') {
			data.showSpinner = true;
			var ret = await isRegistered(fcl, data.walletUser.addr);
			data.showSpinner = false;
			console.log(`isRegistered ret: ${ret}`);
			if (ret != null) {
				data.player = {
					playerId: ret.player_id,
					playerName: ret.nickname,
					playerUUId: ret.uuid
				};
				//   userDeck = await promiseToFuture(
				//       getPlayerDeck(walletUser.addr, int.parse(playerId!)));
				// } else {
				//   debugPrint('Not Imporing.');
				//   setState(() => player = PlayerResource('', '', ''));
				clearInterval(intervalRet);
			} else {
				noteText = '';
				dialog.showModal();
			}
			console.log(data.player, `isRegistered: ${ret}`);
		}
	};

	fcl.currentUser.subscribe((user) => {
		try {
			data.walletUser = user;
			if (data.walletUser?.addr) {
				console.log('wallet addr:', data.walletUser.addr, 'player:', data.player);
				if (!data.player) {
					data.getPlayerInfo();
					//   widget.callback('game-is-ready', player.playerId, null, null, null);
				}
			}
		} catch (e) {
			alert(
				'Please reload the browser. Maybe because changing the browser size, something went ..'
			);
		}
	});
</script>

<div>
	{#if data.showSpinner}
		<div class="absolute">
			<Jumper size="50" color="#F03E50" unit="px" duration="1s" />
		</div>
	{/if}
	<GraphQLAPI {data} />
</div>
<Dialog bind:dialog bind:playerName {noteText} on:close={() => console.log('closed')}>
	<button disabled={modalDisabled} on:click={data.funcCreatePlayer}>登録</button>
</Dialog>

<style>
	.absolute {
		position: absolute;
		top: 20px;
		left: 20px;
	}
</style>
