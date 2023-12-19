export const provider = (state = {}, action) => {
    switch (action.type) {
        case 'PROVIDER_LOADED':
            return {
                ...state,
                connection: action.connection
            }
        case 'NETWORK_LOADED':
            return {
                ...state,
                chainId: action.chainId
            }
        case 'ACCOUNT_LOADED':
            return {
                ...state,
                account: action.account
            }
        case 'ETHER_BALANCE_LOADED':
            return {
                ...state,
                balance: action.balance 
            }
        default:
            return state;
    }
};

const DEFAULT_TOKENS_STATE = {
    loaded: false,
    contracts: [],
    symbols: [],
    logos: []
};

export const tokens = (state = DEFAULT_TOKENS_STATE, action) => {
    switch (action.type) {
        case 'TOKEN_1_LOADED':
            return {
                ...state,
                loaded: true,
                contracts: [action.token], // add token contract to contracts array
                symbols: [action.symbol], // add token symbol to symbols array
                logos: [action.logo1]
            }

        case 'TOKEN_1_BALANCE_LOADED':
            return {
                ...state,
                balances: [action.balance]
            }

        case 'TOKEN_2_LOADED':
            return {
                ...state,
                loaded: true,
                contracts: [...state.contracts, action.token], // expand contracts array with new token contract
                symbols: [...state.symbols, action.symbol], //expand symbols array with new token symbol
                logos: [...state.logos, action.logo2]
            }

        case 'TOKEN_2_BALANCE_LOADED':
            return {
                ...state,
                balances: [...state.balances, action.balance]
            }
        
        default:
            return state;
    }
}

const DEFAULT_EXCHANGE_STATE = { 
    loaded: false, 
    contract: {},
    events: [],
    allOrders: { data: [] },
    canceledOrders: { data: [] },
    filledOrders: { data: [] }
}

export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {
    let index, data;

    switch (action.type) {
        case 'EXCHANGE_LOADED':
            return {
                ...state,
                loaded: true,
                contract: action.exchange
            }

        case 'EXCHANGE_1_BALANCE_LOADED':
            return {
                ...state,
                balances: [action.balance]
            }

        case 'EXCHANGE_2_BALANCE_LOADED':
            return {
                ...state,
                balances: [...state.balances, action.balance]
            }

        case 'TRANSFER_REQUEST':
            return {
                ...state,
                transaction: {
                    transactionType: 'Transfer',
                    isPending: true,
                    isSuccessful: false
                },
                transferInProgress: true
            }
        
        case 'TRANSFER_SUCCESS':
            return {
                ...state,
                transaction: {
                    transactionType: 'Transfer',
                    isPending: false,
                    isSuccessful: true
                },
                transferInProgress: false,
                events: [...state.events, action.event]
            }

        case 'TRANSFER_FAIL':
            return {
                ...state,
                transaction: {
                    transactionType: 'Transfer',
                    isPending: false,
                    isSuccessful: false,
                    isError: true
                },
                transferInProgress: false
            }

        case 'ORDER_REQUEST':
            return {
                ...state,
                transaction: {
                    transactionType: 'New Order',
                    isPending: true,
                    isSuccessful: false,
                },
                transferInProgress: true
            }

        case 'ORDER_FAIL': 
            return {
                ...state,
                transaction: {
                    transactionType: 'New Order',
                    isPending: false,
                    isSuccessful: false,
                    isError: true
                },
                transferInProgress: false
            }

        case 'ORDER_SUCCESS':
            //prevent duplicate orders
            index = state.allOrders.data.findIndex(order => order.id.toString() === action.order.id.toString());

            if (index === -1) {
                data = [...state.allOrders.data, action.order];
            } else {
                data = state.allOrders.data;
            }

            return {
                ...state,
                transaction: {
                    transactionType: 'New Order',
                    isPending: false,
                    isSuccessful: true
                },
                transferInProgress: false,
                events: [...state.events, action.event],
                allOrders: {
                    ...state.allOrders,
                    data
                }
            }

        case 'ALL_ORDERS_LOADED': 
            return {
                ...state,
                allOrders: {
                    loaded: true,
                    data: action.allOrders
                }
            }
        
        case 'FILLED_ORDERS_LOADED':
            return {
                ...state,
                filledOrders: {
                    loaded: true,
                    data: action.filledOrders
                }
            }
        
        case 'CANCELED_ORDERS_LOADED':
            return {
                ...state,
                canceledOrders: {
                    loaded: true,
                    data: action.canceledOrders
                }
            }

        case 'ORDER_CANCEL_REQUEST':
            return {
                ...state,
                transaction: {
                    transactionType: 'Cancel Order',
                    isPending: true,
                    isSuccessful: false
                },
                transferInProgress: true
            }

        case 'ORDER_FILL_REQUEST':
            return {
                ...state,
                transaction: {
                    transactionType: 'Fill Order',
                    isPending: true,
                    isSuccessful: false
                },
                transferInProgress: true
            }

        case 'ORDER_CANCEL_SUCCESS':
            return {
                ...state,
                transaction: {
                    transactionType: 'Cancel Order',
                    isPending: false,
                    isSuccessful: true
                },
                transferInProgress: false,
                canceledOrders: {
                    ...state.canceledOrders,
                    data: [
                        ...state.canceledOrders.data,
                        action.order
                    ]
                },
                events: [...state.events, action.event]
            }

        case 'ORDER_FILL_SUCCESS':
            console.log(action.order);
            console.log(state.filledOrders.data);
            //prevent duplicate orders
            let indexFilled = state.filledOrders.data.findIndex(order => order.id.toString() === action.order.id.toString());

            if (indexFilled === -1) {
                data = [...state.filledOrders.data, action.order];
            } else {
                data = state.filledOrders.data;
            }

            return {
                ...state,
                transaction: {
                    transactionType: 'Fill Order',
                    isPending: false,
                    isSuccessful: true
                },
                transferInProgress: false,
                events: [...state.events, action.event],
                filledOrders: {
                    ...state.filledOrders,
                    data
                }
            }

        case 'ORDER_CANCEL_FAIL':
            return {
                ...state,
                transaction: {
                    transactionType: 'Cancel Order',
                    isPending: false,
                    isSuccessful: false,
                    isError: true
                },
                transferInProgress: false
            }

        case 'ORDER_FILL_FAIL': 
            return {
                ...state,
                transaction: {
                    transactionType: 'Fill Order',
                    isPending: false,
                    isSuccessful: false,
                    isError: true
                },
                transferInProgress: false
            }
            
        default:
            return state;
    }
}

