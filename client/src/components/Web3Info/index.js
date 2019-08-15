import React, { Component } from 'react';
import { PublicAddress, Blockie, Box, Flex, Button, Text } from 'rimble-ui';
import styles from './Web3Info.module.scss';

export default class Web3Info extends Component {
  // state = {
  //     prizePot: 0
  // }

  renderNetworkName(networkId) {
    switch (networkId) {
      case 3:
        return 'Ropsten';
      case 4:
        return 'Rinkeby';
      case 1:
        return 'Main';
      case 42:
        return 'Kovan';
      default:
        return 'Private';
    }
  }

  // componentDidMount = async () => {
  //     const { web3, contract } = this.props;
  //     const prizePot = await web3.eth.getBalance(contract._address);
  //     console.log("PRIZEPOT", prizePot)
  //     this.setState({prizePot})
  // }

  render() {
    const { networkId, accounts, balance, isMetaMask, portis } = this.props;

    return (
      <div className={styles.web3}>
        <h3> Your Profile </h3>
        <div className={styles.dataPoint}>
          <div className={styles.label}>Network:</div>
          <div className={styles.value}>
            {networkId} - {this.renderNetworkName(networkId)}
          </div>
        </div>
        <div className={styles.dataPoint}>
          <div className={styles.label}>Your address:</div>
          <div className={styles.value}>
            <Flex>
              <Box width={5 / 6}>
                <PublicAddress address={accounts[0]} />
              </Box>
              <Box width={1 / 6} className={styles.blockie}>
                <Blockie opts={{ seed: accounts[0], size: 15, scale: 3 }} />
              </Box>
            </Flex>
          </div>
        </div>
        <Flex>
          <Box width={1 / 2}>
            <div className={styles.label}>Your ETH balance:</div>
            <div className={styles.value}>{balance}</div>
          </Box>
          <Box width={1 / 2}>
            <div className={styles.label}>Provider:</div>
            <div className={styles.value}>
              {isMetaMask && 'Metamask'}
              {!isMetaMask && portis && (
                <Box>
                  <Text>Portis</Text>
                  <Button p={'1'} onClick={() => portis.showPortis()}>
                    Open Wallet
                  </Button>
                </Box>
              )}
            </div>
          </Box>
        </Flex>
      </div>
    );
  }
}
