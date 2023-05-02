const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (n) => {
    return ethers.utils.parseUnits(n, 'ether');
}

describe('Token', () => {
    let token;

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy('Decentralized Exchange Token', 'DEXT', tokens('1000000'));
    });

    describe('Deployment', () => {
        it('has correct name', async () => {
            expect(await token.name()).to.equal('Decentralized Exchange Token');
        });
    
        it('has correct symbol', async () => {
            expect(await token.symbol()).to.equal('DEXT');
        });
    
        it('has correct decimals', async () => {
            expect(await token.decimals()).to.equal('18');
        });
    
        it('has correct total suply', async () => {
            expect(await token.totalSupply()).to.equal(tokens('1000000'));
        });
    });
})