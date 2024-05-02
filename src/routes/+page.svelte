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
	import { createPlayer, purchaseCyberEN } from '$lib/cadence/transactions';
	import * as fcl from '@onflow/fcl';
	import Dialog from '$lib/Dialog.svelte';
	import MainLogic from './MainLogic.svelte';
	import { Amplify } from 'aws-amplify';
	import { generateClient } from 'aws-amplify/api';
	import config from '../config.json';
	import { sleep, showToast, checkCyberENBalance } from '$lib/common';
	import {
		ActedUp,
		CardNotNeedSelectTarget,
		CardNeedsSelectTarget,
		CardNeedsSelectActedTarget,
		CardTriggerWhenPutOnField,
		CardTriggerWhenTurnEnd,
		CardTriggerWhenBattling,
		Valkyrie
	} from '$lib/const';

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
	let modal;
	let enModal;
	let title = '';
	let playerName = '';
	let modalDisabled = false;
	let cyberEnergy;
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
		cyberEnergy = null;
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
				title = '';
				dialog.showModal();
			}
		}
	};

	// Get balance of creypto and game currencies.
	const getBalances = async () => {
		if (data.walletUser.addr != '') {
			let balance = parseFloat(data.yourInfo['balance']);
			cyberEnergy = parseInt(data.yourInfo['cyber_energy']);

			const ret = await getBalance(fcl, data.walletUser.addr, data.player?.playerId ?? null);
			data.yourInfo = ret[0];
			data.opponentInfo = ret[1];
			if (
				balance != parseFloat(data.yourInfo['balance']) &&
				balance + 0.499 <= parseFloat(data.yourInfo['balance']) &&
				balance + 0.501 >= parseFloat(data.yourInfo['balance'])
			) {
				title = 'Congrats!! You won 0.5FLOW!';
				modal.showModal();
			}
			if (cyberEnergy != null && cyberEnergy! < parseInt(data.yourInfo['cyber_energy'])) {
				title = 'EN is successfully charged.';
				modal.showModal();
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
						(parseInt(data.gameObject.turn) == 10 &&
							parseInt(data.gameObject.yourLife) < parseInt(data.gameObject.opponentLife)) ||
						(parseInt(data.gameObject.yourLife) == 1 &&
							parseInt(data.gameObject.yourLife) < parseInt(data.gameObject.opponentLife))
					) {
						title = 'You Lose... Try Again!';
						modal.showModal();
					} else if (
						parseInt(data.gameObject!.turn) == 10 &&
						data.gameObject!.isFirstTurn == true &&
						data.gameObject!.isFirst == true &&
						parseInt(data.gameObject!.yourLife) <= parseInt(data.gameObject!.opponentLife)
					) {
						title = 'You Lose... Try Again!';
						modal.showModal();
					}
				}
				// Initialize game object.
				data.gameStarted = false;
				data.gameObject = null;
			} else {
				console.log(data.gameObject);
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
						bcObj.is_first_turn != data.gameObject?.is_first_turn
					) {
						data.handCards = Object.values(bcObj.your_hand);
						data.triggerCards = bcObj.your_trigger_cards;
						data.fieldCards = bcObj.your_field_unit;
						data.yourCp = parseInt(bcObj.your_cp);
						data.originalYourLife = bcObj.your_life;
						data.originalOpponentLife = bcObj.opponent_life;
						data.timeLimitCalcFlag = true;
						if (bcObj.is_first_turn == bcObj.is_first) {
							showToast(`Your Turn!`, '', 'info');
							if (parseInt(data.gameObject?.turn) == 10) {
								title = `Final Turn! Let's defeat within this turn!!`;
								modal.showModal();
							}
						}
					} else {
						const currentTime = new Date();
						if (bcObj['your_attacking_card']) {
							const attackedTime = new Date(
								parseInt(bcObj['your_attacking_card']['attacked_time']) * 1000
							);
							const pastSeconds = (currentTime.getTime() - attackedTime.getTime()) / 1000;
							// Time Limit.
							if (pastSeconds > 14) {
								data.funcDefenceAction(null, [], []);
							}
						}
						if (data.timeLimitCalcFlag) {
							const lastTurnEnd = new Date(parseInt(bcObj.last_time_turnend) * 1000);
							const pastSeconds = (currentTime.getTime() - lastTurnEnd.getTime()) / 1000;
							if (pastSeconds > 80) {
								showToast('The time limit has passed.', '', 'success');
								data.funcTurnEnd();
								data.timeLimitCalcFlag = false;
							}
						}
					}
				}

				/**** Set the game object. ****/
				data.gameObject = bcObj;
			}
			// 残高を取得
			getBalances();
		}
	}, 1000);

	// CreatePlayer Process by User wallet
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

	// purchaseCyberEN Process by User wallet
	data.funcPurchaseEN = async () => {
		data.showSpinner = true;
		showToast(
			'Execute EN purchase process.',
			'Press the Approval button on the Wallet popup.',
			'info'
		);
		setTimeout(() => {
			enModal.close();
		}, 3000);
		var ret = await purchaseCyberEN(fcl);
		data.showSpinner = false;
	};

	/** GraphQL createGameServerProcess part */
	// GraphQL PlayerMatching Server Process
	data.funcPlayerMatching = async () => {
		if (checkCyberENBalance(data) > 0) {
			title = `EN is missing. Would you like to purchase?`;
			enModal.showModal();
			return;
		}
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
	data.funcPutCardOnTheField = async (putCardOnFieldPosition, skillMessage) => {
		if (data.showSpinner) return;
		data.showSpinner = true;
		// Call GraphQL method.
		const arg1 = {};
		arg1[putCardOnFieldPosition] = data.fieldCards[putCardOnFieldPosition];
		const message = {
			arg1: arg1, // field unit
			arg2: data.skillTargetUnitPos, // unit skill's target
			arg3: data.triggerCards, // trigger cards
			arg4: data.usedTriggers, // used trigger/intercept card position
			skillMessage: skillMessage,
			usedTriggers: data.usedTriggers
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
		data.usedTriggers.forEach((pos) => {
			delete data.triggerCards[pos];
		});
		setTimeout(() => {
			data.showSpinner = false;
			data.usedTriggers = [];
		}, 7000);
	};

	// GraphQL TurnEnd Server Process
	data.funcTurnEnd = async () => {
		if (data.showSpinner) return;

		// Check Field Unit Ability
		checkFieldUnitAbilityWhenTurnChange();

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

	// GraphQL TurnEnd Server Process
	data.funcAttack = async (fieldPosition) => {
		if (data.showSpinner) return;

		// Check Field Unit And Trigger Card Ability
		await checkFieldUnitAndTriggerZoneAbilityWhenAttack(
			data.cardInfo[data.fieldCards[fieldPosition]]
		);
		const usedTriggerCardIDs = [];
		data.usedTriggers.forEach((pos) => {
			usedTriggerCardIDs.push(data.triggerCards[pos]);
			delete data.triggerCards[pos];
		});

		data.showSpinner = true;
		// Call GraphQL method.
		const message = {
			arg1: fieldPosition, // position
			arg2: data.selectTargetType, // unit skill's target
			arg3: data.triggerCards, // trigger cards
			arg4: data.usedTriggers, // used trigger/intercept card position
			usedCardIds: usedTriggerCardIDs,
			canBlock: data.fieldCards[fieldPosition] == Valkyrie ? false : true,
			skillMessage: data.skillMessage
		};

		data.client.graphql({
			query: createGameServerProcess,
			variables: {
				input: {
					type: 'attack',
					message: JSON.stringify(message),
					playerId: data.player.playerId
				}
			}
		});

		// Initialization
		data.selectTargetType = null;
		data.waitPlayerChoice = false;

		setTimeout(() => {
			data.showSpinner = false;
		}, 7000);

		// Valkyrie is not blocked.
		if (data.fieldCards[fieldPosition] == Valkyrie) {
			setTimeout(() => {
				data.funcDefenceAction(null, [], []);
			}, 1000);
		}
	};

	data.funcBattleReaction = async () => {
		if (data.showSpinner) return;

		if (data.defendUnitPosition) {
			await sleep(5);
		}
		// Check Field Unit And Trigger Card Ability
		await checkTriggerZoneAbilityWhenBattle();
		const usedTriggerCardIDs = [];
		data.usedTriggers.forEach((pos) => {
			usedTriggerCardIDs.push(data.triggerCards[pos]);
			delete data.triggerCards[pos];
		});
		data.showSpinner = true;
		// Call GraphQL method.
		const message = {
			arg1: data.defendUnitPosition, // defender defend position
			arg2: data.attackerUsedInterceptCardPositions, // attacker used intercept card positions
			arg3: data.usedTriggers, // defender used intercept card positions
			attackerUsedCardIds: data.attackerUsedCardIds, // attackerUsedCardIds
			defenderUsedCardIds: usedTriggerCardIDs // defenderUsedCardIds
		};

		data.client.graphql({
			query: createGameServerProcess,
			variables: {
				input: {
					type: 'battle_reaction',
					message: JSON.stringify(message),
					playerId: data.player.playerId
				}
			}
		});

		// Initialization
		data.defendUnitPosition = null;
		data.waitPlayerChoice = false;
		data.attackerUsedInterceptCardPositions = [];
		data.attackerUsedCardIds = [];

		setTimeout(() => {
			data.showSpinner = false;
		}, 5000);
	};

	data.funcDefenceAction = async (
		defendUnitPosition,
		attackerUsedCardPositions,
		defenderUsedCardPositions
	) => {
		if (data.showSpinner) return;

		data.showSpinner = true;
		// Call GraphQL method.
		const message = {
			arg1: data.defendUnitPosition ?? defendUnitPosition, // defender defend position
			arg2: attackerUsedCardPositions, // attacker used intercept card positions
			arg3: defenderUsedCardPositions, // defender used intercept card positions
			attackerUsedCardIds: attackerUsedCardPositions, // attackerUsedCardIds
			defenderUsedCardIds: defenderUsedCardPositions // defenderUsedCardIds
		};

		data.client.graphql({
			query: createGameServerProcess,
			variables: {
				input: {
					type: 'defence_action',
					message: JSON.stringify(message),
					playerId: data.player.playerId
				}
			}
		});

		// Initialization
		data.defendUnitPosition = null;
		data.waitPlayerChoice = false;
		data.attackerUsedInterceptCardPositions = [];
		data.attackerUsedCardIds = [];

		setTimeout(() => {
			data.showSpinner = false;
		}, 5000);
	};

	const checkFieldUnitAbilityWhenTurnChange = () => {
		for (const pos of [1, 2, 3, 4, 5]) {
			if (data.cardInfo[data.fieldCards[pos]]?.skill.trigger_1 == CardTriggerWhenTurnEnd) {
				showToast(
					`${data.cardInfo[data.fieldCards[pos]]?.name} is Activated! 【SELECT ONE TARGET!】`,
					`=> ${data.cardInfo[data.fieldCards[pos]]?.skill.description}.`,
					'success'
				);
			}
		}
	};

	const checkFieldUnitAndTriggerZoneAbilityWhenAttack = async (unitAbility) => {
		data.skillMessage = '';
		// Field Unit
		if (unitAbility?.skill.trigger_1 == CardTriggerWhenPutOnField) {
			// Is needed to select enemy unit?
			if (unitAbility?.skill.ask_1 == CardNeedsSelectTarget) {
				// Are there target unit?
				for (const pos of [1, 2, 3, 4, 5]) {
					if (data.gameObject.opponent_field_unit_action[pos]) {
						// default target is most left unit.
						data.skillTargetUnitPos = pos;
						data.skillMessage += `${unitAbility?.name} Ability Activated!!/`;
						showToast(
							`${unitAbility?.name} is Activated! 【SELECT ONE TARGET!】`,
							`=> ${unitAbility?.skill.description}.`,
							'success'
						);
						data.selectTargetType = CardNeedsSelectTarget;
						data.waitPlayerChoice = true;
						await sleep(7); // wait until player choose the target.
						break;
					}
				}
				// Is needed to select acted-up enemy unit?
			} else if (unitAbility?.skill.ask_1 == CardNeedsSelectActedTarget) {
				// Are there target unit?
				for (const pos of [1, 2, 3, 4, 5]) {
					if (data.gameObject.opponent_field_unit_action[pos] == ActedUp) {
						// default target is most left unit.
						data.skillTargetUnitPos = pos;
						data.skillMessage += `${unitAbility?.name} Ability Activated!!/`;
						showToast(
							`${unitAbility?.name} is Activated! 【SELECT ONE TARGET (which is already acted up)!】`,
							`=> ${unitAbility?.skill.description}.`,
							'success'
						);
						data.selectTargetType = CardNeedsSelectActedTarget;
						data.waitPlayerChoice = true;
						await sleep(7); // wait until player choose the target.
						break;
					}
				}
			}
		}

		data.usedTriggers = [];
		// Trigger Zone
		for (const pos of [1, 2, 3, 4]) {
			if (data.cardInfo[data.triggerCards[pos]]?.skill.trigger_1 == CardTriggerWhenPutOnField) {
				// Is needed to select enemy unit?
				if (data.cardInfo[data.triggerCards[pos]]?.skill.ask_1 == CardNeedsSelectTarget) {
					// Are there target unit?
					for (const unitPos of [1, 2, 3, 4, 5]) {
						if (data.gameObject.opponent_field_unit_action[unitPos]) {
							data.usedTriggers.push(pos);
							// default target is most left unit.
							data.skillTargetUnitPos = unitPos;
							data.skillMessage += `${data.cardInfo[data.triggerCards[pos]]?.name} Trigger Card Activated!!/`;
							showToast(
								`${data.cardInfo[data.triggerCards[pos]]?.name} is Activated! 【SELECT ONE TARGET!】`,
								`=> ${data.cardInfo[data.triggerCards[pos]]?.skill.description}.`,
								'success'
							);
							data.selectTargetType = CardNeedsSelectTarget;
							data.waitPlayerChoice = true;
							await sleep(7); // wait until player choose the target.
							break;
						}
					}
					// Is needed to select acted-up enemy unit?
				} else if (
					data.cardInfo[data.triggerCards[pos]]?.skill.ask_1 == CardNeedsSelectActedTarget
				) {
					// Are there target unit?
					for (const unitPos of [1, 2, 3, 4, 5]) {
						if (data.gameObject.opponent_field_unit_action[unitPos] == ActedUp) {
							data.usedTriggers.push(pos);
							// default target is most left unit.
							data.skillTargetUnitPos = unitPos;
							data.skillMessage += `${data.cardInfo[data.triggerCards[pos]]?.name} Trigger Card Activated!!/`;
							showToast(
								`${data.cardInfo[data.triggerCards[pos]]?.name} is Activated! 【SELECT ONE TARGET (which is already acted up)!】`,
								`=> ${data.cardInfo[data.triggerCards[pos]]?.skill.description}.`,
								'success'
							);
							data.selectTargetType = CardNeedsSelectActedTarget;
							data.waitPlayerChoice = true;
							await sleep(7); // wait until player choose the target.
							break;
						}
					}
				} else if (data.cardInfo[data.triggerCards[pos]]?.skill.ask_1 == CardNotNeedSelectTarget) {
					data.usedTriggers.push(pos);
					data.skillMessage += `${data.cardInfo[data.triggerCards[pos]]?.name} Trigger Card Activated!!/`;
					showToast(
						`${data.cardInfo[data.triggerCards[pos]]?.name} is Activated!`,
						`=> ${data.cardInfo[data.triggerCards[pos]]?.skill.description}!`,
						'success'
					);
				}
			}
		}
	};

	const checkTriggerZoneAbilityWhenBattle = async () => {
		data.skillMessage = '';

		data.usedTriggers = [];
		// Trigger Zone
		for (const pos of [1, 2, 3, 4]) {
			if (data.cardInfo[data.triggerCards[pos]]?.skill.trigger_1 == CardTriggerWhenBattling) {
				data.usedTriggers.push(pos);
				data.skillMessage += `${data.cardInfo[data.triggerCards[pos]]?.name} Trigger Card Activated!!/`;
				showToast(
					`${data.cardInfo[data.triggerCards[pos]]?.name} is Activated!`,
					`=> ${data.cardInfo[data.triggerCards[pos]]?.skill.description}!`,
					'success'
				);
			}
		}
	};
</script>

<MainLogic {data} />

{#if !data.walletUser || !data.walletUser.addr || data.walletUser.addr == '' || data.gameStarted === false || (data.gameObject && data.gameObject['game_started'] == false)}
	<img class="not-started" src="/image/battleStart2.png" alt="Let's start the game!" />
{/if}
{#if animationOnFlag}
	<img class="not-started" src="/image/battleStart.png" alt="Let's start the game!" />
{/if}

<Dialog bind:dialog bind:playerName>
	<button disabled={modalDisabled} on:click={data.funcCreatePlayer}>登録</button>
</Dialog>

<Dialog bind:dialog={modal} bind:title>
	<button
		on:click={() => {
			modal.close();
		}}>Got it</button
	>
</Dialog>

<Dialog bind:dialog={enModal} bind:title>
	<button on:click={data.funcPurchaseEN}>Yes</button>
	<button
		on:click={() => {
			enModal.close();
		}}>No</button
	>
</Dialog>

<style lang="scss">
	@import '../style/dialog.scss';
</style>
