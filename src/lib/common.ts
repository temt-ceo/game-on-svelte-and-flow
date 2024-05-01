import { toasts } from 'svelte-toasts';

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
