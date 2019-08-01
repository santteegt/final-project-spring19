
# Design Patterns Decisions

## Design patterns used within the Nifties Exchange dApp

The `<-` symbol means that Contract inherits from.

### Initializable

It is a helper contract to support initializer functions instead of a constructor. This is a feature needed to support upgradable contracts through a proxy deployed by OpenZeppelin SDK. To use it, you only need to replace the constructor with a function that has the `initializer` modifier, so the smart contract initializer is called only once.

### UpgradabilityProxy

UpgradabilityProxy follows the `Unstructured Storage pattern` that has been initially developed by the Zeppelinos Lab group in order to enable the development of upgradable smart contracts. It uses a combination of a registry to store latest version of a contract, and a relayer (*DELEGATECALL*) to forward data and calls.

This implementation also uses the concept of proxy ownership. A proxy owner is the only address that can upgrade a proxy to point to a new logic contract, and the only address that can transfer ownership.

See ![OpenZeppelin SDK Upgrades Pattern](https://docs.openzeppelin.com/sdk/2.5/pattern)

### StampCollectible (<- Initializable <- Pausable <- ERC721MetadataMintable)

This is the main smart contract for Nifties exchange game. As it inherits from the Initializable, the contract can be upgraded through a proxy contract supplied by OpenZeppelin SDK. **See the demo video for more info on how it can be upgraded**

Due to this contract is considered as the heart of the system, it implements a **Circuit Breaker** to stop exchange activities if the contract owner considers to or if new errors are discovered in future upgrades of Ethereum (e.g. the reentrancy bug found in ConstantiNOPEple). For this reason, the contract inherits from the `Pausable` smart contract provided by OpenZeppelin.

The contract enables its fallback function to it can accept deposits for the game Prize pot.

Finally, the contract also inherits from the `ERC721MetadataMintable` so it can manage all minted NFTs including metadata for the tokenURI that connects a digital art image to the collectible.


### CollectibleMetaTxRelayer ( <- Initializable)


This contract gets some ideas from the [EIP-1337](https://github.com/ethereum/EIPs/pull/1337) standard for executing meta transactions through a relayer. In this way, a standalone relayer server can airdrop stamps to people with no ETH, and therefore being able to onboard them into crypto. For security purposes, deposits and function execution are only allowed to the contract owner.

## Why not used these other design pattern?

### Speed Bumps

*Speed bumps slow down actions, so that if malicious actions occur, there is time to recover*: a better approach for Nifties exchange is to implement a circuit breaker so it can be triggered in case of emergency

### Contract Rollout

*During testing, you can force an automatic deprecation by preventing any actions*: this pattern should be implemented when the dApp application goes to staging and/or beta phases.

### Pull vs Push transfers

StampCollectible smart contract implements this design pattern so NFTs cannnot be locked by a bad actor (e.g. a smart contract account with a fallback function that always revert()). When players sell stamps, the underlying value is stored on an outstandingBalance record, so players need to call a withdraw function later if they want to take their profit from the nifties exchange game.

### State Machine

The dApp does not have any feature (e.g. bidding) requiring state machine behaviour.
