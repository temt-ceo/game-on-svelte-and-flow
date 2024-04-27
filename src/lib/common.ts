import { isRegistered, getPlayerDeck, getCardInfo } from '$lib/cadence/scripts';

export const getPlayerInfo = async (data, fcl, dialog) => {
	if (data.walletUser.addr != '') {
		data.showSpinner = true;
		var ret = await isRegistered(fcl, data.walletUser.addr);
		data.showSpinner = false;
		console.log(`isRegistered ret: ${ret}`);
		if (ret != null) {
			data.player = {
				playerId: ret.player_id,
				playerName: ret.nickname,
				playerUUId: ret.uuid
			};
			data.userDeck = await getPlayerDeck(
				fcl,
				data.walletUser.addr,
				parseInt(data.player.playerId)
			);
			clearInterval(data.intervalRet);
		} else {
			dialog.showModal();
		}
		console.log(data.player, `isRegistered: ${ret}`);
	}
};

export const getCardInfos = async (data, fcl) => {
	// カード情報取得
	try {
		data.cardInfo = await getCardInfo(fcl);
		console.log(data.cardInfo);
		// widget.callback('card-info', player.playerId, null, null, objJs);
	} catch (e) {}
};
