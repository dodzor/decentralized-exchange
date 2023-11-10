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
    orders: []
}

export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {
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
            return {
                ...state,
                transaction: {
                    transactionType: 'New Order',
                    isPending: false,
                    isSuccessful: true
                },
                transferInProgress: false,
                events: [...state.events, action.event],
                orders: [...state.orders, action.order]
            }
                
        default:
            return state;
    }
}

