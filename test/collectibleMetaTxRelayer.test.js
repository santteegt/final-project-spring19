let CollectibleMetaTxRelayer = artifacts.require('CollectibleMetaTxRelayer');
let StampCollectible = artifacts.require('StampCollectible');

let BN = web3.utils.BN
let catchRevert = require("./exceptionHelpers.js").catchRevert;

let unsecureAcc = web3.eth.accounts.wallet.create(1, 'cypherpunkspeakeasy')
let player1 = unsecureAcc['0'].address
let player1PK = unsecureAcc['0'].privateKey

let instance;
let exchange;


contract('CollectibleMetaTxRelayer', (accounts) => {

    let owner = accounts[0];

    before(async () => {
        instance = await CollectibleMetaTxRelayer.deployed();
        exchange = await StampCollectible.deployed();
        console.log('CollectibleMetaTxRelayer deployed address', instance.address);

    });

    it("should check a correct setup", async () => {
        let exchangeAddr = await instance.stampCollectibleContract();
        assert.equal(exchangeAddr, exchange.address, "StampCollectible contract address does not match");
    });

    it("should check if getClaimStampHash and soliditySha3 function return the same values", async () => {
        let stampId = 1;
        let nonce = await instance.replayNonce(player1);
        let functionCallHash = await instance.getClaimStampHash(CollectibleMetaTxRelayer.address, stampId, nonce);

        const params = [
          {t: 'address', v: CollectibleMetaTxRelayer.address},
          {t: 'uint256', v: stampId},
          {t: 'uint', v: nonce}
        ];
        const paramsHash = web3.utils.soliditySha3(...params);

        assert.equal(functionCallHash, paramsHash, "Function param hashes does not match")

    });

    it("should check if getSubscriptionSigner returns the actual message signer", async () => {
        let stampId = 1;
        let nonce = await instance.replayNonce(player1);
        const params = [
          {t: 'address', v: CollectibleMetaTxRelayer.address},
          {t: 'uint256', v: 1},
          {t: 'uint', v: nonce}
        ];
        const paramsHash = web3.utils.soliditySha3(...params);
        let sig = web3.eth.accounts.sign(paramsHash, player1PK);
        let signer = await instance.getSubscriptionSigner(paramsHash, sig.signature);

        assert.equal(player1, signer, "Sender and signer does not match");

    });

    it("should check if getSubscriptionSigner and _getSigner returns the same", async () => {
        let stampId = 1;
        let nonce = await instance.replayNonce(player1);
        const params = [
          {t: 'address', v: CollectibleMetaTxRelayer.address},
          {t: 'uint256', v: 1},
          {t: 'uint', v: nonce}
        ];
        const paramsHash = web3.utils.soliditySha3(...params);
        let sig = web3.eth.accounts.sign(paramsHash, player1PK);
        let signer1 = await instance.getSubscriptionSigner(paramsHash, sig.signature);
        let signer2 = await instance._getSigner(paramsHash, sig.signature);

        assert.equal(player1, signer1, "Sender and signer does not match");
        assert.equal(player1, signer2, "Sender and signer does not match");
    });

    it("should mint a stamp to an account with no ETH through the relayer", async() => {

        let deposit = web3.utils.toWei("2", "ether");
        const relayerBalanceBefore = await web3.eth.getBalance(CollectibleMetaTxRelayer.address);
        await instance.send(deposit, {from: accounts[0]})
        const relayerBalanceAfter = await web3.eth.getBalance(CollectibleMetaTxRelayer.address);
        assert.equal(new BN(relayerBalanceAfter).sub(new BN(relayerBalanceBefore)).toString(10),
            new BN(deposit).toString(10), "Balance does not match");


        let stampId = 1;
        let nonce = await instance.replayNonce(player1);
        const params = [
          {t: 'address', v: CollectibleMetaTxRelayer.address},
          {t: 'uint256', v: 1},
          {t: 'uint', v: nonce}
        ];
        const totalMintedBefore = await exchange.totalMinted();
        const paramsHash = web3.utils.soliditySha3(...params);
        let sig = web3.eth.accounts.sign(paramsHash, player1PK);
        let tx = await instance.metaClaimStamp(sig.signature, stampId, nonce);
        const totalMintedAfter = await exchange.totalMinted();
        assert.equal(parseInt(totalMintedBefore.toString(10)) + 1,
            parseInt(totalMintedAfter.toString(10)), "Stamp was not minted thorugh the relayer");
    })
})
