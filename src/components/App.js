import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { loadNetwork, loadProvider, loadAccount, loadTokens, loadExchange } from '../store/interactions';
import config from '../config';
import Navbar from './Navbar';

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
    const meth = config[chainId].mETH;
    const exchange = config[chainId].exchange;

    await loadTokens(provider, [dext.address, meth.address], dispatch);

    await loadExchange(provider, exchange.address, dispatch);
  }

  useEffect(() => {
    loadBlockchainData();
  });

  return (
    <div>

      <Navbar/>

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

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