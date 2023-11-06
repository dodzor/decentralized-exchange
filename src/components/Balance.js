import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useRef } from 'react';

import { loadBalances } from '../store/interactions'; 
import { transferTokens } from '../store/interactions';

const Balance = () => {
    const [token1TransferAmmount, setToken1TransferAmmount] = useState(0)
    const [token2TransferAmmount, setToken2TransferAmmount] = useState(0)

    const [logo1Image, setLogo1Image] = useState(null);
    const [logo2Image, setLogo2Image] = useState(null);
    const [isDeposit, setIsDeposit] = useState(true);

    const tokens = useSelector(state => state.tokens.contracts);
    const tokenBalances = useSelector(state => state.tokens.balances);
    const symbols = useSelector(state => state.tokens.symbols);
    const exchange = useSelector(state => state.exchange.contract);
    const exchangeBalances = useSelector(state => state.exchange.balances);
    const account = useSelector(state => state.provider.account);
    const provider = useSelector(state => state.provider.connection);
    const transferInProgress = useSelector(state => state.exchange.transferInProgress);
    const logos = useSelector(state => state.tokens.logos);

    const depositRef = useRef(null);
    const withdrawRef = useRef(null);

    const dispatch = useDispatch();
    
    useEffect(() => {
      if (tokens[0] && tokens[1] && exchange && account)
        loadBalances(exchange, tokens, account, dispatch);
    }, [tokens, exchange, account, transferInProgress]) // run effect only when dependencies change

    // import token logos dynamically
    useEffect(() => {
      async function loadImage() {
        try {
          let logoFileName = logos[0]; 
          let imageModule = await import(`../assets/${logoFileName}.png`);
          setLogo1Image(imageModule.default);

          logoFileName = logos[1]; 
          imageModule = await import(`../assets/${logoFileName}.png`);
          setLogo2Image(imageModule.default);
        } catch (error) {
          console.error(error);
        }
      }
  
      if (logos.length > 0) {
        loadImage();
      }
    }, [logos]);

    const ammountHandler = (e, token) => {
      if (token.address === tokens[0].address) {
        setToken1TransferAmmount(e.target.value);
      } else {
        setToken2TransferAmmount(e.target.value);
      }
    }

    // Step 1: Do tranfer;
    // Step 2: Notify app that the tranfer is pending
    // Step 3: Get confirmation from blockchain that transfer was successful
    // Step 4: Notify app that transfer was successful
    // Step 5: Handle transfer fails - notify app

    const submitHandler = (e, token) => {
      e.preventDefault();
      
      if (token.address === tokens[0].address) {
        transferTokens(provider, exchange, 'deposit', token, token1TransferAmmount, dispatch);
        setToken1TransferAmmount(0);
      } else {
        transferTokens(provider, exchange, 'deposit', token, token2TransferAmmount, dispatch);
        setToken2TransferAmmount(0);
      }
    }

    const withdrawHandler = (e, token) => {
      e.preventDefault();

      if (token.address === tokens[0].address) {
        transferTokens(provider, exchange, 'withdraw', token, token1TransferAmmount, dispatch);
        setToken1TransferAmmount(0);
      } else {
        transferTokens(provider, exchange, 'withdraw', token, token2TransferAmmount, dispatch);
        setToken2TransferAmmount(0);
      }
    }

    const tabHandler = (e) => {
      if(e.target.className !== depositRef.current.className) {
        e.target.className = 'tab tab--active';
        depositRef.current.className = 'tab';
        setIsDeposit(false)
      } else {
        e.target.className = 'tab tab--active';
        withdrawRef.current.className = 'tab';
        setIsDeposit(true)
      }
    }

    return (
      <div className='component exchange__transfers'>
        <div className='component__header flex-between'>
          <h2>Balance</h2>
          <div className='tabs'>
            <button ref={depositRef} onClick={(e) => tabHandler(e)} className='tab tab--active'>Deposit</button>
            <button ref={withdrawRef} onClick={(e) => tabHandler(e)} className='tab'>Withdraw</button>
          </div>
        </div>
  
        {/* Deposit/Withdraw Component 1 */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><img src={logo1Image} width='20' alt="DEXT logo"></img>{symbols && symbols[0]}</p>
            <p><small>Wallet</small>{tokenBalances && tokenBalances[0]}</p>
            <p><small>Exchange</small>{exchangeBalances && exchangeBalances[0]}</p>
          </div>
  
          <form onSubmit={isDeposit ? (e) => submitHandler(e, tokens[0]) : (e) => withdrawHandler(e, tokens[0])}>
            <label htmlFor="token0"></label>
            <input type="text" 
                   id='token0'
                   value={token1TransferAmmount === 0 ? "" : token1TransferAmmount}
                   placeholder='0.0000'
                   onChange={(e) => ammountHandler(e, tokens[0])}/>
  
            <button className='button' type='submit'>
              { isDeposit ? (<span>Deposit</span>) : (<span>Withdraw</span>) }
            </button>
          </form>
        </div>
  
        <hr />
  
        {/* Deposit/Withdraw Component 2 */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><img src={logo2Image} width='20' alt="Pirate logo"></img>{symbols && symbols[1]}</p>
            <p><small>Wallet</small>{tokenBalances && tokenBalances[1]}</p>
            <p><small>Exchange</small>{exchangeBalances && exchangeBalances[1]}</p>
          </div>
  
          <form onSubmit={isDeposit ? (e) => submitHandler(e, tokens[1]) : (e) => withdrawHandler(e, tokens[1])}>
            <label htmlFor="token1"></label>
            <input type="text" 
                   id='token1' 
                   value={token2TransferAmmount === 0 ? "" : token2TransferAmmount}
                   placeholder='0.0000'
                   onChange={(e) => ammountHandler(e, tokens[1])}/>
  
            <button className='button' type='submit'>
            { isDeposit ? (<span>Deposit</span>) : (<span>Withdraw</span>) }
            </button>
          </form>
        </div>
  
        <hr />
      </div>
    );
  }
  
  export default Balance;
