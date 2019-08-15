const Counters = artifacts.require("./Counters.sol");
const SafeMath = artifacts.require("./SafeMath.sol");
const ECDSA = artifacts.require("./ECDSA.sol");
const StampCollectible = artifacts.require("./StampCollectible.sol");
const CollectibleMetaTxRelayer = artifacts.require(
  "./CollectibleMetaTxRelayer.sol"
);

module.exports = (deployer, network, accounts) => {
  deployer.deploy(Counters);
  deployer.link(Counters, [StampCollectible]);
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, [StampCollectible]);
  deployer.deploy(ECDSA);
  deployer.link(ECDSA, [StampCollectible]);
  deployer
    .deploy(StampCollectible)
    .then(instance => {
      // instance.initialize(10, 255, 1000000000000, "Stamp Collectible", "STAMP")
      instance
        .initialize(10, 64, 1000000000000, "Stamp Collectible", "STAMP")
        .then(rs =>
          console.log(
            `\nStampCollectible has been initialized with txHash: ${rs.tx}`
          )
        );
      return instance;
    })
    .then(instance => {
      return deployer.deploy(CollectibleMetaTxRelayer);
    })
    .then(instance => {
      instance
        .initialize(StampCollectible.address)
        .then(rs =>
          console.log(
            `\nCollectibleMetaTxRelayer has been initialized with txHash: ${rs.tx}`
          )
        );
    });
};
