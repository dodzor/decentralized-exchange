import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { loadNetwork, loadProvider, loadAccount, loadTokens, loadExchange } from '../store/interactions';
import config from '../config';

function App() {

  const dispatch = useDispatch();

  const loadBlockchainData = async () => {

    const provider = loadProvider(dispatch);
    const chainId = await loadNetwork(dispatch, provider);

    await loadAccount(dispatch, provider);
    
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

      {/* Navbar */}

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