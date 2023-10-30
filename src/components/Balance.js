import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';

import pirate from '../assets/piratebit-nobg.png';

import { loadBalances } from '../store/interactions'; 
import { transferTokens } from '../store/interactions';

const Balance = () => {
    const [token1TransferAmmount, setToken1TransferAmmount] = useState(0)

    const tokens = useSelector(state => state.tokens.contracts);
    const tokenBalances = useSelector(state => state.tokens.balances);
    const symbols = useSelector(state => state.tokens.symbols);
    const exchange = useSelector(state => state.exchange.contract);
    const exchangeBalances = useSelector(state => state.exchange.balances);
    const account = useSelector(state => state.provider.account);
    const provider = useSelector(state => state.provider.connection);
    const transferInProgress = useSelector(state => state.exchange.transferInProgress);

    const dispatch = useDispatch();
    
    useEffect(() => {
      if (tokens[0] && tokens[1] && exchange && account)
        loadBalances(exchange, tokens, account, dispatch);
    }, [tokens, exchange, account, transferInProgress]) // run effect only when dependencies change

    const ammountHandler = (e, token) => {
      if (token.address === tokens[0].address) {
        setToken1TransferAmmount(e.target.value);
      }
    }

    // Step 1: do tranfer;
    // Step 2: Notify app that the tranfer is pending
    // Step 3: Get confirmation from blockchain that transfer was successful
    // Step 4: Notify app that transfer was successful
    // Step 5: Handle transfer fails - notify app

    const submitHandler = (e, token) => {
      e.preventDefault();
      
      if (token.address === tokens[0].address) {
        transferTokens(provider, exchange, 'deposit', token, token1TransferAmmount, dispatch);
      }
    }

    return (
      <div className='component exchange__transfers'>
        <div className='component__header flex-between'>
          <h2>Balance</h2>
          <div className='tabs'>
            <button className='tab tab--active'>Deposit</button>
            <button className='tab'>Withdraw</button>
          </div>
        </div>
  
        {/* Deposit/Withdraw Component 1 (DApp) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><img src={pirate} width='20' alt="Pirate logo"></img>{symbols && symbols[0]}</p>
            <p><small>Wallet</small>{tokenBalances && tokenBalances[0]}</p>
            <p><small>Exchange</small>{exchangeBalances && exchangeBalances[0]}</p>
          </div>
  
          <form onSubmit={(e) => submitHandler(e, tokens[0])}>
            <label htmlFor="token0"></label>
            <input type="text" id='token0' placeholder='0.0000' onChange={(e) => ammountHandler(e, tokens[0])}/>
  
            <button className='button' type='submit'>
              <span>Deposit</span>
            </button>
          </form>
        </div>
  
        <hr />
  
        {/* Deposit/Withdraw Component 2 (mETH) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><img src={pirate} width='20' alt="Pirate logo"></img>{symbols && symbols[1]}</p>
          </div>
  
          <form>
            <label htmlFor="token1"></label>
            <input type="text" id='token1' placeholder='0.0000'/>
  
            <button className='button' type='submit'>
              <span></span>
            </button>
          </form>
        </div>
  
        <hr />
      </div>
    );
  }
  
  export default Balance;
