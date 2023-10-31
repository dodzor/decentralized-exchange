import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import Blockies from 'react-blockies';

import config from '../config.json';
import { loadAccount } from '../store/interactions';
import pirate from '../assets/pir.png';
import eth from '../assets/eth.svg';

const Navbar = () => {
    const account = useSelector(state => state.provider.account);
    const chainId = useSelector(state => state.provider.chainId);
    const balance = useSelector(state => state.provider.balance);
    const provider = useSelector(state => state.provider.connection);

    const dispatch = useDispatch();

    const connectHandler = async () => { 
        await loadAccount(dispatch, provider);
    }

    const networkHandler = async (e) => {
        window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: e.target.value }],
        });
    }
     
    return(
      <div className='exchange__header grid'>
        <div className='exchange__header--brand flex'>
            <img src={pirate} className="logo" alt='PirateBit' />
            <h1>PirateBit Token Exchange</h1>
            {/* <h1>PirateCoin Exchange</h1> */}
        </div>
  
        <div className='exchange__header--networks flex'>
            <img src={eth}></img>

            {chainId && (
            <select name="networks" id='networks' onChange={networkHandler} 
                    value={config[chainId] ? `0x${chainId.toString(16)}` : '0' } >
                <option value="0" disabled>Select Network</option>
                <option value="0x7A69">Localhost</option>
                <option value="0x5">Goerli</option>
            </select>
            )}
        </div>
  
        <div className='exchange__header--account flex'>
            {balance ? (
                <p><small>My Balance: {Number(balance).toFixed(4)} </small></p>
            ) : (
                <p><small>My Balance: 0.0000</small></p>
            )}
            {account ? (
                <a href={config[chainId] ? `${config[chainId].explorerUrl}/address/${account}`: `#`} target="_blank">
                    {account.slice(0,5) + '...' + account.slice(38,42)}
                <Blockies
                    seed={account.toLowerCase()}
                    className='identicon'
                    size={8}
                    scale={4}
                    color='#dfe'
                    bgColor='#1f1f1f'
                    spotColor='#abc'
                />    
                </a> 
            ) : ( 
                <button className='button' onClick={connectHandler}>Connect..</button>
            )}
        </div>
      </div>
    )
  }
  
  export default Navbar;