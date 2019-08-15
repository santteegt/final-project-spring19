#!/usr/bin/env bash

# echo "Deploying StampCollectible contract..."
# # CONTRACT_ADDR=$(oz create StampCollectible -n ropsten --init initialize --args 10,255,1000000000000,"StampCollectible","STAMP" | tail -1)
# CONTRACT_ADDR=$(oz create StampCollectible -n ropsten --init initialize --args 10,64,1000000000000,"StampCollectible","STAMP" | tail -1)
# echo "StampCollectible deployed at " $CONTRACT_ADDR

CONTRACT_ADDR=0x83ee7C76056D2eAD1f672d6988Ffce98954df880
echo "StampCollectible deployed at " $CONTRACT_ADDR

# echo "Funding the Prize pot..."
# oz transfer -n ropsten --to $CONTRACT_ADDR --value 500 --unit milli --no-interactive

echo "Current Prize pot balance..."
oz balance -n ropsten $CONTRACT_ADDR

echo "Setting up Relayer"
echo "Update RelayerHub address"
oz send-tx --to $CONTRACT_ADDR -n ropsten --method updateRelayHub --args 0x1349584869A1C7b8dc8AE0e93D8c15F5BB3B4B87
echo "Depositing..."
oz send-tx --to $CONTRACT_ADDR -n ropsten --value 500000000000000000 --method depositToRelay

echo "Minting some NFTs..."
echo "Minting some NFTs...(1)"
oz send-tx --to $CONTRACT_ADDR -n ropsten --method mint --args 100,'0x68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f73616e7474656567742f66696e616c2d70726f6a6563742d737072696e6731392f6d61737465722f7265736f75726365732f7374616d70732f7374616d702d30322e706e67'
echo "Minting some NFTs...(2)"
oz send-tx --to $CONTRACT_ADDR -n ropsten --method mint --args 100,'0x68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f73616e7474656567742f66696e616c2d70726f6a6563742d737072696e6731392f6d61737465722f7265736f75726365732f7374616d70732f7374616d702d30332e706e67'
echo "Minting some NFTs...(3)"
oz send-tx --to $CONTRACT_ADDR -n ropsten --method mint --args 100,'0x68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f73616e7474656567742f66696e616c2d70726f6a6563742d737072696e6731392f6d61737465722f7265736f75726365732f7374616d70732f7374616d702d30342e706e67'
echo "Minting some NFTs...(4)"
oz send-tx --to $CONTRACT_ADDR -n ropsten --method mint --args 100,'0x68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f73616e7474656567742f66696e616c2d70726f6a6563742d737072696e6731392f6d61737465722f7265736f75726365732f7374616d70732f7374616d702d30352e706e67'
echo "Minting some NFTs...(5)"
oz send-tx --to $CONTRACT_ADDR -n ropsten --method mint --args 100,'0x68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f73616e7474656567742f66696e616c2d70726f6a6563742d737072696e6731392f6d61737465722f7265736f75726365732f7374616d70732f7374616d702d30362e706e67'
echo "Minting some NFTs...(Done)"

echo "Migration completed"
