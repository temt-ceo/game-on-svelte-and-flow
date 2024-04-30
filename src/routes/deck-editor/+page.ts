import { toasts } from 'svelte-toasts';

export function load({}) {
	return {
		client: null,
		walletUser: null,
		showSpinner: false,
		funcPlayerMatching: null,
		funcSignInWallet: null,
		funcSignOutWallet: null,
		funcCreatePlayer: null,
		funcSaveDeck: null,
		player: null,
		cardInfo: {},
		reserveCardData: [],
		userDeck: [],
		showToast: (title, message, warning) => {
			toasts.add({
				title: title,
				description: message,
				duration: 10000, // 0 or negative to avoid auto-remove
				placement: 'bottom-right',
				type: warning ? 'warning' : 'success',
				theme: 'dark',
				onClick: () => {},
				onRemove: () => {}
			});
		}
	};
}
