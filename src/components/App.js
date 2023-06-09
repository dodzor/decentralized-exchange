import { useEffect } from 'react';
import { ethers } from 'ethers';

import config from '../config';
import TOKEN_ABI from '../abi/Token.json';

import '../App.css';

function App() {

  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log(accounts[0]);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    console.log(chainId);

    const dext = new ethers.Contract(config[chainId].DEXT.address, TOKEN_ABI, provider);
    console.log(dext.address);

    const symbol = await dext.symbol();
    console.log(symbol);
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