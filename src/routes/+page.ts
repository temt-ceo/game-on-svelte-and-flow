import { toasts } from 'svelte-toasts';

const wait = (sec) => {
	return new Promise((resolve) => setTimeout(resolve, sec * 1000));
};

const sleep = async (sec) => {
	await wait(sec);
};

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
		funcPutCardOnTheField: null,
		funcTurnEnd: null,
		player: null,
		cardInfo: {},
		reserveCardData: [],
		userDeck: [],
		yourCp: 0,
		handCards: [],
		fieldCards: {},
		triggerCards: {},
		mariganClickCount: 0,
		yourInfo: {},
		opponentInfo: {},
		gameObject: null,
		mariganCards: [],
		onChainYourFieldUnit: [],
		onChainYourTriggerCards: [],
		onChainYourTriggerCardsDisplay: [],
		skillTargetUnitPos: 0,
		canMarigan: false,
		canOperate: false,
		gameStarted: false,
		countdown: false,
		sleep: sleep,
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
