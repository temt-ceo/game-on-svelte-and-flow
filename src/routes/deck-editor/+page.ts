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
		userDeck: []
	};
}
