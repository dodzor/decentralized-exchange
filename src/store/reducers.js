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
    symbols: []
};

export const tokens = (state = DEFAULT_TOKENS_STATE, action) => {
    switch (action.type) {
        case 'TOKEN_1_LOADED':
            return {
                ...state,
                loaded: true,
                contracts: [action.token], // add token contract to contracts array
                symbols: [action.symbol] // add token symbol to symbols array
            }
        case 'TOKEN_2_LOADED':
            return {
                ...state,
                loaded: true,
                contracts: [...state.contracts, action.token], // expand contracts array with new token contract
                symbols: [...state.symbols, action.symbol] //expand symbols array with new token symbol
            }
        default:
            return state;
    }
}

export const exchange = (state = { loaded: false, contract: {}}, action) => {
    switch (action.type) {
        case 'EXCHANGE_LOADED':
            return {
                ...state,
                loaded: true,
                contract: action.exchange
            }
        default:
            return state;
    }
}

