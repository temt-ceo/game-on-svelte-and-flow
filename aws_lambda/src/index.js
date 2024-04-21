const fs = require('fs');
const fcl = require("@onflow/fcl");
const t = require("@onflow/types");
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { SHA3 } = require("sha3");

const FlowTransactions = {
  saveDeck: `
    import CodeOfFlow from 0x24466f7fc36e3388

    transaction(player_id: UInt, user_deck: [UInt16]) {
      prepare(signer: AuthAccount) {
        let admin = signer.borrow<&CodeOfFlow.Admin>(from: CodeOfFlow.AdminStoragePath)
          ?? panic("Could not borrow reference to the Administrator Resource.")
        admin.save_deck(player_id: player_id, user_deck: user_deck)
      }
      execute {
        log("success")
      }
    }
  `,
  matchingStart: `
    import CodeOfFlow from 0x24466f7fc36e3388

    transaction(player_id: UInt) {
      prepare(signer: AuthAccount) {
        let admin = signer.borrow<&CodeOfFlow.Admin>(from: CodeOfFlow.AdminStoragePath)
          ?? panic("Could not borrow reference to the Administrator Resource.")
        admin.matching_start(player_id: player_id)
      }
      execute {
        log("success")
      }
    }
  `,
  gameStart: `
    import CodeOfFlow from 0x24466f7fc36e3388

    transaction(player_id: UInt, drawed_cards: [UInt16]) {
      prepare(signer: AuthAccount) {
        let admin = signer.borrow<&CodeOfFlow.Admin>(from: CodeOfFlow.AdminStoragePath)
          ?? panic("Could not borrow reference to the Administrator Resource.")
        admin.game_start(player_id: player_id, drawed_cards: drawed_cards)
      }
      execute {
        log("success")
      }
    }
  `,
  putCardOnField: `
    import CodeOfFlow from 0x24466f7fc36e3388

    transaction(player_id: UInt, unit_card: {UInt8: UInt16}, enemy_skill_target: UInt8?, trigger_cards: {UInt8: UInt16}, used_intercept_positions: [UInt8]) {
      prepare(signer: AuthAccount) {
        let admin = signer.borrow<&CodeOfFlow.Admin>(from: CodeOfFlow.AdminStoragePath)
          ?? panic("Could not borrow reference to the Administrator Resource.")
        admin.put_card_on_the_field(player_id: player_id, unit_card: unit_card, enemy_skill_target: enemy_skill_target, trigger_cards: trigger_cards, used_intercept_positions: used_intercept_positions)
      }
      execute {
        log("success")
      }
    }
  `,
  attack: `
    import CodeOfFlow from 0x24466f7fc36e3388

    transaction(player_id: UInt, attack_unit: UInt8, enemy_skill_target: UInt8?, trigger_cards: {UInt8: UInt16}, used_intercept_positions: [UInt8]) {
      prepare(signer: AuthAccount) {
        let admin = signer.borrow<&CodeOfFlow.Admin>(from: CodeOfFlow.AdminStoragePath)
          ?? panic("Could not borrow reference to the Administrator Resource.")
        admin.attack(player_id: player_id, attack_unit: attack_unit, enemy_skill_target: enemy_skill_target, trigger_cards: trigger_cards, used_intercept_positions: used_intercept_positions)
      }
      execute {
        log("success")
      }
    }
  `,
  defenceAction: `
    import CodeOfFlow from 0x24466f7fc36e3388

    transaction(player_id: UInt, opponent_defend_position: UInt8?, attacker_used_intercept_positions: [UInt8], defender_used_intercept_positions: [UInt8]) {
      prepare(signer: AuthAccount) {
        let admin = signer.borrow<&CodeOfFlow.Admin>(from: CodeOfFlow.AdminStoragePath)
          ?? panic("Could not borrow reference to the Administrator Resource.")
        admin.defence_action(player_id: player_id, opponent_defend_position: opponent_defend_position, attacker_used_intercept_positions: attacker_used_intercept_positions, defender_used_intercept_positions: defender_used_intercept_positions)
      }
      execute {
        log("success")
      }
    }
  `,
  turnChange: `
    import CodeOfFlow from 0x24466f7fc36e3388

    transaction(player_id: UInt, from_opponent: Bool, trigger_cards: {UInt8: UInt16}) {
      prepare(signer: AuthAccount) {
        let admin = signer.borrow<&CodeOfFlow.Admin>(from: CodeOfFlow.AdminStoragePath)
          ?? panic("Could not borrow reference to the Administrator Resource.")
        admin.turn_change(player_id: player_id, from_opponent: from_opponent, trigger_cards: trigger_cards)
      }
      execute {
        log("success")
      }
    }
  `,
  startYourTurn: `
    import CodeOfFlow from 0x24466f7fc36e3388

    transaction(player_id: UInt, blocked_unit: {UInt8: UInt8}, used_intercept_position: {UInt8: UInt8}) {
      prepare(signer: AuthAccount) {
        let admin = signer.borrow<&CodeOfFlow.Admin>(from: CodeOfFlow.AdminStoragePath)
          ?? panic("Could not borrow reference to the Administrator Resource.")
        admin.start_your_turn_and_draw_two_cards(player_id: player_id, blocked_unit: blocked_unit, used_intercept_position: used_intercept_position)
      }
      execute {
        log("success")
      }
    }
  `,
  surrender: `
    import CodeOfFlow from 0x24466f7fc36e3388

    transaction(player_id: UInt) {
      prepare(signer: AuthAccount) {
        let admin = signer.borrow<&CodeOfFlow.Admin>(from: CodeOfFlow.AdminStoragePath)
          ?? panic("Could not borrow reference to the Administrator Resource.")
        admin.surrender(player_id: player_id)
      }
      execute {
        log("success")
      }
    }
  `,
  editCardInfo: `
    import CodeOfFlow from 0x24466f7fc36e3388

    transaction() {
      prepare(signer: AuthAccount) {
        let admin = signer.borrow<&CodeOfFlow.Admin>(from: CodeOfFlow.AdminStoragePath)
          ?? panic("Could not borrow reference to the Administrator Resource.")
        admin.edit_card_info()
      }
      execute {
        log("success")
      }
    }
  `,
  claimWin: `
    import CodeOfFlow from 0x24466f7fc36e3388

    transaction(player_id: UInt) {
      prepare(signer: AuthAccount) {
        let admin = signer.borrow<&CodeOfFlow.Admin>(from: CodeOfFlow.AdminStoragePath)
          ?? panic("Could not borrow reference to the Administrator Resource.")
        admin.claimWin(player_id: player_id)
      }
      execute {
        log("success")
      }
    }
  `,
}

exports.handler = async function (event) {
  console.log("Event", JSON.stringify(event, 3))
  const input = event.arguments?.input || {};
  let player_id = input.playerId ? parseInt(input.playerId) : 0;

  if (input.type === "battle_reaction") {
    return {
      id: new Date().getTime(),
      type: input.type || "",
      message: input.message,
      playerId: player_id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  let transactionId;
  try {
    let message = input.message ? JSON.parse(input.message) : {};

    var KEY_ID_IT = 1
    if (fs.existsSync('/tmp/sequence.txt')) {
      KEY_ID_IT = parseInt(fs.readFileSync('/tmp/sequence.txt', {encoding: 'utf8'}));
    } else {
      KEY_ID_IT = (new Date()).getMilliseconds() % 300;
    }
    KEY_ID_IT = !KEY_ID_IT || KEY_ID_IT >= 300 ? 1 : KEY_ID_IT + 1
    fs.writeFileSync('/tmp/sequence.txt', KEY_ID_IT.toString());
    console.log('KEY_ID_IT', KEY_ID_IT);

    const client = new SecretsManagerClient({region: "ap-northeast-1"});
    const response = await client.send(new GetSecretValueCommand({
      SecretId: "PrivateKeyForMainnet",
      VersionStage: "AWSCURRENT",
    }));

    const EC = require('elliptic').ec;

    const ec = new EC('p256');
    fcl.config()
      .put("accessNode.api", "https://rest-mainnet.onflow.org")

    // CHANGE THESE THINGS FOR YOU
    const PRIVATE_KEY = JSON.parse(response.SecretString)?.SmartContractPKForMainnet;
    const ADDRESS = "0x24466f7fc36e3388";
    const KEY_ID = 0;
    const CONTRACT_NAME = "CodeOfFlow";

    const sign = (message) => {
      const key = ec.keyFromPrivate(Buffer.from(PRIVATE_KEY, "hex"))
      const sig = key.sign(hash(message)) // hashMsgHex -> hash
      const n = 32
      const r = sig.r.toArrayLike(Buffer, "be", n)
      const s = sig.s.toArrayLike(Buffer, "be", n)
      return Buffer.concat([r, s]).toString("hex")
    }
    const hash = (message) => {
      const sha = new SHA3(256);
      sha.update(Buffer.from(message, "hex"));
      return sha.digest();
    }

    async function authorizationFunction(account) {
      return {
        ...account,
        tempId: `${ADDRESS}-${KEY_ID}`,
        addr: fcl.sansPrefix(ADDRESS),
        keyId: Number(KEY_ID),
        signingFunction: async (signable) => {
          return {
            addr: fcl.withPrefix(ADDRESS),
            keyId: Number(KEY_ID),
            signature: sign(signable.message)
          }
        }
      }
    }
    async function authorizationFunctionProposer(account) {
      return {
        ...account,
        tempId: `${ADDRESS}-${KEY_ID_IT}`,
        addr: fcl.sansPrefix(ADDRESS),
        keyId: Number(KEY_ID_IT),
        signingFunction: async (signable) => {
          return {
            addr: fcl.withPrefix(ADDRESS),
            keyId: Number(KEY_ID_IT),
            signature: sign(signable.message)
          }
        }
      }
    }
    // Save the player's card deck.
    if (input.type === "save_deck") {
      transactionId = await fcl.mutate({
        cadence: FlowTransactions.saveDeck,
        args: (arg, t) => [
          arg(player_id, t.UInt),
          arg(message, t.Array(t.UInt16))
        ],
        proposer: authorizationFunctionProposer,
        payer: authorizationFunction,
        authorizations: [authorizationFunction],
        limit: 999
      })
      console.log(`TransactionId: ${transactionId}`)
      message = `Transaction[game_start] is On Going. TransactionId: ${transactionId}`
      fcl.tx(transactionId).subscribe(res => {
        console.log(res);
      })
    // player matching.
    } else if (input.type === "player_matching") {
      transactionId = await fcl.mutate({
        cadence: FlowTransactions.matchingStart,
        args: (arg, t) => [
          arg(player_id, t.UInt)
        ],
        proposer: authorizationFunctionProposer,
        payer: authorizationFunction,
        authorizations: [authorizationFunction],
        limit: 999
      })
      console.log(`TransactionId: ${transactionId}`)
      message = `Transaction[player_matching] is On Going. TransactionId: ${transactionId}`
      fcl.tx(transactionId).subscribe(res => {
        console.log(res);
      })
    // start the game.
    } else if (input.type === "game_start") {
      transactionId = await fcl.mutate({
        cadence: FlowTransactions.gameStart,
        args: (arg, t) => [
          arg(player_id, t.UInt),
          arg(message, t.Array(t.UInt16))
        ],
        proposer: authorizationFunctionProposer,
        payer: authorizationFunction,
        authorizations: [authorizationFunction],
        limit: 999
      })
      console.log(`TransactionId: ${transactionId}`)
      message = `Transaction[game_start] is On Going. TransactionId: ${transactionId}`
      fcl.tx(transactionId).subscribe(res => {
        console.log(res);
      })
    // put card on field.
    } else if (input.type === "put_card_on_the_field") {
      const arg1 = [];
      if (message.arg1['1']) {
        arg1.push({key: 1, value: message.arg1['1']});
      }
      if (message.arg1['2']) {
        arg1.push({key: 2, value: message.arg1['2']});
      }
      if (message.arg1['3']) {
        arg1.push({key: 3, value: message.arg1['3']});
      }
      if (message.arg1['4']) {
        arg1.push({key: 4, value: message.arg1['4']});
      }
      if (message.arg1['5']) {
        arg1.push({key: 5, value: message.arg1['5']});
      }
      const arg3 = [
        {key: 1, value: message.arg3['1'] || 0},
        {key: 2, value: message.arg3['2'] || 0},
        {key: 3, value: message.arg3['3'] || 0},
        {key: 4, value: message.arg3['4'] || 0},
      ];
      transactionId = await fcl.mutate({
        cadence: FlowTransactions.putCardOnField,
        args: (arg, t) => [
          arg(player_id, t.UInt),
          arg(arg1, t.Dictionary({ key: t.UInt8, value: t.UInt16 })), // unit_card
          arg(message.arg2, t.UInt8), // enemy_skill_target
          arg(arg3, t.Dictionary({ key: t.UInt8, value: t.UInt16 })), // trigger_cards
          arg(message.arg4, t.Array(t.UInt8)) // used_intercept_positions
        ],
        proposer: authorizationFunctionProposer,
        payer: authorizationFunction,
        authorizations: [authorizationFunction],
        limit: 999
      })
      console.log(`TransactionId: ${transactionId}`)
      message = `Transaction[put_card_on_the_field] is On Going. TransactionId: ${transactionId}`
      fcl.tx(transactionId).subscribe(res => {
        console.log(res);
      })
    // change the turn
    } else if (input.type === "turn_change") {
      const arg2 = [
        {key: 1, value: message.arg2['1'] || 0},
        {key: 2, value: message.arg2['2'] || 0},
        {key: 3, value: message.arg2['3'] || 0},
        {key: 4, value: message.arg2['4'] || 0},
      ];
      transactionId = await fcl.mutate({
        cadence: FlowTransactions.turnChange,
        args: (arg, t) => [
          arg(player_id, t.UInt),
          arg(message.arg1, t.Bool),
          arg(arg2, t.Dictionary({ key: t.UInt8, value: t.UInt16 })), // trigger_cards
        ],
        proposer: authorizationFunctionProposer,
        payer: authorizationFunction,
        authorizations: [authorizationFunction],
        limit: 999
      })
      console.log(`TransactionId: ${transactionId}`)
      message = `Transaction[turn_change] is On Going. TransactionId: ${transactionId}`
      fcl.tx(transactionId).subscribe(res => {
        console.log(res);
      })
    // Attack
    } else if (input.type === "attack") {
      const arg3 = [
        {key: 1, value: message.arg3['1'] || 0},
        {key: 2, value: message.arg3['2'] || 0},
        {key: 3, value: message.arg3['3'] || 0},
        {key: 4, value: message.arg3['4'] || 0},
      ];
      transactionId = await fcl.mutate({
        cadence: FlowTransactions.attack,
        args: (arg, t) => [
          arg(player_id, t.UInt),
          arg(message.arg1, t.UInt8), // attacking_card_position
          arg(message.arg2 || null, t.Optional(t.UInt8)), // enemy_skill_target
          arg(arg3, t.Dictionary({ key: t.UInt8, value: t.UInt16 })), // trigger_cards
          arg(message.arg4, t.Array(t.UInt8)) // used_intercept_position
        ],
        proposer: authorizationFunctionProposer,
        payer: authorizationFunction,
        authorizations: [authorizationFunction],
        limit: 999
      })
      console.log(`TransactionId: ${transactionId}`)
      message = `Transaction[turn_change] is On Going. TransactionId: ${transactionId}`
      fcl.tx(transactionId).subscribe(res => {
        console.log(res);
      })
    // Attack Result transaction
    } else if (input.type === "defence_action") {
      transactionId = await fcl.mutate({
        cadence: FlowTransactions.defenceAction,
        args: (arg, t) => [
          arg(player_id, t.UInt),
          arg(message.arg1, t.Optional(t.UInt8)), // opponent_defend_position
          arg(message.arg2, t.Array(t.UInt8)), // attacker_used_intercept_positions
          arg(message.arg3, t.Array(t.UInt8)), // defender_used_intercept_positions
        ],
        proposer: authorizationFunctionProposer,
        payer: authorizationFunction,
        authorizations: [authorizationFunction],
        limit: 999
      })
      console.log(`TransactionId: ${transactionId}`)
      message = `Transaction[start_your_turn] is On Going. TransactionId: ${transactionId}`
      fcl.tx(transactionId).subscribe(res => {
        console.log(res);
      })
    // Surrender
    } else if (input.type === "surrender") {
      transactionId = await fcl.mutate({
        cadence: FlowTransactions.surrender,
        args: (arg, t) => [
          arg(player_id, t.UInt),
        ],
        proposer: authorizationFunctionProposer,
        payer: authorizationFunction,
        authorizations: [authorizationFunction],
        limit: 999
      })
      console.log(`TransactionId: ${transactionId}`)
      message = `Transaction[surrender] is On Going. TransactionId: ${transactionId}`
      fcl.tx(transactionId).subscribe(res => {
        console.log(res);
      })
    // Add new card line-up / revise card info.
    } else if (input.type === "edit_card_info") {
      transactionId = await fcl.mutate({
        cadence: FlowTransactions.editCardInfo,
        args: (arg, t) => [
        ],
        proposer: authorizationFunctionProposer,
        payer: authorizationFunction,
        authorizations: [authorizationFunction],
        limit: 999
      })
      console.log(`TransactionId: ${transactionId}`)
      message = `Transaction[game_start] is On Going. TransactionId: ${transactionId}`
      fcl.tx(transactionId).subscribe(res => {
        console.log(res);
      })
    // Not Used.
    } else if (input.type === "claim_win") {
      transactionId = await fcl.mutate({
        cadence: FlowTransactions.claimWin,
        args: (arg, t) => [
          arg(player_id, t.UInt),
        ],
        proposer: authorizationFunctionProposer,
        payer: authorizationFunction,
        authorizations: [authorizationFunction],
        limit: 999
      })
      console.log(`TransactionId: ${transactionId}`)
      message = `Transaction[claim_win] is On Going. TransactionId: ${transactionId}`
      fcl.tx(transactionId).subscribe(res => {
        console.log(res);
      })
    }

    return {
      id: new Date().getTime(),
      type: input.type || "",
      message: input.message + ",TransactionID: " + transactionId,
      playerId: player_id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    return {
      id: new Date().getTime(),
      type: "E:" + input.type,
      message: error.toString(),
      playerId: player_id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
};
