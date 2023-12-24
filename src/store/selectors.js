import { createSelector } from "reselect";
import { useSelector } from "react-redux";
import { get, groupBy, reject, minBy, maxBy } from 'lodash';
import { ethers } from 'ethers';
import { defaultSeries } from '../components/PriceChart.conf';

import moment from 'moment';

const tokensSelector = state => get(state, 'tokens.contracts');
const allOrdersSelector = state => get(state, 'exchange.allOrders.data', []);
const filledOrdersSelector = state => get(state, 'exchange.filledOrders.data', []);
const canceledOrdersSelector = state => get(state, 'exchange.canceledOrders.data', []);
const accountSelector = state => get(state, 'provider.account');
const eventsSelector = state => get(state, 'exchange.events');

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
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa D MMM Y')
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

        // filter only orders with selected pair
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

export const priceChartSelector = createSelector(
    filledOrdersSelector,
    tokensSelector,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return; }

        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address);
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address);

        // sort orders by date ascending to compare hystory
        orders = orders.sort((a, b) => a.timestamp - b.timestamp);

        orders = orders.map((o) => decorateOrder(o, tokens));

        let secondLastOrder, lastOrder;
        [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length);
        const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)
        const lastPrice = get(lastOrder, 'tokenPrice', 0)

        return {
            ...buildGraphData(orders),
            lastPrice,
            lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-')
        };
    }
);

export const tradesSelector = createSelector(
    filledOrdersSelector,
    tokensSelector,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return; }

        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address);
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address);

        // sort in ascending order for price comparison
        orders = orders.sort((a, b) => a.timestamp - b.timestamp); 

        // decorate orders 
        orders = decorateFilledOrders(orders, tokens);

        // sort in descending order for display
        orders = orders.sort((a, b) => b.timestamp - a.timestamp);

        return orders;
    }
);

export const myOpenOrdersSelector = createSelector(
    openOrdersSelector,
    tokensSelector,
    accountSelector,
    (orders, tokens, account) => {        
        if (!tokens[0] || !tokens[1]) { return; }
     
        orders = orders.filter((o) => o.user === account)
     
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address);
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address);
        
        orders = decorateMyOpenOrders(orders, tokens);

        orders = orders.sort((a, b) => b.timestamp - a.timestamp);
        return orders;
    }
);

export const myTradesSelector = createSelector(
    filledOrdersSelector,
    tokensSelector,
    accountSelector,
    (orders, tokens, account) => {
        if (!tokens[0] || !tokens[1]) { return; }

        orders = orders.filter((o) => o.user === account || o.creator === account);

        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address);
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address);

        orders = orders.sort((a, b) => b.timestamp - a.timestamp);

        orders = decorateMyTrades(orders, tokens, account);
        return orders;
    }
);

export const myEventsSelector = createSelector(
    eventsSelector,
    accountSelector,
    (events, account) => {
        events = events.filter((event) => event.args.user === account);
        console.log(events);
        
        return events;
    }
)

const decorateMyOpenOrders = (orders, tokens, account) => {
    orders = orders.map((order) => {
        order = decorateOrder(order, tokens);
        order = decorateMyOpenOrder(order, tokens);
        return order;
    });

    return orders;
}

const decorateMyTrades = (orders, tokens, account) => {
    orders = orders.map((order) => {
        order = decorateOrder(order, tokens);
        order = decorateMyTrade(order, tokens, account);
        return order;
    })
    return orders;
}

const decorateMyOpenOrder = (order, tokens) => {
    const orderType = order.tokenGet === tokens[0].address ? 'buy' : 'sell';

    return {
        ...order,
        orderType,
        orderTypeClass: orderType === 'buy' ? GREEN : RED
    };
}

const decorateMyTrade = (order, tokens, account) => {
    const myOrder = order.creator === account;

    // debugger
    let orderType;
    if (myOrder) {
        console.log('my order..');
        orderType = order.tokenGive = tokens[1].address ? 'buy' : 'sell';
    } else {
        console.log('not my order..');
        orderType = order.tokenGive = tokens[1].address ? 'sell' : 'buy';
    }

    return {
        ...order,
        orderType,
        orderClass: orderType === 'buy' ? GREEN : RED,
        orderSign: orderType === 'buy' ? '+' : '-'
    };
}

const decorateFilledOrders = (orders, tokens) => {
    let previousOrder = orders[0];
    return orders.map(order => {
        order = decorateOrder(order, tokens);
        order = decorateFilledOrder(order, previousOrder);
        previousOrder = order;
        return order;
    });
}

const decorateFilledOrder = (order, previousOrder) => {
    return {
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
    };
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    if (previousOrder.id === orderId) {
        return GREEN;
    }

    if (previousOrder.tokenPrice <= tokenPrice) {
        return GREEN;
    } else {
        return RED;
    }
}

const buildGraphData = (orders) => {
    // Group orders by hour for the graph
    orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format());

    const hours = Object.keys(orders);

    if (!hours.length) {
        return defaultSeries;
    }

    const graphData = hours.map((hour) => {
        // Get orders for current hour
        const group = orders[hour];

        const open = group[0];
        const high = maxBy(group, 'tokenPrice');
        const low = minBy(group, 'tokenPrice');
        const close = group[group.length - 1];

        return({
            x: new Date(hour),
            y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
        });
    })

    return({
        series: [{
            data: graphData
        }]
    });
}