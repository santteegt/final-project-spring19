const StampCollectible = artifacts.require("./StampCollectible.sol");
const CollectibleMetaTxRelayer = artifacts.require("./CollectibleMetaTxRelayer.sol");

module.exports = (deployer, network, accounts) => {

    StampCollectible.deployed().then((instance) => {
        console.log('\nStampCollectible deployed at', instance.address);
        instance.send(web3.utils.toWei("2", "ether"), {from: accounts[0]}).then((rs) => console.log('\nPrize pot fulfilled with thHash:', rs.tx))
        return instance;
    }).then((instance) => {
        console.log('================================================================')
        console.log('=========================SUMMARY================================')
        console.log('================================================================')
        console.log('                                                                ')
        console.log(`============= Deployed to network ${network} ================`)
        console.log(`- StampCollectible: ${StampCollectible.address}`);
        console.log(`- CollectibleMetaTxRelayer: ${CollectibleMetaTxRelayer.address}`);
        console.log('                                                                ')
        console.log('================================================================')
        return instance;
    });
}
