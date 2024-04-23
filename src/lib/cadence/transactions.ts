export const createPlayer = async function (fcl, address) {
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
