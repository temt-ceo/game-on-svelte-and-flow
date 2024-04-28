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
	return result;
};

export const getCurrentStatus = async function (fcl, address) {
	const result = await fcl.query({
		cadence: `
    import CodeOfFlow from 0x24466f7fc36e3388
    pub fun main(address: Address): AnyStruct {
        let account = getAccount(address)
        let cap = account.getCapability<&CodeOfFlow.Player{CodeOfFlow.IPlayerPublic}>(CodeOfFlow.PlayerPublicPath).borrow()
          ?? panic("Doesn't have capability!")
        return cap.get_current_status()
    }
    `,
		args: (arg, t) => [arg(address, t.Address)]
	});
	return result;
};

export const getBalance = async function (fcl, address, playerId) {
	const result = await fcl.query({
		cadence: `
    import FlowToken from 0x1654653399040a61
    import FungibleToken from 0xf233dcee88fe0abe
    import CodeOfFlow from 0x24466f7fc36e3388

    pub fun main(address: Address, player_id: UInt?): [CodeOfFlow.CyberScoreStruct] {
        let account = getAccount(address)
        let vaultRef = account.getCapability(/public/flowTokenBalance).borrow<&FlowToken.Vault{FungibleToken.Balance}>()
            ?? panic("Could not borrow Balance reference to the Vault")

        var retArr: [CodeOfFlow.CyberScoreStruct] = []
        if player_id != nil {
          let cap = getAccount(address).getCapability<&CodeOfFlow.Player{CodeOfFlow.IPlayerPublic}>(CodeOfFlow.PlayerPublicPath).borrow()
              ?? panic("Doesn't have capability!")

          let player_arr = cap.get_players_score()

          let playerCyberData = player_arr[0]
          playerCyberData.balance = vaultRef.balance
          retArr.append(playerCyberData)
          if player_arr.length >= 2 {
            retArr.append(player_arr[1])
          }
          return retArr
        }
        let guestData = CodeOfFlow.CyberScoreStruct(player_name: "Guest")
        guestData.balance = vaultRef.balance
        retArr.append(guestData)
        return retArr
    }
    `,
		args: (arg, t) => [arg(address, t.Address), arg(playerId, t.Optional(t.UInt))]
	});
	return result;
};
