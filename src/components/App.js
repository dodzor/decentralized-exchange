import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { loadNetwork, loadProvider, loadAccount, loadTokens, loadExchange, subscribeToEvents } from '../store/interactions';
import config from '../config';
import Navbar from './Navbar';
import Markets from './Markets';
import Balance from './Balance';

function App() {

  const dispatch = useDispatch();

  const loadBlockchainData = async () => {

    const provider = loadProvider(dispatch);
    const chainId = await loadNetwork(dispatch, provider);

    window.ethereum.on('chainChanged', () => {
      window.location.reload(); 
    });

    // Load account when account changes
    window.ethereum.on('accountsChanged', () => {
      loadAccount(dispatch, provider);
    });
    
    const dext = config[chainId].DEXT;
    // const meth = config[chainId].mETH;
    const pir = config[chainId].PIR;

    if (config[chainId]) await loadTokens(provider, [dext.address, pir.address], dispatch);

    const exchangeCfg = config[chainId].exchange;
    if (exchangeCfg) {
      const exchange = await loadExchange(provider, exchangeCfg.address, dispatch);
      subscribeToEvents(exchange, dispatch);
    }
  }

  useEffect(() => {
    loadBlockchainData();
  });

  return (
    <div>

      <Navbar/>

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets/>

          <Balance/>

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;