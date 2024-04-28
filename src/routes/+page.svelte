<script lang="ts">
	import { createGameServerProcess } from '../graphql/mutations';
	import {
		isRegistered,
		getPlayerDeck,
		getCardInfo,
		getCurrentStatus,
		getBalance
	} from '$lib/cadence/scripts';
	import { createPlayer } from '$lib/cadence/transactions';
	import * as fcl from '@onflow/fcl';
	import Dialog from '$lib/Dialog.svelte';
	import MainLogic from './MainLogic.svelte';

	fcl.config({
		'accessNode.api': 'https://rest-mainnet.onflow.org',
		'discovery.wallet': 'https://fcl-discovery.onflow.org/authn',
		'app.detail.title': 'COF.ninja', // Shows user what dapp is trying to connect
		'app.detail.icon': 'https://cof.ninja/cof.png' // shows image to the user to display your dapp brand
	});

	export let data;
	let dialog;
	let playerName = 'Test Player';
	let modalDisabled = false;
	let intervalRet;
	let isGameStarted = false;

	/** FCL part */

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

	data.funcCreatePlayer = async () => {
		data.showSpinner = true;
		data.showToast(
			'Success',
			'ブロックチェーンにプレイヤーネームを保存します。少々お待ちください。',
			false
		);
		modalDisabled = true;
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

	data.funcSaveDeck = async () => {
		data.showSpinner = true;
		// Call GraphQL method.
		data.client.graphql({
			query: createGameServerProcess,
			variables: {
				input: {
					type: 'save_deck',
					message: JSON.stringify(data.userDeck),
					playerId: data.player?.playerId
				}
			}
		});
		setTimeout(() => {
			data.showSpinner = false;
		}, 10000);
	};

	data.funcPlayerMatching = async () => {
		if (data.showSpinner) return;
		data.showSpinner = true;
		// Call GraphQL method.
		data.client.graphql({
			query: createGameServerProcess,
			variables: {
				input: { type: 'player_matching', message: '', playerId: data.player?.playerId }
			}
		});
		setTimeout(() => {
			data.showSpinner = false;
		}, 5000);
	};

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

	const getCardInfos = async () => {
		// カード情報取得
		try {
			data.cardInfo = await getCardInfo(fcl);

			// Create Card Info Array
			const cardList = Object.keys(data.cardInfo);
			for (const id of cardList) {
				data.reserveCardData.push(data.cardInfo[id].card_id);
			}
			// widget.callback('card-info', player.playerId, null, null, objJs);
		} catch (e) {}
	};

	const getBalances = async () => {
		let balance = parseFloat(data.yourInfo['balance']);
		let cyberEnergy = parseInt(data.yourInfo['cyber_energy']);

		if (data.walletUser.addr != '') {
			const ret = await getBalance(fcl, data.walletUser.addr, data.player?.playerId ?? null);
			data.yourInfo = ret[0];
			console.log(data.yourInfo, 88);
			if (
				balance != parseFloat(data.yourInfo['balance']) &&
				balance! + 0.499 <= parseFloat(data.yourInfo['balance']) &&
				balance! + 0.501 >= parseFloat(data.yourInfo['balance'])
			) {
				data.showToast('Congrats!', 'You won 0.5FLOW!', false);
			}
			if (cyberEnergy != null && cyberEnergy! < parseInt(data.yourInfo['cyber_energy'])) {
				data.showToast('Success', 'EN is successfully charged.', false);
			}
			// data.yourScore =
			//     '${yourInfo['score'].length} games ${yourInfo['win_count']} win');
			// if (gameStarted == true && objJs.length > 1) {
			//   var opponentInfo = objJs[1];
			//   setState(() => enemyScore =
			//       '${opponentInfo['score'].length} games ${opponentInfo['win_count']} win');
			// }
		}
	};

	// カード情報取得
	getCardInfos();

	setInterval(async () => {
		if (data.player?.playerId) {
			const ret = await getCurrentStatus(fcl, data.walletUser.addr);
			if (ret == null || ret.toString().startsWith('1')) {
				// Not starting the game
				isGameStarted = false;
				// バトルデータなし
				if (data.gameObject != null) {
					// データがない = 10ターンが終わった可能性
					if (
						(data.gameObject!.turn == 10 &&
							data.gameObject!.yourLife < data.gameObject!.opponentLife) ||
						(data.gameObject!.yourLife == 1 &&
							data.gameObject!.yourLife < data.gameObject!.opponentLife)
					) {
						data.showToast('You Lose...', 'Try Again!', true);
						dialog.showModal();
					} else if (
						data.gameObject!.turn == 10 &&
						data.gameObject!.isFirstTurn == true &&
						data.gameObject!.isFirst == true &&
						data.gameObject!.yourLife <= data.gameObject!.opponentLife
					) {
						data.showToast('You Lose...', 'Try Again!', true);
					}
				}
				// 内部データ初期化
				data.onChainYourFieldUnit = [];
				data.onChainYourTriggerCards = [];
				data.onChainYourTriggerCardsDisplay = [];
				data.canOperate = false;
				data.gameStarted = false;
				data.gameObject = null;
				// 残高を取得
				getBalances();
			}
		}
	}, 1000);
</script>

<MainLogic {data} />

<Dialog bind:dialog bind:playerName on:close={() => console.log('closed')}>
	<button disabled={modalDisabled} on:click={data.funcCreatePlayer}>登録</button>
</Dialog>

{#if isGameStarted === false}
	<img class="not-started" src="/image/battleStart2.png" alt="Let's start the game!" />
{/if}

<style lang="scss">
	@import '../style/dialog.scss';
</style>
