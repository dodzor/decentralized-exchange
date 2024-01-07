import { useSelector } from "react-redux";
import { useRef, useEffect } from "react";

import config from "../config.json";
import { myEventsSelector } from "../store/selectors";

const Alert = () => {
    const alertRef = useRef(null);
    const isPending = useSelector(state => state.exchange.transaction && state.exchange.transaction.isPending);
    const isError = useSelector(state => state.exchange.transaction && state.exchange.transaction.isError);
    const account = useSelector(state => state.provider.account);
    const chainId = useSelector(state => state.provider.chainId);
    const myEvents = useSelector(myEventsSelector);

    useEffect(() => {
        if ((isPending || isError || myEvents[0]) && account) {
            if (alertRef) {
              alertRef.current.className = "alert";
            }
        }
    }, [myEvents, isPending, isError, account]);

    const removeHandler = (e) => {
        alertRef.current.className = "alert alert--remove";
    }

    return (
      <div>
        {isPending ? (
            <div className="alert alert--remove" ref={alertRef} onClick={removeHandler}>
                <h1>Transaction Pending...</h1>
            </div>
        ) : isError ? (
          <div className="alert alert--remove">
            <h1>Transaction Will Fail</h1>
          </div>
        ) : (!isPending && myEvents[0]) ? (
          <div className="alert" ref={alertRef} onClick={removeHandler}>
            <h1>Transaction Successful</h1>
            <a
                href={config[chainId] ? `${config[chainId].explorerUrl}/tx/${myEvents[0].transactionHash}` : '#'}
                target='_blank'
                rel='noreferrer'
            >
              {myEvents[0].transactionHash.slice(0, 6) + '...' + myEvents[0].transactionHash.slice(60, 66)}
            </a>
          </div>
        ) : (
          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}></div>
        )} 
    
      </div>
    );
  }
  
  export default Alert;