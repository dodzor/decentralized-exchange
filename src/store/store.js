import { createStore, combineReducers, applyMiddleware } from 'redux';
// import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { provider, token } from './reducers';

const reducer = combineReducers({
    provider,
    token
});

const initialState = {};
const middleware = [thunk];
const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)));
// const store = configureStore({reducer});

export default store;