const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe('Exchange', () => {
    let exchange, token1, token2, deployer, feeAccount, user1, user2;
    const feePercent = 10;

    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        user1 = accounts[2];
        user2 = accounts[3];

        const Token = await ethers.getContractFactory('Token');
        token1 = await Token.deploy('Decentralized Exchange Token', 'DEXT', tokens(1000000));
        token2 = await Token.deploy('Pirate Dolars', 'PIR', tokens(1000000));

        const Exchange = await ethers.getContractFactory('Exchange');
        exchange = await Exchange.deploy(feeAccount.address, feePercent);

        await token1.connect(deployer).transfer(user1.address, tokens(100));
        await token2.connect(deployer).transfer(user1.address, tokens(100));
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
                transaction = await token1.connect(user1).approve(exchange.address, amount);
                result = await transaction.wait();
    
                transaction = await exchange.connect(user1).depositToken(token1.address, amount);    
                result = await transaction.wait();
            });
    
            it('tracks the token deposit', async () => {
                expect(await token1.balanceOf(exchange.address)).to.equal(amount);
                expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount);
                expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount);
            });
    
            it('emits Deposit event', async () => {
                // const event = result.events[1];
                const event = result.events.find((event) => event.event === 'Deposit');
                expect(event.event).to.equal('Deposit');
                expect(event.args.token).to.equal(token1.address);
                expect(event.args.user).to.equal(user1.address);
                expect(event.args.amount.toString()).to.equal(amount.toString());
                expect(event.args.balance.toString()).to.equal(amount.toString());
            });
        });

        describe('Failure', () => {
            it('fails when no tokens are approved', async () => {
                await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.revertedWith('Insufficient allowance');
            });
        });
    });

    describe('Withdrawing tokens', () => {
        let transaction, result;
        const amount = tokens(100);

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await token1.connect(user1).approve(exchange.address, amount);
                result = await transaction.wait();
    
                transaction = await exchange.connect(user1).depositToken(token1.address, amount);    
                result = await transaction.wait();

                transaction = await exchange.connect(user1).withdrawToken(token1.address, amount);
                result = await transaction.wait();
            });
    
            it('tracks the token withdrawal', async () => {
                expect(await token1.balanceOf(exchange.address)).to.equal(0);
                expect(await exchange.tokens(token1.address, user1.address)).to.equal(0);
                expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0);
            });
    
            it('emits Withdraw event', async () => {
                // const event = result.events[1];
                const event = result.events.find((event) => event.event === 'Withdraw');
                expect(event.event).to.equal('Withdraw');
                expect(event.args.token).to.equal(token1.address);
                expect(event.args.user).to.equal(user1.address);
                expect(event.args.amount.toString()).to.equal(amount);
                expect(event.args.balance).to.equal(0);
            });
        });

        describe('Failure', () => {
            it('fails when no tokens are approved', async () => {
                await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.revertedWith('Insufficient balance');
            });
        });
    });

    describe('Checking balances', () => {
        let transaction, result;
        const amount = tokens(100);

        beforeEach(async () => {
            transaction = await token1.connect(user1).approve(exchange.address, amount);
            result = await transaction.wait();

            transaction = await exchange.connect(user1).depositToken(token1.address, amount);    
            result = await transaction.wait();
        });

        it('returns user balance', async () => {
            expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount);
        });
    });

    describe('Making orders', () => {
        let transaction, result;
        const amount = tokens(1);

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await token1.connect(user1).approve(exchange.address, amount);
                result = await transaction.wait();
    
                transaction = await exchange.connect(user1).depositToken(token1.address, amount);    
                result = await transaction.wait();
    
                transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount);
                result = await transaction.wait();
            });

            it('tracks the new order', async () => {
                expect(await exchange.orderCount()).to.equal(1);
            });

            it('emits Order event', async () => {
                const event = result.events.find((event) => event.event === 'Order');
                expect(event.event).to.equal('Order');
                expect(event.args.id).to.equal(1);
                expect(event.args.user).to.equal(user1.address);
                expect(event.args.tokenGet).to.equal(token2.address);
                expect(event.args.amountGet.toString()).to.equal(amount.toString());
                expect(event.args.tokenGive).to.equal(token1.address);
                expect(event.args.amountGive.toString()).to.equal(amount.toString());
                expect(event.args.timestamp).to.at.least(1);
            });
        });

        describe('Failure', () => {
            it('fails with no balance', async () => {
                await expect(exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)).to.be.revertedWith('Insufficient balance');
            });
        });
    });

    describe('Order actions', () => {
        let transaction, result;
        let amount = tokens(1);
        beforeEach(async () => {
            transaction = await token1.connect(user1).approve(exchange.address, amount);
            result = await transaction.wait();

            transaction = await exchange.connect(user1).depositToken(token1.address, amount);    
            result = await transaction.wait();

            transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount);
            result = await transaction.wait();
        });

        describe('Cancelling orders', async () => {
            beforeEach(async () => {
                transaction = await exchange.connect(user1).cancelOrder(1);
                result = await transaction.wait();
            });

            describe('Success', () => {
                it('updates cancelled orders', async () => {
                    const orderCancelled = await exchange.orderCancelled(1);
                    expect(orderCancelled).to.equal(true);
                });

                it('emits Cancel event', async () => {
                    const event = result.events.find((event) => event.event === 'Cancel');
                    expect(event.event).to.equal('Cancel');
                    expect(event.args.id).to.equal(1);
                    expect(event.args.user).to.equal(user1.address);
                    expect(event.args.tokenGet).to.equal(token2.address);
                    expect(event.args.amountGet.toString()).to.equal(amount.toString());
                    expect(event.args.tokenGive).to.equal(token1.address);
                    expect(event.args.amountGive.toString()).to.equal(amount.toString());
                    expect(event.args.timestamp).to.at.least(1);
                });
            });

            describe('Failure', () => {
                it('rejects invalid order ids', async () => {
                    transaction = await token1.connect(user1).approve(exchange.address, amount);
                    result = await transaction.wait();

                    transaction = await exchange.connect(user1).depositToken(token1.address, amount);    
                    result = await transaction.wait();

                    transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount);
                    result = await transaction.wait();

                    await expect(exchange.connect(user1).cancelOrder(9999)).to.be.reverted;
                });

                it('rejects unauthorized cancellations', async () => {
                    await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted;
                });
            });
        });


    });
});
