import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import config from '../../config.json';
import { toasts, ToastContainer, FlatToast, BootstrapToast } from 'svelte-toasts';

export async function load({ fetch }) {
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
		showToast: (title, message, warning) => {
			const toast = toasts.add({
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
