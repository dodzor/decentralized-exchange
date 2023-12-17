import { useSelector, useDispatch } from "react-redux";
import { useRef, useState } from 'react';
import { myOpenOrdersSelector, myTradesSelector } from "../store/selectors";

import sort from '../assets/sort.svg';
import Banner from '../components/Banner';
import { cancelOrder } from "../store/interactions";

const Transactions = () => {
    const myOpenOrders = useSelector(myOpenOrdersSelector);
    const myTrades = useSelector(myTradesSelector);
    const symbols = useSelector(state => state.tokens.symbols);
    const exchange = useSelector(state => state.exchange.contract);
    const provider = useSelector(state => state.provider.connection);

    let ordersRef = useRef(null);
    let tradesRef = useRef(null);

    let [showMyOrders, setShowMyOrders] = useState(true);

    const dispatch = useDispatch();

    const clickHandler = (e) => {
        if (e.target.className === ordersRef.current.className) {
            e.target.className = 'tab tab--active';
            tradesRef.current.className = 'tab';
            setShowMyOrders(true);
        } else {
            e.target.className = 'tab tab--active';
            ordersRef.current.className = 'tab';
            setShowMyOrders(false);
        }
    }

    const cancelHandler = (order) => {
        cancelOrder(provider, exchange, order, dispatch);
    }

    return (
      <div className="component exchange__transactions">
        {showMyOrders ? (
            <div>
            <div className='component__header flex-between'>
              <h2>My Orders</h2>
    
              <div className='tabs'>
                  <button onClick={clickHandler} ref={ordersRef} className='tab tab--active'>Orders</button>
                  <button onClick={clickHandler} ref={tradesRef} className='tab'>Trades</button>
              </div>
            </div>
    
            {!myOpenOrders || myOpenOrders.length === 0 ? (
              <Banner text="No orders"/>
            ) : (
                  <table>
                  <thead>
                      <tr>
                        <th>{symbols && symbols[0]}<img src={sort} alt="Sort"/></th>
                        <th>{symbols && symbols[0]} / {symbols && symbols[1]}<img src={sort} alt="Sort"/></th>
                        <th></th>
                      </tr>
                  </thead>
                  <tbody>
                      {myOpenOrders && myOpenOrders.map((order, index) => {
                          return(
                          <tr key={index}>
                              <td>{order.token0Amount}</td>
                              <td style={{color: `${order.orderTypeClass}`}}>{order.tokenPrice}</td>
                              <td><button className="button--sm" onClick={() => cancelHandler(order)}>Cancel</button></td>
                          </tr>);
                      })}
                  </tbody>
                  </table>
            )}  
    
          </div>
        ) : (        
        <div>
            <div className='component__header flex-between'>
                <h2>My Transactions</h2>

                <div className='tabs'>
                <button onClick={clickHandler} ref={ordersRef} className='tab tab--active'>Orders</button>
                <button onClick={clickHandler} ref={tradesRef} className='tab'>Trades</button>
                </div>
            </div>

            <table>
                <thead>
                <tr>
                    <th><img src={sort}/>Time</th>
                    <th>{symbols && symbols[0]}</th>
                    <th>{symbols && symbols[0]} / {symbols && symbols[1]}</th>
                </tr>
                </thead>
                <tbody>

                {myTrades && myTrades.map((trade, index) => {
                    return(
                        <tr key={index}>
                            <td>{trade.formattedTimestamp}</td>
                            <td style={{ color: `${trade.orderClass }`}}>{trade.orderSign}{trade.token0Amount}</td>
                            <td>{trade.tokenPrice}</td>
                        </tr>
                    );
                })}


                </tbody>
            </table>
        </div>)}
      </div>
    )
  }
  
  export default Transactions;