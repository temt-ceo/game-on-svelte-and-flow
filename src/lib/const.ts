import { toasts } from 'svelte-toasts';

export const ActedUp = '0';
export const CanBlock = '1';
export const CanAttack = '2';

export const CardTriggerWhenPutOnField = '1';
export const CardTriggerWhenAttack = '2';
export const CardTriggerWhenBlocking = '3';
export const CardTriggerWhenTurnEnd = '4';
export const CardTriggerWhenBattling = '5';

export const CardNeedsSelectTarget = '1';
export const CardNeedsSelectActedTarget = '2';

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
