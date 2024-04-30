<script lang="ts">
	import { createGameServerProcess } from '../../graphql/mutations';
	import { isRegistered, getPlayerDeck, getCardInfo } from '$lib/cadence/scripts';
	import { createPlayer } from '$lib/cadence/transactions';
	import * as fcl from '@onflow/fcl';
	import Dialog from '$lib/Dialog.svelte';
	import MainLogic from './MainLogic.svelte';
	import { Amplify } from 'aws-amplify';
	import { generateClient } from 'aws-amplify/api';
	import config from '../../config.json';
	import { showToast } from '$lib/const';

	Amplify.configure(config);

	fcl.config({
		'accessNode.api': 'https://rest-mainnet.onflow.org',
		'discovery.wallet': 'https://fcl-discovery.onflow.org/authn',
		'app.detail.title': 'COF.ninja', // Shows user what dapp is trying to connect
		'app.detail.icon': 'https://cof.ninja/cof.png' // shows image to the user to display your dapp brand
	});

	export let data;
	data.client = generateClient();

	let dialog;
	let playerName = 'Test Player';
	let modalDisabled = false;
	let intervalRet;

	/** FCL part */
	// Subscribe Blockchain wallet info
	fcl.currentUser.subscribe((user) => {
		data.walletUser = user;
		if (data.walletUser?.addr) {
			console.log('wallet addr:', data.walletUser.addr, 'player:', data.player);
			if (!data.player) {
				getPlayerInfo();
				//   widget.callback('game-is-ready', player.playerId, null, null, null);
			}
		}
	});

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

	// Get card info from smart contract.
	(async () => {
		data.cardInfo = await getCardInfo(fcl);
		// Create Card Info Array
		const cardList = Object.keys(data.cardInfo);
		for (const id of cardList) {
			data.reserveCardData.push(data.cardInfo[id].card_id);
		}
	})();

	// Get game player info from smart contract.
	const getPlayerInfo = async () => {
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
				data.userDeck = await getPlayerDeck(
					fcl,
					data.walletUser.addr,
					parseInt(data.player.playerId)
				);
				const ret2 = data.userDeck.map((data) => parseInt(data));
				data.userDeck = ret2;
				clearInterval(intervalRet);
			} else {
				dialog.showModal();
			}
		}
	};

	/** GraphQL createGameServerProcess part */
	// GraphQL CreatePlayer Server Process
	data.funcCreatePlayer = async () => {
		data.showSpinner = true;
		showToast(
			'Success',
			'ブロックチェーンにプレイヤーネームを保存します。少々お待ちください。',
			false
		);
		setTimeout(() => {
			dialog.close();
		}, 3000);
		var ret = await createPlayer(fcl, playerName);
		console.log(ret);
		data.showSpinner = false;
		intervalRet = setInterval(() => {
			getPlayerInfo();
		}, 3000);
	};

	// GraphQL SaveDeck Server Process
	data.funcSaveDeck = async () => {
		data.showSpinner = true;
		// Call GraphQL method.
		data.client.graphql({
			query: createGameServerProcess,
			variables: {
				input: {
					type: 'save_deck',
					message: JSON.stringify(data.userDeck),
					playerId: data.player.playerId
				}
			}
		});
		setTimeout(() => {
			data.showSpinner = false;
		}, 11000);
	};
</script>

<MainLogic {data} />
<Dialog bind:dialog bind:playerName on:close={() => console.log('closed')}>
	<button disabled={modalDisabled} on:click={data.funcCreatePlayer}>登録</button>
</Dialog>
