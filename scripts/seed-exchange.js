const config = require('../src/config.json');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

const wait = (seconds) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), seconds * 1000);
    });
}

async function main() {
    const accounts = await ethers.getSigners();

    const { chainId } = await ethers.provider.getNetwork();
    console.log('Chain ID: ', chainId);

    const dext = await ethers.getContractAt('Token', config[chainId].DEXT.address);
    console.log('DEXT fetched: ', dext.address);

    const pir = await ethers.getContractAt('Token', config[chainId].PIR.address);
    console.log('PIR fetched: ', pir.address);

    const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address);
    console.log('mETH fetched: ', mETH.address);

    const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address);
    console.log('Exchange fetched: ', exchange.address);    

    const [account1, account2, exchangeAddress] = accounts;
    const amount = tokens(9000);

    let transaction;
    transaction = await dext.connect(account1).transfer(account2.address, amount);
    await transaction.wait();
    console.log(`Transfered ${amount} DEXT from ${account1.address} to ${account2.address}\n`);

    transaction = await dext.connect(account2).approve(exchange.address, amount);
    await transaction.wait();
    console.log(`Approved ${amount} DEXT from ${account2.address} to ${exchange.address}\n`);

    transaction = await exchange.connect(account2).depositToken(dext.address, amount);
    await transaction.wait();
    console.log(`Deposited ${amount} DEXT from ${account2.address} to ${exchange.address}\n`);

    transaction = await mETH.connect(account1).approve(exchange.address, amount);
    await transaction.wait();
    console.log(`Approved ${amount} mETH from ${account1.address} to ${exchange.address}\n`);

    transaction = await exchange.connect(account1).depositToken(mETH.address, amount);
    await transaction.wait();
    console.log(`Deposited ${amount} mETH from ${account1.address} to ${exchange.address}\n`);

    let orderId;
    transaction = await exchange.connect(account1).makeOrder(dext.address, tokens(10), mETH.address, tokens(1));
    result = await transaction.wait();
    console.log(`Made order from ${account1.address} to ${exchange.address}\n`);

    orderId = result.events[0].args.id;
    transaction = await exchange.connect(account1).cancelOrder(orderId);
    await transaction.wait();
    console.log(`Cancelled order from ${account1.address} to ${exchange.address}\n`);

    await wait(1);

    transaction = await exchange.connect(account1).makeOrder(dext.address, tokens(30), mETH.address, tokens(2));
    result = await transaction.wait();
    console.log(`Made order from ${account1.address} to ${exchange.address}\n`);

    orderId = result.events[0].args.id;
    transaction = await exchange.connect(account2).fillOrder(orderId);
    await transaction.wait();
    console.log(`Filled order from ${account1.address}\n`);

    await wait(1);

    transaction = await exchange.connect(account1).makeOrder(dext.address, tokens(50), mETH.address, tokens(4));
    result = await transaction.wait();
    console.log(`Made order from ${account1.address} to ${exchange.address}\n`);

    orderId = result.events[0].args.id;
    transaction = await exchange.connect(account2).fillOrder(orderId);
    await transaction.wait();
    console.log(`Filled order from ${account1.address}\n`);

    await wait(1);

    transaction = await exchange.connect(account1).makeOrder(dext.address, tokens(100), mETH.address, tokens(6));
    result = await transaction.wait();
    console.log(`Made order from ${account1.address} to ${exchange.address}\n`);

    orderId = result.events[0].args.id;
    transaction = await exchange.connect(account2).fillOrder(orderId);
    await transaction.wait();
    console.log(`Filled order from ${account1.address}\n`);

    await wait(1);

    transaction = await exchange.connect(account1).makeOrder(dext.address, tokens(40), mETH.address, tokens(3));
    result = await transaction.wait();
    console.log(`Made order from ${account1.address} to ${exchange.address}\n`);

    orderId = result.events[0].args.id;
    transaction = await exchange.connect(account2).fillOrder(orderId);
    await transaction.wait();
    console.log(`Filled order from ${account1.address}\n`);

    await wait(1);

    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(account1).makeOrder(dext.address, tokens(10 * i), mETH.address, tokens(10));
        result = await transaction.wait();

        console.log(`Made order from ${account1.address} to ${exchange.address}\n`);
        await wait(1);
    }

    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(account2).makeOrder(mETH.address, tokens(10), dext.address, tokens(10 * i));
        result = await transaction.wait();

        console.log(`Made order from ${account2.address} to ${exchange.address}\n`);
        await wait(1);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});