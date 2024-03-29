import { useSelector } from "react-redux";
import Chart from 'react-apexcharts';

import arrowDown from '../assets/down-arrow.svg';
import arrowUp from '../assets/up-arrow.svg';

import Banner from "./Banner";
import { options, defaultSeries } from './PriceChart.conf';
import { priceChartSelector } from '../store/selectors';

import { get } from 'lodash';

const PriceChart = () => {

    const account = useSelector(state => state.provider.account);
    const symbols = useSelector(state => state.tokens.symbols);
    const priceChart = useSelector(priceChartSelector);
    const series = get(priceChart, 'series', defaultSeries);

    return (
      <div className="component exchange__chart">
        <div className='component__header flex-between'>
          <div className='flex'>
  
            <h2>{symbols.length ? `${symbols[0]} / ${symbols[1]}` : 'No data available'}</h2>

            {priceChart && (
                <div className='flex'>
                    {priceChart.lastPriceChange === '+' ? (
                        <img src={arrowUp} alt="Arrow down" />
                    ) : (
                        <img src={arrowDown} alt="Arrow down" />
                    )}
                    <span className='up'>{priceChart.lastPrice}</span>
                 </div>
            )}
  
          </div>
        </div>
  
        {!account ? (
            <Banner text={"Please connect to Metamask!"} />
        ): (
            <Chart
                type="candlestick"
                options={options}
                series={series}
                width="100%"
                height="100%"
            />
        )}
  
      </div>
    );
  }
  
  export default PriceChart;
