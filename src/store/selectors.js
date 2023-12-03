import { createSelector } from "reselect";
import { useSelector } from "react-redux";
import { get, groupBy, reject } from 'lodash';
import { ethers } from 'ethers';
import moment  from 'moment';

const tokensSelector = state => get(state, 'tokens.contracts');
const allOrdersSelector = state => get(state, 'exchange.allOrders.data', []);
const filledOrdersSelector = state => get(state, 'exchange.filledOrders.data', []);
const canceledOrdersSelector = state => get(state, 'exchange.canceledOrders.data', []);

const openOrdersSelector = state => {
    const all = allOrdersSelector(state);
    const filled = filledOrdersSelector(state);
    const cancelled = canceledOrdersSelector(state);

    const openOrders = reject(all, (order) => {
        const orderFilled = filled.some((o) => o.id.toString() === order.id.toString());
        const orderCanceled = cancelled.some((o) => o.id.toString() === order.id.toString());
        return(orderFilled || orderCanceled);
    })

    return openOrders;
}

const GREEN = '#25CE8F';
const RED = '#F45353';

const decorateOrder = (order, tokens) => {
    let token0Amount, token1Amount;

    if (order.tokenGive === tokens[1].address) {
        token0Amount = ethers.utils.formatUnits(order.amountGet, 'ether');
        token1Amount = ethers.utils.formatUnits(order.amountGive, 'ether');
    } else {
       token0Amount = ethers.utils.formatUnits(order.amountGive, 'ether');
       token1Amount = ethers.utils.formatUnits(order.amountGet, 'ether'); 
    }

    const precision = 100000;
    let tokenPrice = token1Amount / token0Amount;
    tokenPrice = Math.round(tokenPrice * precision) / precision;

    return ({
        ...order, 
        token0Amount,
        token1Amount,
        tokenPrice,
        formatedTimeStamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM Y')
    })
}

/* createSelector(
  [inputSelectors...],
  resultFunc
) */
// orders and tokens are the result of calling allOrdersSelector and tokensSelector
// resultFunc is called only if orders or tokens change
export const orderBookSelector = createSelector(
    openOrdersSelector, 
    tokensSelector, 
    (orders, tokens) => {

        if (!tokens[0] || !tokens[1]) return;

        // filter only orders with token0 and token1
        orders = orders.filter(o => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address);
        orders = orders.filter(o => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address);

        orders = decorateOrderBookOrders(orders, tokens);

        orders = groupBy(orders, 'orderType');
        
        const buyOrders = get(orders, 'buy', []);
        orders = {
            ...orders,
            buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice ) // sort in descending order
        }

        const sellOrders = get(orders, 'sell', []);
        orders = {
            ...orders,
            sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice) 
        }

        return orders;
    }
);

const decorateOrderBookOrders = (orders, tokens) => {
    return orders.map(order => {
        order = decorateOrder(order, tokens);
        order = decorateOrderBookOrder(order, tokens);
        return order;
    });
};

const decorateOrderBookOrder = (order, tokens) => {
    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell';

    return {
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
        orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
    };
};