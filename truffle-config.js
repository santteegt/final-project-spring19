const path = require("path");
require("dotenv").config();
const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  plugins: ["truffle-security"],

  contracts_directory: path.join(__dirname, "./contracts"),
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),

  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY
        );
      },
      network_id: "3",
      gas: 4465030,
      gasPrice: 10000000000
    },
    kovan: {
      provider: function() {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          "https://kovan.infura.io/v3/" + process.env.INFURA_API_KEY
        );
      },
      network_id: "42",
      gas: 4465030,
      gasPrice: 10000000000
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          "https://rinkeby.infura.io/v3/" + process.env.INFURA_API_KEY
        ),
      network_id: 4,
      gas: 6900000,
      gasPrice: 1100000000
    },
    // main ethereum network(mainnet)
    main: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          "https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY
        ),
      network_id: 1,
      gas: 3000000,
      gasPrice: 10000000000
    }
  },
  compilers: {
    solc: {
      version: "0.5.5",
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        }
        //  evmVersion: "byzantium"
      }
    }
  }
};
