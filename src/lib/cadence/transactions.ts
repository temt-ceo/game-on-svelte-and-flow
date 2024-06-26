export const createPlayer = async function (fcl, playerName) {
	var transactionId = await fcl.mutate({
		cadence: `
      import FlowToken from 0x1654653399040a61
      import FungibleToken from 0xf233dcee88fe0abe
      import CodeOfFlow from 0x24466f7fc36e3388

      transaction(nickname: String) {
        prepare(signer: AuthAccount) {
          let FlowTokenReceiver = signer.getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver)

          signer.save(<- CodeOfFlow.createPlayer(nickname: nickname, flow_vault_receiver: FlowTokenReceiver), to: CodeOfFlow.PlayerStoragePath)
          signer.link<&CodeOfFlow.Player{CodeOfFlow.IPlayerPublic}>(CodeOfFlow.PlayerPublicPath, target: CodeOfFlow.PlayerStoragePath)
          }
        execute {
          log("success")
        }
      }
    `,
		args: function args(arg, t) {
			return [arg(playerName ? playerName : 'Test Player', t.String)];
		},
		proposer: fcl.authz,
		payer: fcl.authz,
		authorizations: [fcl.authz],
		limit: 999
	});
	console.log('TransactionId: ' + transactionId);
};

export const purchaseCyberEN = async (fcl) => {
	const transactionId = await fcl.mutate({
		cadence: `
      import FlowToken from 0x1654653399040a61
      import FungibleToken from 0xf233dcee88fe0abe
      import CodeOfFlow from 0x24466f7fc36e3388

      transaction() {
        prepare(signer: AuthAccount) {
          let payment <- signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)!.withdraw(amount: 1.0) as! @FlowToken.Vault

          let player = signer.borrow<&CodeOfFlow.Player>(from: CodeOfFlow.PlayerStoragePath)
              ?? panic("Could not borrow reference to the Owner's Player Resource.")
          player.buy_en(payment: <- payment)
        }
        execute {
          log("success")
        }
      }
    `,
		args: (arg, t) => [],
		proposer: fcl.authz,
		payer: fcl.authz,
		authorizations: [fcl.authz],
		limit: 999
	});
	console.log(`TransactionId: ${transactionId}`);
};
