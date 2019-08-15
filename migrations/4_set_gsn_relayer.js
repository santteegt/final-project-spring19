const StampCollectible = artifacts.require("./StampCollectible.sol");

module.exports = (deployer, network, accounts) => {
  if (network.indexOf("rinkeby") == 0) {
    console.log("Configuring GSN for Rinkeby...");
    StampCollectible.deployed()
      .then(instance => {
        instance.updateRelayHub("0x537f27a04470242ff6b2c3ad247a05248d0d27ce");
        return instance;
      })
      .then(instance => {
        instance.depositToRelay({ value: web3.utils.toWei("1", "ether") });
        return instance;
      })
      .then(instance => {
        instance.getHubAddr().then(rs => console.log("RelayHub address", rs));
        instance
          .getBalanceOnRelay()
          .then(rs => console.log("RelayHub balance", rs.toString(10)));
        return instance;
      });
  } else {
    console.log("Skipping GSN configuration...");
  }
};
