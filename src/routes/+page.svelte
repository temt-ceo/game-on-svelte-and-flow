<script lang="ts">
	import { createGameServerProcess } from '../graphql/mutations';
	import {
		isRegistered,
		getPlayerDeck,
		getCardInfo,
		getCurrentStatus,
		getBalance,
		getMariganCards
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
	let animationOnFlag = false;

	/** FCL part */

	fcl.currentUser.subscribe((user) => {
		data.walletUser = user;
		if (data.walletUser?.addr) {
			console.log('wallet addr:', data.walletUser.addr, 'player:', data.player);
			if (!data.player) {
				getPlayerInfo();
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
			'success'
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
			data.opponentInfo = ret[1];
			if (
				balance != parseFloat(data.yourInfo['balance']) &&
				balance! + 0.499 <= parseFloat(data.yourInfo['balance']) &&
				balance! + 0.501 >= parseFloat(data.yourInfo['balance'])
			) {
				data.showToast('Congrats!', 'You won 0.5FLOW!', 'success');
			}
			if (cyberEnergy != null && cyberEnergy! < parseInt(data.yourInfo['cyber_energy'])) {
				data.showToast('Success', 'EN is successfully charged.', 'success');
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
			const bcObj = await getCurrentStatus(fcl, data.walletUser.addr);
			if (bcObj == null || bcObj.toString().startsWith('1')) {
				// Not starting the game
				data.gameStarted = false;
				// バトルデータなし
				if (data.gameObject != null) {
					// データがない = 10ターンが終わった可能性
					if (
						(data.gameObject.turn == 10 &&
							data.gameObject.yourLife < data.gameObject.opponentLife) ||
						(data.gameObject.yourLife == 1 &&
							data.gameObject.yourLife < data.gameObject.opponentLife)
					) {
						data.showToast('You Lose...', 'Try Again!', 'warning');
						dialog.showModal();
					} else if (
						data.gameObject!.turn == 10 &&
						data.gameObject!.isFirstTurn == true &&
						data.gameObject!.isFirst == true &&
						data.gameObject!.yourLife <= data.gameObject!.opponentLife
					) {
						data.showToast('You Lose...', 'Try Again!', 'warning');
					}
				}
				// 内部データ初期化
				data.onChainYourFieldUnit = [];
				data.onChainYourTriggerCards = [];
				data.onChainYourTriggerCardsDisplay = [];
				data.canOperate = false;
				data.gameStarted = false;
				data.gameObject = null;
			} else {
				console.log(data.gameObject, data.yourInfo, data.opponentInfo);
				// Setting the intro data.
				if (bcObj['game_started'] == false && data.gameStarted == false) {
					data.gameStarted = true;
					animationOnFlag = true;
					const mCards = await getMariganCards(fcl, data.walletUser.addr, data.player?.playerId);
					// Set marigan cards.
					data.mariganCards = [];
					for (let i = 0; i < 5; i++) {
						data.mariganCards.push([]);
						for (let j = 0; j < 4; j++) {
							data.mariganCards[i].push(parseInt(mCards[i][j]));
						}
					}
					data.mariganClickCount = 0;
					data.handCards = data.mariganCards[data.mariganClickCount];
					data.canMarigan = true;
					// After Marigan time is ended,
					setTimeout(() => {
						data.canMarigan = false;
						// Start the battle.
						data.showSpinner = true;
						// Call GraphQL method.
						data.client.graphql({
							query: createGameServerProcess,
							variables: {
								input: {
									type: 'game_start',
									message: JSON.stringify(data.handCards),
									playerId: data.player?.playerId
								}
							}
						});
						// close loading icon.
						setTimeout(() => {
							data.showSpinner = false;
						}, 5000);
						data.showToast(
							'Your first cards are set!',
							'Please wait a moment while we load the data.',
							'info'
						);
					}, 7000);

					// Start the Intro
					setTimeout(() => {
						data.showToast(
							'Marigan Time!',
							'You may only redo your hand for a period of 5 seconds.',
							'info'
						);
						animationOnFlag = false;
					}, 1500);
				} else if (
					data.gameObject &&
					data.gameObject['game_started'] == false &&
					bcObj['game_started'] == true
				) {
					data.gameStarted = true;
					data.showToast(
						'Game Start',
						`Game Start! ${data.gameObject.isFirst ? 'Your Turn!' : "Opponent's Turn!"}`,
						'success'
					);
				} else {
					data.gameStarted = true;
					// When after turn is changed.
					if (bcObj.turn != data.turn || bcObj.isFirstTurn != data.isFirstTurn) {
						data.handCards = Object.values(bcObj.your_hand);
						data.opponetHandCards = parseInt(bcObj.opponent_hand);
						data.triggerCards = Object.values(bcObj.your_trigger_cards);
						data.opponetTriggerCards = parseInt(bcObj.opponent_trigger_cards);
						data.fieldCards = Object.values(bcObj.your_field_unit);
						data.opponetFieldCards = Object.values(bcObj.opponent_field_unit);
						data.yourCp = parseInt(bcObj.your_cp);
					} else {
					}
				}

				/**** Set the game object. ****/
				data.gameObject = bcObj;
			}
			// 残高を取得
			getBalances();
		}
	}, 1000);
</script>

<MainLogic {data} />

<Dialog bind:dialog bind:playerName>
	<button disabled={modalDisabled} on:click={data.funcCreatePlayer}>登録</button>
</Dialog>

{#if data.gameStarted === false && data.gameObject && data.gameObject['game_started'] == false}
	<img class="not-started" src="/image/battleStart2.png" alt="Let's start the game!" />
{/if}
{#if animationOnFlag}
	<img class="not-started" src="/image/battleStart.png" alt="Let's start the game!" />
{/if}

<style lang="scss">
	@import '../style/dialog.scss';
</style>
