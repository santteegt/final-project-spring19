pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/cryptography/ECDSA.sol";

import "./StampCollectible.sol";

/// @title A meta transaction relayer contract to improve user onboarding and claim stamps for free
/// @author santteegt
/// @notice MetaTx relayer can only be used to claim stamps via the buyStamp
/// @dev Contract can be upgraded through a proxy contract supplied by OpenZeppelin SDK
contract CollectibleMetaTxRelayer is Initializable {
    /// Library to obtain msg signer and sign messages
    using ECDSA for bytes32;

    address public owner;

    /// Data structure that represents a NFT Tourist stamp
    struct Stamp {
        uint256 price;
        uint256 maxClones;
        uint256 inWild;
        uint256 clonedFrom;
    }

    /// StampCollectible contract
    StampCollectible public stampCollectibleContract;

    /// Next valid nonce to process the metaTx
    /// Nonce to avoids replay attack
    mapping(address => uint) public replayNonce;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /** @dev Initialize contract
      * @param _address StampCollectible contract address
      */
    function initialize(StampCollectible _address)
        public
        initializer {// ensures that the contract only initilizes once
            owner = msg.sender;
            stampCollectibleContract = StampCollectible(_address);
    }

    /** @dev MetaTx function that allows a signer to claim a stamp for free
      * @param _signature Signed message sent through the relayer
      * @param _tokenId Gen0 stamp to be cloned and claimed
      * @param _nonce Transaction nonce
      * @return uint tokenId corresponding to the claimed NFT
      */
    function metaClaimStamp(bytes memory _signature, uint256 _tokenId, uint _nonce)
        public
        onlyOwner
        returns (bool) {
        // bytes32 metaHash = keccak256(abi.encodePacked(address(this), _tokenId, _nonce));
        bytes32 metaHash = getClaimStampHash(address(this), _tokenId, _nonce);
        address signer = getSubscriptionSigner(metaHash, _signature);

        //make sure signer doesn't come back as 0x0
        require(signer != address(0), "Message was not signed by an account");
        require(_nonce == replayNonce[signer], "Error in the nonce");

        //increase the nonce to prevent replay attacks
        replayNonce[signer]++;

        (uint256 price, , ,) = stampCollectibleContract.stamps(_tokenId);

        (bool success, ) = address(stampCollectibleContract).call.value(price)(abi.encodeWithSignature("buyStamp(address,uint256)", address(uint160(signer)), _tokenId));
        if(!success) revert();
        return success;
        // return stampCollectibleContract.buyStamp(address(uint160(signer)), _tokenId);
    }

    function getClaimStampHash(address _sender, uint256 _tokenId, uint _nonce)
        public
        pure returns (bytes32) {
            return keccak256( abi.encodePacked( _sender, _tokenId, _nonce ) );
    }

    /** @dev Executes the ecrecover to get the signer from hash and signature
      * @param _data Hash data sent
      * @param _signature Proof the sender signed the meta trasaction
      * @return address signer address
      */
    function getSubscriptionSigner(bytes32 _data, bytes memory _signature)
        public pure returns (address) {
        return _data.toEthSignedMessageHash().recover(_signature);
    }

    /**
     * @dev Low lever version of getSubscriptionSigner method
     * @notice This function is only intended to show some knowledge on LLL code
     * @param _data Hash of subscription
     * @param _signature Proof the subscriber signed the meta trasaction
     * @return address signer address
     */
    function _getSigner(bytes32 _data, bytes memory _signature)
        public pure returns (address) {

        bytes32 r;
        bytes32 s;
        uint8 v;
        if (_signature.length != 65) {
            return address(0x0);
        }
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
        if (v < 27) {
            v += 27;
        }
        if (v != 27 && v != 28) {
            return address(0x0);
        } else {
            return ecrecover(
                keccak256(
                    abi.encodePacked("\x19Ethereum Signed Message:\n32",
                    _data)
                ),
            v, r, s);
        }
    }

    /// @dev Fallback function to allow the contract accept deposits in ETH
    function () external payable onlyOwner {

    }
}
