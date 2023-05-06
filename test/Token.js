const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe('Token', () => {
    let token, deployer, accounts, receiver, exchange;

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy('Decentralized Exchange Token', 'DEXT', tokens(1000000));

        accounts = await ethers.getSigners();
        deployer = accounts[0];
        receiver = accounts[1];
        exchange = accounts[2];
    });

    describe('Deployment', () => {
        let name = 'Decentralized Exchange Token';
        let symbol = 'DEXT';
        let decimals = '18';
        let totalSupply = tokens('1000000');

        it('has correct name', async () => {
            expect(await token.name()).to.equal(name);
        });
    
        it('has correct symbol', async () => {
            expect(await token.symbol()).to.equal(symbol);
        });
    
        it('has correct decimals', async () => {
            expect(await token.decimals()).to.equal(decimals);
        });
    
        it('has correct total suply', async () => {
            expect(await token.totalSupply()).to.equal(totalSupply);
        });

        it('assigns total supply to deployer', async () => {
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
        });
    })

    describe('Sending tokens', () => {
        let amount, transaction, result;

        describe('Success', () => {
            beforeEach(async () => {
                amount = tokens(100);
                transaction = await token.connect(deployer).transfer(receiver.address, amount);
                result = await transaction.wait();
            }); 
      
            it('transfer token balances', async () => {
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900));
                expect(await token.balanceOf(receiver.address)).to.equal(tokens(100));
            });
    
            it('emits Transfer event', async () => {
                // expect(transaction).to.emit(token, 'Transfer').withArgs(deployer.address, receiver.address, amount);
                const event = result.events.find((event) => event.event === 'Transfer');
                expect(event.event).to.equal('Transfer')
                expect(event.args.from).to.equal(deployer.address);
                expect(event.args.to).to.equal(receiver.address);
                expect(event.args.value).to.equal(amount);
            });
        });

        describe('Failure', () => {
            it('rejects insufficient balances', async () => {
                amount = tokens(100000000);
                await expect(token.connect(deployer).transfer(receiver.address, amount)).to.be.revertedWith('Insufficient balance');
            });
    
            it('rejects invalid recipients', async () => { 
                amount = tokens(100);
                await expect(token.connect(deployer).transfer(ethers.constants.AddressZero, amount)).to.be.revertedWith('Invalid recipient address');
            });
        });
    });

    describe('Approving tokens', () => { 
        beforeEach(async () => {
            amount = await tokens(100);
            transaction = await token.connect(deployer).approve(exchange.address, amount);
            result = await transaction.wait();
        });

        describe('Success', () => {
            it('allocates an allowance for delegated token spending on exchange', async () => {
                expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount);
            });

            it('emits Approval event', async () => {    
                const event = result.events[0];
                expect(event.event).to.equal('Approval');
                expect(event.args.owner).to.equal(deployer.address);
                expect(event.args.spender).to.equal(exchange.address);
                expect(event.args.value).to.equal(amount);
            });
        });

        describe('Failure', () => {
            it('rejects invalid spenders', async () => {
                await expect(token.connect(deployer).approve(ethers.constants.AddressZero, amount)).to.be.revertedWith('Invalid spender address');
            });
        });

    });

})