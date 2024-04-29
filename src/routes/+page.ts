import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import config from '../config.json';
import { toasts } from 'svelte-toasts';

/** @type {import('./$types').Load} */
export async function load({}) {
	Amplify.configure(config);
	const client = generateClient();

	return {
		client: client,
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
		yourCp: 0,
		handCards: [],
		opponetHandCards: 0,
		triggerCards: [],
		opponetTriggerCards: 0,
		fieldCards: [],
		opponetFieldCards: [],
		mariganClickCount: 0,
		yourInfo: {},
		opponentInfo: {},
		gameObject: null,
		mariganCards: [],
		onChainYourFieldUnit: [],
		onChainYourTriggerCards: [],
		onChainYourTriggerCardsDisplay: [],
		canMarigan: false,
		canOperate: false,
		gameStarted: false,
		countdown: false,
		showToast: (title, message, style) => {
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
		}
	};
}
