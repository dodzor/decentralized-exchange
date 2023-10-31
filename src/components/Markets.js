import { useSelector, useDispatch } from "react-redux";
import config from "../config.json";
import { loadTokens } from "../store/interactions";

const Markets = () => {
    const chainId = useSelector(state => state.provider.chainId);
    const provider = useSelector(state => state.provider.connection);

    const dispatch = useDispatch();

    const marketHandler = async (e) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const selectedOptionText = selectedOption.text;

      const addresses = e.target.value.split(',');
      const texts = selectedOptionText.split('/');
    
      loadTokens(provider, addresses, texts, dispatch);
    }

    return(
      <div className='component exchange__markets'>
        <div className='component__header'>
            <h2>Markets</h2>
        </div>
  
        {chainId ? (
        <select name="markets" id='markets' onChange={marketHandler}>
            <option value="0" disabled>Select Market</option>
            <option value={`${config[chainId].DEXT.address},${config[chainId].PIR.address}`}>DEXT/PIR</option>
            <option value={`${config[chainId].DEXT.address},${config[chainId].mETH.address}`}>DEXT/mETH</option>
            <option value={`${config[chainId].mETH.address},${config[chainId].PIR.address}`}>mETH/PIR</option>
        </select> ): (
            <div>
                <p>Not deployed yet to this network</p>
            </div>
        )}

        <hr />
      </div>
    )
  }
  
  export default Markets;