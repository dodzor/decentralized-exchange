import { useSelector } from "react-redux";
import { useRef, useEffect } from "react";

import { myEventsSelector } from "../store/selectors";

const Alert = () => {
    const alertRef = useRef(null);
    const isPending = useSelector(state => state.exchange.transaction && state.exchange.transaction.isPending);
    const isSuccessful = useSelector(state => state.exchange.transaction && state.exchange.transaction.isSuccessful);
    const isError = useSelector(state => state.exchange.transaction && state.exchange.transaction.isError);
    const account = useSelector(state => state.provider.account);
    const myEvents = useSelector(myEventsSelector);

    useEffect(() => {
        if (isPending && account) {
            alertRef.current.className = "alert";
        }
    }, [isPending, account]);

    const removeHandler = (e) => {
        alertRef.current.className = "alert--remove";
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
                href=''
                target='_blank'
                rel='noreferrer'
            >
              {myEvents[0].transactionHash.slice(0, 6) + '...' + myEvents[0].transactionHash.slice(60, 66)}
            </a>
          </div>
        ) : (
          <div className="alert alert--remove"></div>
        )}  
      </div>
    );
  }
  
  export default Alert;