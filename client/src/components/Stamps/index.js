import React, { Component } from 'react';
import { Card, Image, Box, Heading, Flex, Button } from 'rimble-ui';
import styles from './Stamps.module.scss';

export default class Stamps extends Component {
  state = {
    stamps: null,
    prizePot: 0,
    outstandingBalance: 0,
  };

  subscribedEvents = {};

  renderStamps = async () => {
    const { getStamps } = this.props;
    this.setState({ stamps: await getStamps() });
  };

  renderPot = async () => {
    const { web3, contract } = this.props;
    let prizePot = 0;
    if (contract) {
      prizePot = await web3.eth.getBalance(contract._address);
      prizePot = web3.utils.fromWei(prizePot, 'ether');
    }
    this.setState({ prizePot });
  };

  withdrawBalance = async () => {
    const { web3, contract, accounts } = this.props;
    const { outstandingBalance } = this.state;
    if (contract && contract.methods.withdraw) {
      await contract.methods.withdraw().send({ from: accounts[0] });
      await this.renderStamps();
      await this.getOutstandingBalance();
      alert(`Your earnings 🤑🤑(${outstandingBalance / (1 * 10 ** 18)} ETH)🤑🤑 have been withdrawn to your account`);
    }
  };

  getOutstandingBalance = async () => {
    const { web3, contract, accounts } = this.props;
    if (contract && contract.methods.outstandingBalance) {
      let outstandingBalance = await contract.methods.outstandingBalance(accounts[0]).call();
      this.setState({ outstandingBalance });
    }
  };

  componentDidMount = async () => {
    const { web3, contract } = this.props;
    if (contract) {
      await this.renderStamps();
      await this.renderPot();
      await this.getOutstandingBalance();
      this.subscribeLogEvent(web3, contract, 'NewStamp');
      this.subscribeLogEvent(web3, contract, 'BurnedStamp');
    }
  };

  subscribeLogEvent = async (web3, contract, eventName) => {
    const { getStamps } = this.props;
    const eventJsonInterface = web3.utils._.find(
      contract._jsonInterface,
      o => o.name === eventName && o.type === 'event',
    );
    const subscription = web3.eth.subscribe(
      'logs',
      {
        address: contract.options.address,
        topics: [eventJsonInterface.signature],
      },
      async (error, result) => {
        console.log('new event call!!!');
        if (!error) {
          const eventObj = web3.eth.abi.decodeLog(eventJsonInterface.inputs, result.data, result.topics.slice(1));
          console.log(`New ${eventName}!`, eventObj);
          await this.renderStamps();
          await this.renderPot();
          await this.getOutstandingBalance();
        }
      },
    );
    this.subscribedEvents[eventName] = subscription;
  };

  render() {
    const { web3, contract, networkId, accounts, balance, isMetaMask } = this.props;
    const { stamps, prizePot, outstandingBalance } = this.state;
    // let outstandingBalance = 0;
    // if (contract && contract.methods.outstandingBalance) {
    //     this.getOutstandingBalance().then(rs => outstandingBalance = parseInt(rs))
    //         .catch((error) => console.log('Error while trying to get outstanding Balance', error));
    // }
    return (
      <div className={styles.stamps}>
        <Card width={'380px'} mx={'auto'} my={5} p={3} style={{ textAlign: 'center' }}>
          <Box fontSize={4} p={3}>
            <div style={{ textAlign: 'center' }} className={styles.title}>
              <strong>Stamps Market</strong>
            </div>
          </Box>
          <div className={styles.dataPoint}>
            {stamps && <div className={styles.label}>Available: {stamps.length}</div>}
            <div className={styles.label}>Prize Pot 💰💰: {prizePot} ETH</div>
            {contract && contract.methods.withdraw && (
              <div className={styles.label}>Your Balance 🧾: {outstandingBalance / (1 * 10 ** 18)} ETH</div>
            )}
          </div>
          {contract && (
            <Box px={'33%'} height={3} borderTop={1} borderColor={'#E8E8E8'}>
              <Button
                p={'1'}
                mr={4}
                mt={2}
                disabled={!contract.methods.withdraw || outstandingBalance == 0}
                onClick={() => this.withdrawBalance()}
              >
                Withdraw
              </Button>
            </Box>
          )}
          {!contract && (
            <Box color="red" fontSize={3} p={3}>
              ⚠️ No Contract is deployed under this network
            </Box>
          )}
          {contract && (
            <div className={styles.dataPoint}>
              <div className={styles.label}>Contract deployed at:</div>
              <Box color="red" fontSize={1} style={{ textAlign: 'center' }}>
                <div className={styles.value}>{contract._address}</div>
              </Box>
            </div>
          )}
        </Card>
        {stamps &&
          stamps.map((stamp, idx) => {
            return (
              <Card width={'380px'} mx={'auto'} my={5} p={0} className={stamp.owned ? styles.owned : styles.notowned}>
                {!stamp.owned && balance == 0 && (
                  <Button p={'1'} className={styles.claim} onClick={() => this.props.claimStamp(stamp, idx + 1)}>
                    Claim Stamp
                  </Button>
                )}
                <Image width={1} src={stamp.tokenURI} alt="NIFTIES 4 TOURISM" />

                <Box px={4} py={3}>
                  <Heading.h2>Nifty #{stamp.tokenId}</Heading.h2>
                  <Heading.h3 color="#666">🤑🤑{parseInt(stamp.price) / (1 * 10 ** 18)} (ETH)</Heading.h3>
                  <Heading.h4 color="#666">
                    {parseInt(stamp.inWild) < parseInt(stamp.maxClones) ? 'Available' : 'Not Available'}
                  </Heading.h4>
                  <Heading.h5 color="#666">{stamp.inWild} Minted</Heading.h5>
                </Box>

                <Flex px={4} height={3} borderTop={1} borderColor={'#E8E8E8'}>
                  <Button p={'1'} mr={4} disabled={stamp.owned} onClick={() => this.props.buyStamp(stamp, idx + 1)}>
                    Buy Stamp
                  </Button>
                  <Button p={'1'} disabled={!stamp.owned} onClick={() => this.props.sellStamp(stamp, idx + 1)}>
                    Sell Stamp
                  </Button>
                </Flex>
              </Card>
            );
          })}
      </div>
    );
  }
}
