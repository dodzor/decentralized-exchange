const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe('Exchange', () => {
    let exchange, token, deployer, feeAccount, user1;
    const feePercent = 10;

    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        user1 = accounts[2];

        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy('Decentralized Exchange Token', 'DEXT', tokens(1000000));

        const Exchange = await ethers.getContractFactory('Exchange');
        exchange = await Exchange.deploy(feeAccount.address, feePercent);

        await token.connect(deployer).transfer(user1.address, tokens(100));
    });

    describe('Deployment', () => {
        it('has correct fee account', async () => {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address);
        });

        it('has correct fee percent', async () => {
            expect(await exchange.feePercent()).to.equal(feePercent);
        });
    });

    describe('Depositing tokens', () => {
        let transaction, result;
        const amount = tokens(100);

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await token.connect(user1).approve(exchange.address, amount);
                result = await transaction.wait();
    
                transaction = await exchange.connect(user1).depositToken(token.address, amount);    
                result = await transaction.wait();
            });
    
            it('tracks the token deposit', async () => {
                expect(await token.balanceOf(exchange.address)).to.equal(amount);
                expect(await exchange.tokens(token.address, user1.address)).to.equal(amount);
                expect(await exchange.balanceOf(token.address, user1.address)).to.equal(amount);
            });
    
            it('emits Deposit event', async () => {
                // const event = result.events[1];
                const event = result.events.find((event) => event.event === 'Deposit');
                expect(event.event).to.equal('Deposit');
                expect(event.args.token).to.equal(token.address);
                expect(event.args.user).to.equal(user1.address);
                expect(event.args.amount.toString()).to.equal(amount.toString());
                expect(event.args.balance.toString()).to.equal(amount.toString());
            });
        });

        describe('Failure', () => {
            it('fails when no tokens are approved', async () => {
                await expect(exchange.connect(user1).depositToken(token.address, amount)).to.be.revertedWith('Insufficient allowance');
            });
        });
    });

    describe('Withdrawing tokens', () => {
        let transaction, result;
        const amount = tokens(100);

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await token.connect(user1).approve(exchange.address, amount);
                result = await transaction.wait();
    
                transaction = await exchange.connect(user1).depositToken(token.address, amount);    
                result = await transaction.wait();

                transaction = await exchange.connect(user1).withdrawToken(token.address, amount);
                result = await transaction.wait();
            });
    
            it('tracks the token deposit', async () => {
                expect(await token.balanceOf(exchange.address)).to.equal(0);
                expect(await exchange.tokens(token.address, user1.address)).to.equal(0);
                expect(await exchange.balanceOf(token.address, user1.address)).to.equal(0);
            });
    
            it('emits Deposit event', async () => {
                // const event = result.events[1];
                const event = result.events.find((event) => event.event === 'Withdraw');
                expect(event.event).to.equal('Withdraw');
                expect(event.args.token).to.equal(token.address);
                expect(event.args.user).to.equal(user1.address);
                expect(event.args.amount.toString()).to.equal(amount);
                expect(event.args.balance).to.equal(0);
            });
        });

        describe('Failure', () => {
            it('fails when no tokens are approved', async () => {
                await expect(exchange.connect(user1).withdrawToken(token.address, amount)).to.be.revertedWith('Insufficient balance');
            });
        });
    });

    describe('Checking balances', () => {
        let transaction, result;
        const amount = tokens(100);

        beforeEach(async () => {
            transaction = await token.connect(user1).approve(exchange.address, amount);
            result = await transaction.wait();

            transaction = await exchange.connect(user1).depositToken(token.address, amount);    
            result = await transaction.wait();
        });

        it('returns user balance', async () => {
            expect(await exchange.balanceOf(token.address, user1.address)).to.equal(amount);
        });
    });
});
