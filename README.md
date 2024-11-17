## Start Hardhat node
### `npx hardhat node`

## If you get Error: listen EADDRINUSE: address already in use 127.0.0.1:8545
### `lsof -i :8545`
### `kill -9 PID`

## Deploy contracts
### `npx hardhat run --network localhost scripts/deploy.js`

### Modify config.json if need with addresses

## Seed exchange
### `npx hardhat run --network localhost scripts/seed-exchange.js`

## Compile React
### `npm run start` 

TODO'S:
1. Add real tokens to the exchange
2. User Onboarding with product tour
    * install Metamask
    