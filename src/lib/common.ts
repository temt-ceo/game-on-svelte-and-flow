import { isRegistered, getPlayerDeck, getCardInfo } from '$lib/cadence/scripts';

export const getPlayerInfo = async (data, dialog) => {
	if (data.walletUser.addr != '') {
		data.showSpinner = true;
		var ret = await isRegistered(data.fcl, data.walletUser.addr);
		data.showSpinner = false;
		console.log(`isRegistered ret: ${ret}`);
		if (ret != null) {
			data.player = {
				playerId: ret.player_id,
				playerName: ret.nickname,
				playerUUId: ret.uuid
			};
			data.userDeck = await getPlayerDeck(
				data.fcl,
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

export const getCardInfos = async (data) => {
	// カード情報取得
	try {
		data.cardInfo = await getCardInfo(data.fcl);

		// Create Card Info Array
		const cardList = Object.keys(data.cardInfo);
		for (const id of cardList) {
			data.reserveCardData.push(data.cardInfo[id].card_id);
		}
		// widget.callback('card-info', player.playerId, null, null, objJs);
	} catch (e) {}
};
