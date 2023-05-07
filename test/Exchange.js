const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Exchange', () => {
    let deployer, exchange, feeAccount
    const feePercent = 10;

    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];

        const Exchange = await ethers.getContractFactory('Exchange');
        exchange = await Exchange.deploy(feeAccount.address, feePercent);
    });

    describe('Deployment', () => {
        it('has correct fee account', async () => {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address);
        });

        it('has correct fee percent', async () => {
            expect(await exchange.feePercent()).to.equal(feePercent);
        });
    });
});
