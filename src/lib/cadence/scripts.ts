export const isRegistered = async function (fcl, address) {
	const result = await fcl.query({
		cadence: `
    import CodeOfFlow from 0x24466f7fc36e3388
    pub fun main(address: Address): &CodeOfFlow.Player{CodeOfFlow.IPlayerPublic}? {
        let account = getAccount(address)
        return account.getCapability<&CodeOfFlow.Player{CodeOfFlow.IPlayerPublic}>(CodeOfFlow.PlayerPublicPath).borrow()
    }
    `,
		args: (arg, t) => [arg(address, t.Address)]
	});
	return result;
};

export const getPlayerDeck = async function (fcl, address, playerId) {
	const result = await fcl.query({
		cadence: `
    import CodeOfFlow from 0x24466f7fc36e3388
    pub fun main(address: Address, player_id: UInt): [UInt16] {
        let account = getAccount(address)
        let cap = account.getCapability<&CodeOfFlow.Player{CodeOfFlow.IPlayerPublic}>(CodeOfFlow.PlayerPublicPath).borrow()
          ?? panic("Doesn't have capability!")
        return cap.get_player_deck(player_id: player_id)
    }
    `,
		args: (arg, t) => [arg(address, t.Address), arg(playerId, t.UInt)]
	});
	console.log(result);
	return result;
};

export const getCardInfo = async function (fcl) {
	const result = await fcl.query({
		cadence: `
    import CodeOfFlow from 0x24466f7fc36e3388
    pub fun main(): {UInt16: CodeOfFlow.CardStruct} {
        return CodeOfFlow.getCardInfo()
    }
    `,
		args: (arg, t) => []
	});
	console.log(result);
	return result;
};
