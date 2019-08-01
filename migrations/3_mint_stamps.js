const StampCollectible = artifacts.require("./StampCollectible.sol");

module.exports = (deployer, network, accounts) => {

    StampCollectible.deployed().then((instance) => {
        console.log('\nStampCollectible deployed at', instance.address);
        instance.mint(100, "https://raw.githubusercontent.com/santteegt/final-project-spring19/master/resources/stamps/stamp-02.png", {from: accounts[0]});
        instance.mint(100, "https://raw.githubusercontent.com/santteegt/final-project-spring19/master/resources/stamps/stamp-03.png", {from: accounts[0]});
        instance.mint(100, "https://raw.githubusercontent.com/santteegt/final-project-spring19/master/resources/stamps/stamp-04.png", {from: accounts[0]});
        instance.mint(100, "https://raw.githubusercontent.com/santteegt/final-project-spring19/master/resources/stamps/stamp-05.png", {from: accounts[0]});
        instance.mint(100, "https://raw.githubusercontent.com/santteegt/final-project-spring19/master/resources/stamps/stamp-06.png", {from: accounts[0]});
        return instance;
    })
}
