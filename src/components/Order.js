import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { makeBuyOrder, makeSellOrder } from '../store/interactions';

const Order = () => {
    const [amount, setAmount] = useState(0);
    const [price, setPrice] = useState(0);
    const [isBuy, setIsBuy] = useState(true);

    const buyRef = useRef(null);
    const sellRef = useRef(null);

    const provider = useSelector(state => state.provider.connection);
    const exchange = useSelector(state => state.exchange.contract);
    const tokens = useSelector(state => state.tokens.contracts);

    const dispatch = useDispatch();

    const tabHandler = (e) => {
        if(e.target.className !== buyRef.current.className) {
          e.target.className = 'tab tab--active';
          buyRef.current.className = 'tab';
          setIsBuy(false);
        } else {
          e.target.className = 'tab tab--active';
          sellRef.current.className = 'tab';
          setIsBuy(true);
        }
    }

    const buyHandler = (e) => {
        e.preventDefault();
        console.log('price:' + price);
        console.log('amount:' + amount);
        makeBuyOrder(provider, exchange, tokens, { amount, price }, dispatch)
        setAmount(0);
        setPrice(0);
    }

    const sellHandler = (e) => {
        e.preventDefault();
        makeSellOrder(provider, exchange, tokens, { amount, price }, dispatch)
        setAmount(0);
        setPrice(0);
    }

    return (
      <div className="component exchange__orders">
        <div className='component__header flex-between'>
          <h2>New Order</h2>
          <div className='tabs'>
            <button ref={buyRef} onClick={(e) => tabHandler(e)} className='tab tab--active'>Buy</button>
            <button ref={sellRef} onClick={(e) => tabHandler(e)} className='tab'>Sell</button>
          </div>
        </div>
  
        <form onSubmit={isBuy ? buyHandler : sellHandler}>
           {isBuy ? (
              <label htmlFor="price">Buy price</label>
            ): (
              <label htmlFor="price">Sell price</label>
            )}
            <input 
              type="text" 
              id='price' 
              placeholder='0.0000'
              value={price === 0 ? '': price} 
              onChange={(e) => setPrice(e.target.value)}/>

            {isBuy ? (
              <label htmlFor="amount">Buy amount</label>
            ): (
              <label htmlFor="amount">Sell amount</label>
            )}
            <input 
              type="text" 
              id='amount' 
              placeholder='0.0000'
              value={amount === 0 ? '' : amount} 
              onChange={(e) => setAmount(e.target.value)}/>
          
          <button className='button button--filled' type='submit'>
            {isBuy ? (
              <span>Buy Order</span>
            ) : (
              <span>Sell Order</span>
            )}
            </button>
        </form>
      </div>
    );
  }
  
  export default Order;