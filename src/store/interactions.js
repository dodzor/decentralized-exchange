import { ethers } from 'ethers';
import TOKEN_ABI from '../abi/Token.json';
import EXCHANGE_ABI from '../abi/Exchange.json';
import { lowerCase } from 'lodash';
import { exchange } from './reducers';

export const loadProvider = (dispatch) => {
    const connection = new ethers.providers.Web3Provider(window.ethereum);
    dispatch({ type: 'PROVIDER_LOADED', connection });

    return connection;
}

export const loadNetwork = async (dispatch, provider) => {
    const { chainId } = await provider.getNetwork();
    dispatch({ type: 'NETWORK_LOADED', chainId });

    return chainId;
};

export const loadAccount = async (dispatch, provider) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = ethers.utils.getAddress(accounts[0]);

    dispatch({ type: 'ACCOUNT_LOADED', account });

    let balance = await provider.getBalance(account);
    balance = ethers.utils.formatEther(balance);
    dispatch({ type: 'ETHER_BALANCE_LOADED', balance});

    return account;
};

export const loadTokens = async ( provider, addresses, logos, dispatch ) => {   
    let token, symbol;
    const logo1 = lowerCase(logos[0]).replace(/\s+/g, '');
    const logo2 = lowerCase(logos[1]).replace(/\s+/g, '');
    
    token = new ethers.Contract(addresses[0], TOKEN_ABI, provider);
    symbol = await token.symbol();
    dispatch({ type: 'TOKEN_1_LOADED', token, symbol, logo1 });

    token = new ethers.Contract(addresses[1], TOKEN_ABI, provider);
    symbol = await token.symbol();
    dispatch({ type: 'TOKEN_2_LOADED', token, symbol, logo2 });

    return token;
};

export const loadExchange = async (provider, address, dispatch) => {
    const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
    dispatch({ type: 'EXCHANGE_LOADED', exchange });

    return exchange;
}

export const subscribeToEvents = (exchange, dispatch) => {
    exchange.on('Deposit', (token, user, amount, balance, event) => {
        dispatch({ type: 'TRANSFER_SUCCESS', event });
    });

    exchange.on('Withdraw', (token, user, amount, balance, event) => {
        dispatch({ type: 'TRANSFER_SUCCESS', event });
    });

    exchange.on('Order', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
        const order = event.args;
        dispatch({ type: 'ORDER_SUCCESS', event, order });
    });

    exchange.on('Cancel', (id, tokenGet, amountGet, tokenGive, amountGive, user, timestamp, event) => {
        const order = event.args;
        dispatch({ type: 'ORDER_CANCEL_SUCCESS', event, order });
    });

    exchange.on('Trade', (id, user, tokenGet, amountGet, tokenGive, amountGive, creator, timestamp, event) => {
        const order = event.args;
        console.log(order, event)
        dispatch( { type: 'ORDER_FILL_SUCCESS', event, order });
    });
}

export const loadBalances = async (exchange, tokens, account, dispatch) => {
    let balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18);
    dispatch({ type: 'TOKEN_1_BALANCE_LOADED', balance })

    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account), 18)
    dispatch({ type: 'EXCHANGE_1_BALANCE_LOADED', balance });

    balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18);
    dispatch({ type: 'TOKEN_2_BALANCE_LOADED', balance })

    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account), 18)
    dispatch({ type: 'EXCHANGE_2_BALANCE_LOADED', balance });
}

export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {
    let transaction;

    dispatch({ type: 'TRANSFER_REQUEST' });

    const signer = provider.getSigner();
    const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18);

    try {
        if (transferType === 'deposit') {
            transaction = await token.connect(signer).approve(exchange.address, amountToTransfer);
            transaction.wait();

            transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer);
            transaction.wait();
        } else {
            transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer);
            transaction.wait();
        }
    } catch(error) {
        dispatch({ type: 'TRANSFER_FAIL' });
    }
}

export const makeBuyOrder = async (provider, exchange, tokens, order, dispatch) => {
    const tokenGet = tokens[0].address;
    const amountGet = ethers.utils.parseUnits(order.amount, 18);
    const tokenGive = tokens[1].address;
    const amountGive = ethers.utils.parseUnits((order.amount * order.price).toString(), 18);

    dispatch({ type: 'ORDER_REQUEST' });

    try {
        const signer = await provider.getSigner();
        const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive);
        transaction.wait();
    } catch (error) {
        console.log(error);
        dispatch({ type: 'ORDER_FAIL' });
    }
}

export const makeSellOrder = async (provider, exchange, tokens, order, dispatch) => {
    const tokenGet = tokens[1].address;
    const amountGet = ethers.utils.parseUnits((order.amount * order.price).toString(), 18);
    const tokenGive = tokens[0].address;
    const amountGive = ethers.utils.parseUnits(order.amount, 18);

    dispatch({ type: 'ORDER_REQUEST' });

    try {
        const signer = await provider.getSigner();
        const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive);
        transaction.wait();
    } catch (error) {
        console.log(error);
        dispatch({ type: 'ORDER_FAIL' });
    }
}


export const loadAllOrders = async (provider, exchange, dispatch) => {
    const block = await provider.getBlockNumber();

    const filledStream = await exchange.queryFilter('Trade', 0, block);
    const filledOrders = filledStream.map(event => event.args);
    dispatch({ type: 'FILLED_ORDERS_LOADED', filledOrders });

    const canceledStream = await exchange.queryFilter('Cancel', 0, block);
    const canceledOrders = canceledStream.map(event => event.args);
    dispatch({ type: 'CANCELED_ORDERS_LOADED', canceledOrders });

    const orderStream = await exchange.queryFilter('Order', 0, block);
    const allOrders = orderStream.map(event => event.args);

    dispatch({ type: 'ALL_ORDERS_LOADED', allOrders });
}

export const cancelOrder = async (provider, exchange, order, dispatch) => {
    dispatch({ type: 'ORDER_CANCEL_REQUEST' });

    try {
        const signer = await provider.getSigner();
        const transaction = await exchange.connect(signer).cancelOrder(order.id);
        transaction.wait();
    } catch (err) {
        dispatch({ type: 'ORDER_CANCEL_FAIL' });
    }
}

export const fillOrder = async (provider, exchange, order, dispatch) => {
    dispatch({ type: 'ORDER_FILL_REQUEST' });

    try {
        const signer = await provider.getSigner();
        const transaction = await exchange.connect(signer).fillOrder(order.id);
        transaction.wait();
    } catch (err) {
        console.log(err);
        dispatch({ type: 'ORDER_FILL_FAIL' });
    }
}