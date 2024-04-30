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
	import { Amplify } from 'aws-amplify';
	import { generateClient } from 'aws-amplify/api';
	import config from '../config.json';
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
	let animationOnFlag = false;

	/** FCL part */
	// Subscribe Blockchain wallet info
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

	// Get card info from smart contract.
	(async () => {
		data.cardInfo = await getCardInfo(fcl);
	})();

	// Get game player info from smart contract.
	const getPlayerInfo = async () => {
		if (data.walletUser.addr != '') {
			data.showSpinner = true;
			var ret = await isRegistered(fcl, data.walletUser.addr);
			data.showSpinner = false;
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
				data.userDeck = data.userDeck.map((data) => parseInt(data));
				clearInterval(intervalRet);
			} else {
				dialog.showModal();
			}
		}
	};

	// Get balance of creypto and game currencies.
	const getBalances = async () => {
		if (data.walletUser.addr != '') {
			let balance = parseFloat(data.yourInfo['balance']);
			let cyberEnergy = parseInt(data.yourInfo['cyber_energy']);

			const ret = await getBalance(fcl, data.walletUser.addr, data.player?.playerId ?? null);
			data.yourInfo = ret[0];
			data.opponentInfo = ret[1];
			if (
				balance != parseFloat(data.yourInfo['balance']) &&
				balance + 0.499 <= parseFloat(data.yourInfo['balance']) &&
				balance + 0.501 >= parseFloat(data.yourInfo['balance'])
			) {
				showToast('Congrats!', 'You won 0.5FLOW!', 'success');
			}
			if (cyberEnergy != null && cyberEnergy! < parseInt(data.yourInfo['cyber_energy'])) {
				showToast('Success', 'EN is successfully charged.', 'success');
			}
		}
	};

	// Get battle info from smart contract every 1 second.
	setInterval(async () => {
		if (data.player?.playerId) {
			const bcObj = await getCurrentStatus(fcl, data.walletUser.addr);
			if (bcObj == null || bcObj.toString().startsWith('1')) {
				// Not starting the game
				data.gameStarted = false;
				// If there is no battle data,
				if (data.gameObject != null) {
					// If turn exceeds 10 turn so there is no battle data..
					if (
						(data.gameObject.turn == 10 &&
							data.gameObject.yourLife < data.gameObject.opponentLife) ||
						(data.gameObject.yourLife == 1 &&
							data.gameObject.yourLife < data.gameObject.opponentLife)
					) {
						showToast('You Lose...', 'Try Again!', 'warning');
						dialog.showModal();
					} else if (
						data.gameObject!.turn == 10 &&
						data.gameObject!.isFirstTurn == true &&
						data.gameObject!.isFirst == true &&
						data.gameObject!.yourLife <= data.gameObject!.opponentLife
					) {
						showToast('You Lose...', 'Try Again!', 'warning');
					}
				}
				// Initialize game object.
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
						showToast(
							'Your first cards are set!',
							'Please wait a moment while we load the data.',
							'info'
						);
					}, 7000);

					// Start the Intro
					setTimeout(() => {
						showToast(
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
					showToast(
						'Game Start',
						`Game Start! ${data.gameObject.isFirst ? 'Your Turn!' : "Opponent's Turn!"}`,
						'success'
					);
				} else {
					data.gameStarted = true;
					// When after turn is changed.
					if (
						bcObj.turn != data.gameObject?.turn ||
						bcObj.isFirstTurn != data.gameObject?.isFirstTurn
					) {
						data.handCards = Object.values(bcObj.your_hand);
						data.triggerCards = bcObj.your_trigger_cards;
						data.fieldCards = bcObj.your_field_unit;
						data.yourCp = parseInt(bcObj.your_cp);
					} else {
						// console.log(data.fieldCards, 22);
					}
				}

				/**** Set the game object. ****/
				data.gameObject = bcObj;
			}
			// 残高を取得
			getBalances();
		}
	}, 1000);

	/** GraphQL createGameServerProcess part */
	// GraphQL CreatePlayer Server Process
	data.funcCreatePlayer = async () => {
		data.showSpinner = true;
		showToast(
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

	// GraphQL PlayerMatching Server Process
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

	// GraphQL PutCardOnTheField Server Process
	data.funcPutCardOnTheField = async (putCardOnFieldPosition, usedTriggers, skillMessage) => {
		if (data.showSpinner) return;
		data.showSpinner = true;
		// Call GraphQL method.
		const arg1 = {};
		arg1[putCardOnFieldPosition] = data.fieldCards[putCardOnFieldPosition];
		const message = {
			arg1: arg1, // field unit
			arg2: data.skillTargetUnitPos, // unit skill's target
			arg3: data.triggerCards, // trigger cards
			arg4: usedTriggers, // used trigger/intercept card position
			skillMessage: skillMessage,
			usedTriggers: usedTriggers
		};
		data.client.graphql({
			query: createGameServerProcess,
			variables: {
				input: {
					type: 'put_card_on_the_field',
					message: JSON.stringify(message),
					playerId: data.player.playerId
				}
			}
		});
		setTimeout(() => {
			data.showSpinner = false;
		}, 5000);
	};

	// GraphQL TurnEnd Server Process
	data.funcTurnEnd = async () => {
		if (data.showSpinner) return;
		data.showSpinner = true;
		// Call GraphQL method.
		const message = {
			arg1: data.gameObject.is_first != data.gameObject.is_first_turn, // from opponent
			arg2: data.triggerCards // trigger cards
		};
		data.client.graphql({
			query: createGameServerProcess,
			variables: {
				input: {
					type: 'turn_change',
					message: JSON.stringify(message),
					playerId:
						data.gameObject.is_first == data.gameObject.is_first_turn
							? data.player.playerId
							: data.gameObject.opponent
				}
			}
		});
		setTimeout(() => {
			data.showSpinner = false;
		}, 5000);
	};
</script>

<MainLogic {data} />

<Dialog bind:dialog bind:playerName>
	<button disabled={modalDisabled} on:click={data.funcCreatePlayer}>登録</button>
</Dialog>

{#if data.walletUser == null}
	<img class="not-started" src="/image/battleStart2.png" alt="Let's start the game!" />
{:else if data.gameStarted === false && data.gameObject && data.gameObject['game_started'] == false}
	<img class="not-started" src="/image/battleStart2.png" alt="Let's start the game!" />
{/if}
{#if animationOnFlag}
	<img class="not-started" src="/image/battleStart.png" alt="Let's start the game!" />
{/if}

<style lang="scss">
	@import '../style/dialog.scss';
</style>
