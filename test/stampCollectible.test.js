let StampCollectible = artifacts.require('StampCollectible');

let catchRevert = require("./exceptionHelpers.js").catchRevert;
let BN = web3.utils.BN
let toNumber = web3.utils.hexToNumber;

const _maxClones = 10;
const _priceDepth = 255;
const _costMultiplier = 1000000000000;
const _name = "StampCollectible";
const _symbol = "STAMP";
const _initialPrice = web3.utils.toWei('0.1', 'finney');
const _initialPrizePotBalance = web3.utils.toWei('2', 'ether');

let instance;

contract('StampCollectible', (accounts) => {

    let owner = accounts[0];
    let player1 = accounts[1];
    let player2 = accounts[2];
    before(async () => {
        instance = await StampCollectible.deployed();
        console.log('StampCollectible deployed address', instance.address);
    });

    it("should have a predetermined initial setup", async () => {
        const totalMinted = await instance.totalMinted();
        assert.equal(toNumber(totalMinted), 5, "Contract should be setup with five minted stamps");
        for(var i = 1; i <= 5; i++) {
            let stamp = await instance.stamps(i);
            assert.equal(toNumber(stamp.clonedFrom), 0, "Minted stamp isn't a Gen0 NFT");
            assert.equal(toNumber(stamp.maxClones), _maxClones, "Max supply should be", _maxClones);
            assert.equal(toNumber(stamp.maxClones), _maxClones, "Max supply should be", _maxClones);
            assert.equal(web3.utils.toWei(stamp.price.toString(10), 'wei'), _initialPrice, "Gen0 stamps initial price should be", _initialPrice);
        }
        const prizePot = await web3.eth.getBalance(instance.address);
        assert.equal(web3.utils.toWei(prizePot, 'wei'), _initialPrizePotBalance, "Initial Prize pot should be 2 ETH");
    });

    it("should allow to mint new Gen0 stamps to accounts with MinterRole only", async () => {
        let isMinter = await instance.isMinter(owner)
        assert.isTrue(isMinter, "Owner account should have a MinterRole");
        isMinter = await instance.isMinter(player1);
        assert.isFalse(isMinter, "A Player account should not have a MinterRole");

        const totalMintedBefore = await instance.totalMinted();
        await instance.mint(100,
            "https://raw.githubusercontent.com/santteegt/final-project-spring19/master/resources/stamps/stamp-02.png",
            {from: owner});
        catchRevert(instance.mint(100,
                "https://raw.githubusercontent.com/santteegt/final-project-spring19/master/resources/stamps/stamp-02.png",
                {from: player1}));
        const totalMintedAfter = await instance.totalMinted();
        assert.equal(totalMintedAfter.toNumber(), (totalMintedBefore.toNumber() + 1), "Gen0 stamps should be minted my accounts with MinterRole");
    });

    it("should see a change in the stamp market price and Prize pot balance after buying one", async () => {
        const stampId = 1;
        const prizePotBefore = await web3.eth.getBalance(instance.address);
        let stamp = await instance.stamps(stampId);
        const buyingPrice = web3.utils.toWei(stamp.price.toString(10), 'wei');
        /// buying a stamp
        const tx = await instance.buyStamp(player1, stampId, {from: player1, value: buyingPrice});

        /// looking for NewStamp Event
        const newStampEvent = web3.utils._.find(tx.receipt.logs, o => o.event === "NewStamp");
        assert.isNotNull(newStampEvent, "buyStamp function should return a NewStamp event");
        assert.isDefined(newStampEvent.args.tokenId, "NewStamp event should return a tokenId value");

        /// get new stamp data
        const newStamp = await instance.stamps(newStampEvent.args.tokenId.toNumber());
        assert.equal(newStamp.clonedFrom.toNumber(),
            stampId, "New stamp should be cloned from Gen0 NFT", stampId);

        const prizePotAfter = await web3.eth.getBalance(instance.address);
        assert.equal(new BN(prizePotAfter).toString(),
            new BN(prizePotBefore).add(new BN(buyingPrice)), "Prize pot balance should match");

        stamp = await instance.stamps(stampId);
        assert.notEqual(web3.utils.toWei(stamp.price.toString(10), 'wei'),
            buyingPrice, "Stamp market price should change after buying one");

    });

    it("should send stamp selling price to outstandingBalance", async () => {
        const stampId = 1;
        const playerBalanceBefore = await web3.eth.getBalance(player1);
        const prizePotBefore = await web3.eth.getBalance(instance.address);
        const outstandingBalanceBefore = await instance.outstandingBalance(player1);
        let stamp = await instance.stamps(stampId);
        const sellingPrice = web3.utils.toWei(stamp.price.toString(10), 'wei');
        /// selling a stamp
        const tx = await instance.sellStamp(stampId, {from: player1});
        /// looking for BurnedStamp event
        const burnedStampEvent = web3.utils._.find(tx.receipt.logs, o => o.event === "BurnedStamp");
        assert.isNotNull(burnedStampEvent, "buyStamp function should return a NewStamp event");
        assert.isDefined(burnedStampEvent.args.clonedTokenId, "BurnedStamp event should return a clonedTokenId value");
        /// check if stamp NFT was burned
        const isOwned = await instance.ownedTokensIndex(burnedStampEvent.args.clonedTokenId);
        const balance = await instance.balances(player1, burnedStampEvent.args.clonedTokenId);
        assert.isFalse(isOwned && balance.owned, "Stamp should be burned");

        const playerBalanceAfter = await web3.eth.getBalance(player1);
        const prizePotAfter = await web3.eth.getBalance(instance.address);
        const outstandingBalanceAfter = await instance.outstandingBalance(player1);

        const txData = await web3.eth.getTransaction(tx.tx);
        let txCost = Number(txData.gasPrice) * tx.receipt.gasUsed;

        /// verify prize pot and user balance
        assert.equal(new BN(prizePotBefore).toString(10), new BN(prizePotAfter).toString(10), "Prize pot balance should match");
        assert.equal(new BN(playerBalanceBefore).sub(new BN(txCost)).toString(10), new BN(playerBalanceAfter).toString(10), "User balance should match");

    });

    it("should be able to withdraw outstanding balance", async () => {
        const playerBalanceBefore = await web3.eth.getBalance(player1);
        const prizePotBefore = await web3.eth.getBalance(instance.address);
        const outstandingBalanceBefore = await instance.outstandingBalance(player1);
        /// withdraw player balance in the exchange
        const tx = await instance.withdraw({from: player1});
        const txData = await web3.eth.getTransaction(tx.tx);
        let txCost = Number(txData.gasPrice) * tx.receipt.gasUsed;
        const playerBalanceAfter = await web3.eth.getBalance(player1);
        const prizePotAfter = await web3.eth.getBalance(instance.address);
        const outstandingBalanceAfter = await instance.outstandingBalance(player1);

        assert.isTrue(outstandingBalanceAfter.isZero(), "Outstanding balance should be zero now");

        /// verify prize pot and user balance
        assert.equal(new BN(prizePotAfter).add(outstandingBalanceBefore).toString(10),
            new BN(prizePotBefore), "Prize pot balance should match");
        assert.equal(new BN(playerBalanceBefore).sub(new BN(txCost)).add(outstandingBalanceBefore).toString(10),
            new BN(playerBalanceAfter).toString(10), "User balance should match");
    })
});
