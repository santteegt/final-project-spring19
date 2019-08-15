#!/usr/bin/env bash

echo "Deploying StampCollectible contract..."
# CONTRACT_ADDR=$(oz create StampCollectible -n rinkeby --init initialize --args 10,255,1000000000000,"StampCollectible","STAMP" | tail -1)
CONTRACT_ADDR=$(oz create StampCollectible -n rinkeby --init initialize --args 10,64,1000000000000,"StampCollectible","STAMP" | tail -1)
echo "StampCollectible deployed at " $CONTRACT_ADDR

# CONTRACT_ADDR=0x6446aea8e536Cb89f90668d29eBF30F926E9a24D
# echo "StampCollectible deployed at " $CONTRACT_ADDR

echo "Funding the Prize pot..."
oz transfer -n rinkeby --to $CONTRACT_ADDR --value 1 --unit ether --no-interactive

echo "Current Prize pot balance..."
oz balance -n rinkeby $CONTRACT_ADDR

echo "Setting up Relayer"
echo "Update RelayerHub address"
oz send-tx --to $CONTRACT_ADDR -n rinkeby --method updateRelayHub --args 0x537f27a04470242ff6b2c3ad247a05248d0d27ce
echo "Depositing..."
oz send-tx --to $CONTRACT_ADDR -n rinkeby --value 1000000000000000000 --method depositToRelay

# echo "Minting some NFTs..."
# echo "Minting some NFTs...(1)"
# oz send-tx --to $CONTRACT_ADDR -n rinkeby --method mint --args 100,'0x68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f73616e7474656567742f66696e616c2d70726f6a6563742d737072696e6731392f6d61737465722f7265736f75726365732f7374616d70732f7374616d702d30322e706e67'
# echo "Minting some NFTs...(2)"
# oz send-tx --to $CONTRACT_ADDR -n rinkeby --method mint --args 100,'0x68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f73616e7474656567742f66696e616c2d70726f6a6563742d737072696e6731392f6d61737465722f7265736f75726365732f7374616d70732f7374616d702d30332e706e67'
# echo "Minting some NFTs...(3)"
# oz send-tx --to $CONTRACT_ADDR -n rinkeby --method mint --args 100,'0x68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f73616e7474656567742f66696e616c2d70726f6a6563742d737072696e6731392f6d61737465722f7265736f75726365732f7374616d70732f7374616d702d30342e706e67'
# echo "Minting some NFTs...(4)"
# oz send-tx --to $CONTRACT_ADDR -n rinkeby --method mint --args 100,'0x68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f73616e7474656567742f66696e616c2d70726f6a6563742d737072696e6731392f6d61737465722f7265736f75726365732f7374616d70732f7374616d702d30352e706e67'
# echo "Minting some NFTs...(5)"
# oz send-tx --to $CONTRACT_ADDR -n rinkeby --method mint --args 100,'0x68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f73616e7474656567742f66696e616c2d70726f6a6563742d737072696e6731392f6d61737465722f7265736f75726365732f7374616d70732f7374616d702d30362e706e67'
# echo "Minting some NFTs...(Done)"

echo "Migration completed"
