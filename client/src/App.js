import React, { Component } from 'react';
import {
  walletConnectProviderOpts,
  web3Networks,
  getWeb3,
  getGanacheWeb3,
  walletConnect,
  // getPortis,
} from './utils/getWeb3';
import Web3Connect from 'web3connect';
import Web3Info from './components/Web3Info/index.js';
import Header from './components/Header/index.js';
import Stamps from './components/Stamps/index.js';
import { Loader, Card, Flex, Box, Blockie, Button } from 'rimble-ui';

import styles from './App.module.scss';

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    balance: 0,
    networkId: undefined,
    isMetaMask: false,
    contract: null,
    availableNetworks: [],
    route: window.location.pathname.replace('/', ''),
  };

  constructor(props) {
    super(props);
  }

  getGanacheAddresses = async () => {
    if (!this.ganacheProvider) {
      this.ganacheProvider = getGanacheWeb3();
    }
    if (this.ganacheProvider) {
      return await this.ganacheProvider.eth.getAccounts();
    }
    return [];
  };

  loginWalletConnect = async provider => {
    const web3 = await walletConnect(provider);
    if (provider.isPortis) {
      provider._portis.onLogout(() => window.location.reload());
      this.setState({ portis: provider._portis, web3 }, this.updateConfig);
    } else {
      this.setState({ web3 }, this.updateConfig);
    }
  };

  // DEPRECATED
  // loginPortis = async () => {
  //   const portis = await getPortis('rinkeby');
  //   const web3 = await walletConnect(portis.provider);
  //   console.log('PORTIS', portis, web3);
  //   await portis.provider.enable();
  //   web3.eth.getAccounts((error, accounts) => {
  //     console.log('PORTIS accounts', accounts);
  //   });
  //   this.setState({ portis, web3 });
  // };

  componentDidMount = async () => {};

  updateConfig = async () => {
    let StampCollectible = {};
    const { web3, portis } = this.state;
    console.log('DOES WEB3 exists?', web3);
    if (web3) {
      try {
        StampCollectible = require('./contracts/StampCollectible.json');

        const isProd = process.env.NODE_ENV === 'production';
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        console.log('ACCOUNTS', accounts);
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const isMetaMask = web3.currentProvider.isMetaMask;
        let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]) : web3.utils.toWei('0');
        balance = web3.utils.fromWei(balance, 'ether');
        if (!isProd) {
          // web3.eth.subscribe('newBlockHeaders').on('data', (blockHeader) => console.log("NEW BLOCK!!"));
          // const ganacheAccounts = await this.getGanacheAddresses();
          // this.setState({ganacheAccounts});
        }
        if (isMetaMask) {
          window.ethereum.on('accountsChanged', accounts => {
            console.log('METAMASK account has changed!', accounts);
            this.updateConfig();
          });
          window.ethereum.on('networkChanged', networkId => {
            console.log('METAMASK network has changed!', networkId);
            this.updateConfig();
          });
        }
        let contract = null;
        let availableNetworks = [];
        if (StampCollectible.networks) {
          availableNetworks = Object.keys(StampCollectible.networks);
          console.log('StampCollectible Networks', availableNetworks);

          let deployedNetwork = StampCollectible.networks[networkId.toString()];
          if (deployedNetwork) {
            contract = new web3.eth.Contract(StampCollectible.abi, deployedNetwork && deployedNetwork.address);
            // this.subscribeLogEvent(web3, instance, "NewStamp");
          } else {
            console.log('ERROR!, WRONG NETWORK');
          }
        }
        if (contract) {
          this.setState({ contract, availableNetworks });
        }
        this.setState({ accounts, balance, networkId, isMetaMask });
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(`Failed to load web3, accounts, or contract. Check console for details.`);
        console.error(error);
      }
    }
    if (portis) {
      portis.showPortis();
    }
  };

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  getStamps = async () => {
    const { web3, accounts, contract } = this.state;
    let stamps = [];
    if (contract) {
      const totalMinted = await contract.methods.totalMinted().call();
      console.log('TOTAL MINTED', totalMinted);
      for (var i = 1; i <= totalMinted; i++) {
        const owned = await contract.methods.ownedTokensIndex(i).call();
        if (owned) {
          const stamp = await contract.methods.stamps(i).call();
          stamp.tokenId = i;
          if (stamp.clonedFrom == 0) {
            stamp.tokenURI = await contract.methods.tokenURI(i).call();
            if (!stamp.tokenURI.startsWith('http')) {
              stamp.tokenURI = web3.utils.hexToUtf8(stamp.tokenURI);
            }
            const clonedStamp = await contract.methods.balances(accounts[0], i).call();
            // console.log('cloned', clonedStamp)
            // stamp.owned = await contract.methods.balances(accounts[0], i).call();
            stamp.owned = clonedStamp.owned;
            stamps.push(stamp);
          }
        }
      }
      console.log('STAMPS', stamps);
    }
    let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]) : web3.utils.toWei('0');
    balance = web3.utils.fromWei(balance, 'ether');
    this.setState({ balance });
    return stamps;
  };

  buyStamp = async (stamp, index) => {
    const { accounts, contract } = this.state;
    await contract.methods.buyStamp(accounts[0], index).send({ from: accounts[0], value: stamp.price });
    alert('Thanks for your purchase 🚀🚀');
  };

  sellStamp = async (stamp, index) => {
    const { accounts, contract } = this.state;
    await contract.methods.sellStamp(index).send({ from: accounts[0] });
    alert('Hope you enjoyed it! 🍻🍻');
  };

  claimStamp = async (stamp, index) => {
    const { accounts, contract } = this.state;
    await contract.methods.airdropStamp(index).send({ from: accounts[0], gasLimit: 5000000 });
    alert('You have successfully claimed a Stamp! 🚀🚀');
  };

  renderLoader() {
    const loginButton = this.renderWeb3ConnectButton();
    return (
      <div className={styles.loader}>
        <Loader size="80px" color="red" />
        <h3> Loading Web3, accounts, and contract...</h3>
        <p> Unlock your wallet </p>
        {loginButton}
      </div>
    );
  }

  renderWeb3ConnectButton(network) {
    return (
      <Web3Connect.Button
        label={'Connect to your Wallet'}
        providerOptions={walletConnectProviderOpts}
        onConnect={provider => {
          console.log('WalletConnect provider', provider);
          this.loginWalletConnect(provider);
        }}
        onClose={() => {
          console.log('Web3Connect Modal Closed'); // modal has closed
        }}
        onError={error => {
          console.log('ERROR using WalletConnect', error);
        }}
      />
    );
    // return (
    //    <Button onClick={() => this.loginPortis()}>Connect to Portis</Button>
    // );
  }

  render() {
    if (!this.state.web3) {
      return this.renderLoader();
    }
    const { web3, accounts, networkId } = this.state;
    let address = accounts && accounts[0];
    const blockExplorerURI = web3Networks[networkId] && web3Networks[networkId].explorerAddress;
    const walletConnectButton = this.renderWeb3ConnectButton();
    return (
      <div className={styles.App}>
        {address && (
          <Card bg="blue" color="white" borderRadius={2} my={3} mx={2} px={3} py={3} style={{ textAlign: 'center' }}>
            <Flex style={{ position: 'absolute', textAlign: 'center' }}>
              Nifties Exchange
              <br />
              {address.substring(0, 10)}
            </Flex>
            <Flex
              alignItems={'center'}
              justifyContent={'space-between'}
              style={{ position: 'relative', float: 'right' }}
            >
              <Box>
                <a href={`${blockExplorerURI}${address}`} target="_blank">
                  <Flex alignItems={'center'}>
                    <Blockie
                      opts={{
                        seed: 'foo',
                        color: '#dfe',
                        bgcolor: '#a71',
                        size: 15,
                        scale: 3,
                        spotcolor: '#000',
                      }}
                    />
                  </Flex>
                </a>
              </Box>
            </Flex>
          </Card>
        )}
        {!web3 && walletConnectButton}
        {web3 && accounts && <Web3Info {...this.state} />}
        {web3 && accounts && (
          <Stamps
            getStamps={this.getStamps}
            buyStamp={this.buyStamp}
            sellStamp={this.sellStamp}
            claimStamp={this.claimStamp}
            {...this.state}
          />
        )}
      </div>
    );
  }
}

export default App;
