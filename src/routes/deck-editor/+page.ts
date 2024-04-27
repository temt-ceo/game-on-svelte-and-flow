import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import config from '../../config.json';

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
		userDeck: []
	};
}