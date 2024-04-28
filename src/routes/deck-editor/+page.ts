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
		showToast: () => {
			const toast = toasts.add({
				title: 'Message title',
				description: 'Message body',
				duration: 10000, // 0 or negative to avoid auto-remove
				placement: 'bottom-right',
				type: 'success',
				theme: 'dark',
				onClick: () => {},
				onRemove: () => {}
				// component: BootstrapToast, // allows to override toast component/template per toast
			});
			// toast.remove()
		}
	};
}
