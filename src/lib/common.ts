import { toasts } from 'svelte-toasts';
import {
	ActedUp,
	CanBlock,
	CanAttack,
	CardNotNeedSelectTarget,
	CardNeedsSelectTarget,
	CardNeedsSelectActedTarget,
	CardTriggerWhenPutOnField,
	CardTriggerWhenAttack,
	CardTriggerWhenBlocking,
	CardTriggerWhenTurnEnd,
	CardTriggerWhenBattling
} from '$lib/const';

const wait = (sec) => {
	return new Promise((resolve) => setTimeout(resolve, sec * 1000));
};

export const sleep = async (sec) => {
	await wait(sec);
};

export const showToast = (title, message, style) => {
	toasts.add({
		title: title,
		description: message,
		duration: 10000, // 0 or negative to avoid auto-remove
		placement: 'bottom-right',
		type: style,
		theme: 'dark',
		onClick: () => {},
		onRemove: () => {}
	});
};

export const checkFieldUnitAndTriggerZoneAbilityWhenPutCard = async (
	data,
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
						'Field Unit Card Ability Activated!',
						`${unitAbility?.name} => ${unitAbility?.skill.description}. SELECT ONE TARGET!`,
						'success'
					);
					data.selectTargetType = CardNeedsSelectTarget;
					data.waitPlayerChoice = true;
					await sleep(5); // wait until player choose the target.
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
						'Trigger Card Activated!',
						`${unitAbility?.name} => ${unitAbility?.skill.description}. SELECT ONE TARGET!`,
						'success'
					);
					data.selectTargetType = CardNeedsSelectActedTarget;
					data.waitPlayerChoice = true;
					await sleep(5); // wait until player choose the target.
					break;
				}
			}
		}
	}

	const usedTriggers = [];
	// Trigger Zone
	for (const pos of [1, 2, 3, 4]) {
		if (data.cardInfo[data.triggerCards[pos]]?.skill.trigger_1 == CardTriggerWhenPutOnField) {
			// Is needed to select enemy unit?
			if (data.cardInfo[data.triggerCards[pos]]?.skill.ask_1 == CardNeedsSelectTarget) {
				// Are there target unit?
				for (const pos of [1, 2, 3, 4, 5]) {
					if (data.gameObject.opponent_field_unit_action[pos]) {
						usedTriggers.push(pos);
						// default target is most left unit.
						data.skillTargetUnitPos = pos;
						skillMessage += `${data.cardInfo[data.triggerCards[pos]]?.name} Trigger Card Activated!!/`;
						showToast(
							'Trigger Card Activated!',
							`${data.cardInfo[data.triggerCards[pos]]?.name} => ${data.cardInfo[data.triggerCards[pos]]?.skill.description}. SELECT ONE TARGET!`,
							'success'
						);
						data.selectTargetType = CardNeedsSelectTarget;
						data.waitPlayerChoice = true;
						await sleep(5); // wait until player choose the target.
						break;
					}
				}
				// Is needed to select acted-up enemy unit?
			} else if (data.cardInfo[data.triggerCards[pos]]?.skill.ask_1 == CardNeedsSelectActedTarget) {
				// Are there target unit?
				for (const pos of [1, 2, 3, 4, 5]) {
					if (data.gameObject.opponent_field_unit_action[pos] == ActedUp) {
						usedTriggers.push(pos);
						// default target is most left unit.
						data.skillTargetUnitPos = pos;
						skillMessage += `${data.cardInfo[data.triggerCards[pos]]?.name} Trigger Card Activated!!/`;
						showToast(
							'Trigger Card Activated!',
							`${data.cardInfo[data.triggerCards[pos]]?.name} => ${data.cardInfo[data.triggerCards[pos]]?.skill.description}. SELECT ONE TARGET!`,
							'success'
						);
						data.selectTargetType = CardNeedsSelectActedTarget;
						data.waitPlayerChoice = true;
						await sleep(5); // wait until player choose the target.
						break;
					}
				}
			} else if (data.cardInfo[data.triggerCards[pos]]?.skill.ask_1 == CardNotNeedSelectTarget) {
				usedTriggers.push(pos);
				skillMessage += `${data.cardInfo[data.triggerCards[pos]]?.name} Trigger Card Activated!!/`;
				showToast(
					'Trigger Card Activated!',
					`${data.cardInfo[data.triggerCards[pos]]?.name} => ${data.cardInfo[data.triggerCards[pos]]?.skill.description}!`,
					'success'
				);
			}
		}
	}
	data.funcPutCardOnTheField(putCardOnFieldPosition, usedTriggers, skillMessage);
	// Initialization
	data.selectTargetType = null;
	data.waitPlayerChoice = false;
};

export const checkFieldUnitAbilityWhenTurnChange = (data) => {
	for (const pos of [1, 2, 3, 4, 5]) {
		if (data.cardInfo[data.fieldCards[pos]]?.skill.trigger_1 == CardTriggerWhenTurnEnd) {
			showToast(
				'Field Unit Card Ability Activated!',
				`${data.cardInfo[data.fieldCards[pos]]?.name} => ${data.cardInfo[data.fieldCards[pos]]?.skill.description}. SELECT ONE TARGET!`,
				'success'
			);
		}
	}
};

export const checkFieldUnitAndTriggerZoneAbilityWhenAttack = async (data, unitAbility) => {
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
						'Field Unit Card Ability Activated!',
						`${unitAbility?.name} => ${unitAbility?.skill.description}. SELECT ONE TARGET!`,
						'success'
					);
					data.selectTargetType = CardNeedsSelectTarget;
					data.waitPlayerChoice = true;
					await sleep(5); // wait until player choose the target.
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
						'Trigger Card Activated!',
						`${unitAbility?.name} => ${unitAbility?.skill.description}. SELECT ONE TARGET!`,
						'success'
					);
					data.selectTargetType = CardNeedsSelectActedTarget;
					data.waitPlayerChoice = true;
					await sleep(5); // wait until player choose the target.
					break;
				}
			}
		}
	}

	const usedTriggers = [];
	// Trigger Zone
	for (const pos of [1, 2, 3, 4]) {
		if (data.cardInfo[data.triggerCards[pos]]?.skill.trigger_1 == CardTriggerWhenPutOnField) {
			// Is needed to select enemy unit?
			if (data.cardInfo[data.triggerCards[pos]]?.skill.ask_1 == CardNeedsSelectTarget) {
				// Are there target unit?
				for (const pos of [1, 2, 3, 4, 5]) {
					if (data.gameObject.opponent_field_unit_action[pos]) {
						usedTriggers.push(pos);
						// default target is most left unit.
						data.skillTargetUnitPos = pos;
						skillMessage += `${data.cardInfo[data.triggerCards[pos]]?.name} Trigger Card Activated!!/`;
						showToast(
							'Trigger Card Activated!',
							`${data.cardInfo[data.triggerCards[pos]]?.name} => ${data.cardInfo[data.triggerCards[pos]]?.skill.description}. SELECT ONE TARGET!`,
							'success'
						);
						data.selectTargetType = CardNeedsSelectTarget;
						data.waitPlayerChoice = true;
						await sleep(5); // wait until player choose the target.
						break;
					}
				}
				// Is needed to select acted-up enemy unit?
			} else if (data.cardInfo[data.triggerCards[pos]]?.skill.ask_1 == CardNeedsSelectActedTarget) {
				// Are there target unit?
				for (const pos of [1, 2, 3, 4, 5]) {
					if (data.gameObject.opponent_field_unit_action[pos] == ActedUp) {
						usedTriggers.push(pos);
						// default target is most left unit.
						data.skillTargetUnitPos = pos;
						skillMessage += `${data.cardInfo[data.triggerCards[pos]]?.name} Trigger Card Activated!!/`;
						showToast(
							'Trigger Card Activated!',
							`${data.cardInfo[data.triggerCards[pos]]?.name} => ${data.cardInfo[data.triggerCards[pos]]?.skill.description}. SELECT ONE TARGET!`,
							'success'
						);
						data.selectTargetType = CardNeedsSelectActedTarget;
						data.waitPlayerChoice = true;
						await sleep(5); // wait until player choose the target.
						break;
					}
				}
			} else if (data.cardInfo[data.triggerCards[pos]]?.skill.ask_1 == CardNotNeedSelectTarget) {
				usedTriggers.push(pos);
				skillMessage += `${data.cardInfo[data.triggerCards[pos]]?.name} Trigger Card Activated!!/`;
				showToast(
					'Trigger Card Activated!',
					`${data.cardInfo[data.triggerCards[pos]]?.name} => ${data.cardInfo[data.triggerCards[pos]]?.skill.description}!`,
					'success'
				);
			}
		}
	}
	data.usedTriggers = usedTriggers;
	data.skillMessage = skillMessage;
	return data;
};

export const checkTriggerZoneAbilityWhenBattle = async (data) => {
	let skillMessage = '';

	const usedTriggers = [];
	// Trigger Zone
	for (const pos of [1, 2, 3, 4]) {
		if (data.cardInfo[data.triggerCards[pos]]?.skill.trigger_1 == CardTriggerWhenBattling) {
			usedTriggers.push(pos);
			skillMessage += `${data.cardInfo[data.triggerCards[pos]]?.name} Trigger Card Activated!!/`;
			showToast(
				'Trigger Card Activated!',
				`${data.cardInfo[data.triggerCards[pos]]?.name} => ${data.cardInfo[data.triggerCards[pos]]?.skill.description}!`,
				'success'
			);
		}
	}
	data.usedTriggers = usedTriggers;
	data.skillMessage = skillMessage;
	return data;
};
