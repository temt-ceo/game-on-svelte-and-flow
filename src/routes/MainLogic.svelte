<script lang="ts">
	import { Clock } from 'svelte-loading-spinners';
	import MainContents from './MainContents.svelte';
	import { onCreateGameServerProcess } from '../graphql/subscriptions';
	import { sleep, showToast } from '$lib/common';
	import {
		ActedUp,
		CardNotNeedSelectTarget,
		CardNeedsSelectTarget,
		CardNeedsSelectActedTarget,
		CardTriggerWhenPutOnField
	} from '$lib/const';

	export let data;

	// click event handler
	data.showHandCardInfo = (e: Event) => {
		const index = parseInt((e.target as HTMLElement).getAttribute('id'));
		const card_id = data.handCards[index];
		data.selectedCard = data.cardInfo[card_id];
	};
	data.showCardInfo = (e: Event) => {
		const card_id = parseInt((e.target as HTMLElement).getAttribute('id'));
		data.selectedCard = data.cardInfo[card_id];
	};
	data.selectDefendUnit = (position) => {
		data.defendUnitPosition = position;
	};

	// drag & drop event handler
	data.dragFromHand = (e: DragEvent) => {
		data.draggingCardIndex = parseInt((e.target as HTMLElement).getAttribute('id'));
		data.draggingCardId = data.handCards[data.draggingCardIndex];
		data.selectedCard = data.cardInfo[data.draggingCardId];
	};

	data.dropToBattleField = () => {
		// PUT CARD ON THE BATTLE FIELD
		let putCardOnFieldPosition = 0;
		if (
			parseInt(data.draggingCardId) <= 16 &&
			Object.keys(data.fieldCards).length < 5 &&
			data.gameObject['is_first'] == data.gameObject['is_first_turn'] &&
			parseInt(data.selectedCard.cost) <= data.yourCp
		) {
			const targetCard = data.handCards.splice(data.draggingCardIndex, 1);
			for (const pos of [1, 2, 3, 4, 5]) {
				if (!data.fieldCards[pos]) {
					data.fieldCards[pos] = targetCard[0];
					putCardOnFieldPosition = pos;
					break;
				}
			}
			data.yourCp -= parseInt(data.selectedCard.cost);
			data.isDraggingOverBattleField = false;

			// Check Field Unit & Trigger Zone Ability
			checkFieldUnitAndTriggerZoneAbilityWhenPutCard(
				putCardOnFieldPosition,
				data.cardInfo[targetCard[0]]
			);
		}
		if (data.isDraggingNGOverBattleField) {
			data.isDraggingNGOverBattleField = false;
		}
	};
	data.dropToTriggerZone = (e: DragEvent) => {
		// PUT CARD ON THE TRIGGER ZONE
		if (
			parseInt(data.draggingCardId) > 16 &&
			Object.keys(data.triggerCards).length < 4 &&
			data.gameObject['is_first'] == data.gameObject['is_first_turn']
		) {
			const targetCard = data.handCards.splice(data.draggingCardIndex, 1);
			for (const pos of [1, 2, 3, 4]) {
				if (!data.triggerCards[pos]) {
					data.triggerCards[pos] = targetCard[0];
					break;
				}
			}
			data.isDraggingOverTriggerZone = false;
		}
		if (data.isDraggingNGOverBattleField) {
			data.isDraggingNGOverTriggerZone = false;
		}
	};
	data.dragEnterToBattleField = (e: DragEvent) => {
		if (
			parseInt(data.draggingCardId) <= 16 &&
			Object.keys(data.fieldCards).length < 5 &&
			parseInt(data.selectedCard.cost) <= data.yourCp &&
			data.gameObject['is_first'] == data.gameObject['is_first_turn']
		) {
			data.isDraggingOverBattleField = true;
		} else {
			data.isDraggingNGOverBattleField = true;
		}
	};
	data.dragEnterToTriggerZone = (e: DragEvent) => {
		if (
			parseInt(data.draggingCardId) > 16 &&
			Object.keys(data.triggerCards).length < 4 &&
			data.gameObject['is_first'] == data.gameObject['is_first_turn']
		) {
			data.isDraggingOverTriggerZone = true;
		} else {
			data.isDraggingNGOverTriggerZone = true;
		}
	};
	data.dragLeaveToBattleField = (e: DragEvent) => {
		// data.isDraggingOverBattleField = false; // To avoid overly sensitive reaction.
		data.isDraggingNGOverBattleField = false;
	};
	data.dragLeaveToTriggerZone = (e: DragEvent) => {
		data.isDraggingOverTriggerZone = false;
		data.isDraggingNGOverTriggerZone = false;
	};
	data.dragOver = (e: DragEvent) => {
		e.preventDefault();
	};

	// button function
	data.retryMarigan = () => {
		data.mariganClickCount++;
		if (data.mariganClickCount < 5) {
			data.handCards = data.mariganCards[data.mariganClickCount];
		}
	};

	/** GraphQL Subscribition part */
	data.client.graphql({ query: onCreateGameServerProcess }).subscribe({
		next: (gameProcess) => {
			const retSubscription = gameProcess.data?.onCreateGameServerProcess;
			const msg = JSON.parse(retSubscription.message.split(',TransactionID:')[0]);
			console.log(retSubscription);
			switch (retSubscription.type) {
				case 'player_matching':
					if (data.player.playerId == retSubscription.playerId) {
						data.countdown = true;
						setTimeout(() => {
							data.countdown = false;
						}, 66000);
						showToast(
							'Success!',
							`You successfully entered in Alcana. Now matching is started.`,
							'success'
						);
					} else {
						showToast(
							'Warning!!',
							`No. ${retSubscription.playerId} has entered in Alcana.`,
							'warning'
						);
					}
					break;
				case 'game_start':
					if (data.player.playerId == data.player?.playerId) {
						showToast(
							'Your first cards are sent to blockchain. Please wait.',
							'Please wait a moment while loading the data.',
							'success'
						);
					} else if (data.player.playerId == data.gameObject.opponent) {
						showToast(
							`Opponent's first cards are sent to blockchain. Please wait.`,
							'Please wait a moment while loading the data.',
							'info'
						);
					}
					break;
				case 'put_card_on_the_field':
					data.showSpinner = true;
					showToast('The card drive transaction Called!', msg['skillMessage'] ?? '', 'info');
					sleep(7);
					data.showSpinner = false;
					break;
				case 'turn_change':
					data.showSpinner = true;
					showToast('Turn Change transaction Called!', '', 'info');
					sleep(7);
					data.showSpinner = false;
					break;
				case 'attack':
					// rival's attack
					if (data.gameObject?.opponent == retSubscription.playerId) {
						data.attackerUsedInterceptCardPositions = msg['arg4'];
						data.attackerUsedCardIds = msg['usedCardIds'];

						if (msg.canBlock) {
							data.waitPlayerChoice = true;
							showToast(`Opponent attacked!`, 'Take an action!!', 'error');
							sleep(7);
							data.funcBattleReaction();
						} else {
							console.log(msg, msg['canBlock'], 777);
							// Valkyrie
							showToast(
								`Opponent's attack!`,
								`Valkyrie's ability is activated! Cannot Block!`,
								'warning'
							);
						}
					}
					break;
				case 'battle_reaction':
					const onDefendPosition = msg['arg1'];
					if (data.gameObject?.opponent == retSubscription.playerId) {
						// rival's attack
						if (onDefendPosition) {
							showToast(`Opponent blocked!`, `Battle!`, 'success');
						}
					}
					break;
				case 'defence_action':
					if (data.gameObject?.opponent == retSubscription.playerId) {
						// rival's attack
						const onDefendPosition = msg['arg1'];
						if (onDefendPosition) {
							showToast(`The block wes implemented!!`, `Battle!`, 'success');
						} else {
							showToast(`Geez1`, 'You took 1 damage!!', 'error');
						}
					} else {
						const onDefendPosition = msg['arg1'];
						if (onDefendPosition) {
							showToast(`Opponent blocked!`, `Battle!`, 'success');
						} else {
							showToast(`Opponent doesn't block!`, 'Damage opponent 1 life!', 'success');
						}
					}
					break;
			}
		}
	});

	const checkFieldUnitAndTriggerZoneAbilityWhenPutCard = async (
		putCardOnFieldPosition,
		unitAbility
	) => {
		let skillMessage = '';
		// Field Unit
		if (unitAbility?.skill.trigger_1 == CardTriggerWhenPutOnField) {
			// Is needed to select enemy unit?
			if (unitAbility?.skill.ask_1 == CardNeedsSelectTarget) {
				// Are there target unit?
				for (const pos of [1, 2, 3, 4, 5]) {
					if (data.gameObject.opponent_field_unit_action[pos]) {
						// default target is most left unit.
						data.skillTargetUnitPos = pos;
						skillMessage += `${unitAbility?.name} Ability Activated!!/`;
						showToast(
							`${unitAbility?.name} is Ability Activated! 【SELECT ONE TARGET!】`,
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
						skillMessage += `${unitAbility?.name} Ability Activated!!/`;
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
							skillMessage += `${data.cardInfo[data.triggerCards[pos]]?.name} Trigger Card Activated!!/`;
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
							skillMessage += `${data.cardInfo[data.triggerCards[pos]]?.name} Trigger Card Activated!!/`;
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
					skillMessage += `${data.cardInfo[data.triggerCards[pos]]?.name} Trigger Card Activated!!/`;
					showToast(
						`${data.cardInfo[data.triggerCards[pos]]?.name} is Activated!`,
						`=> ${data.cardInfo[data.triggerCards[pos]]?.skill.description}!`,
						'success'
					);
				}
			}
		}
		data.funcPutCardOnTheField(putCardOnFieldPosition, skillMessage);
		// Initialization
		data.selectTargetType = null;
		data.waitPlayerChoice = false;
	};
</script>

{#if data.countdown}
	<div class="clock">
		<Clock size="160" color="#4C7D8E" unit="px" duration="240s" pause={false} />
	</div>
{/if}

<MainContents {data} />

<style lang="scss">
	@import '../style/dialog.scss';
</style>
