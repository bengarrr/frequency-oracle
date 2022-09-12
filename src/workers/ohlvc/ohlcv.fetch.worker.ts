import { Job, Queue } from "bullmq";
import { Exchange } from "ccxt";
import { FetchDataJob } from "../../interfaces/fetch-data-job";
import { OHLCVDataJob } from "../../interfaces/ohlcv-data-job";

export default function(exchangeInstance: Exchange, queue: Queue<OHLCVDataJob>) {
    return async (job: Job<FetchDataJob>) => {
        const { symbol, timeframe, since, limit, params } = job.data.options;
        if(symbol) {
            const res = await exchangeInstance.fetchOHLCV(symbol, timeframe, since, limit, params);
            await Promise.all(res.map(async ohlcv => {
                console.log('inserting Order Books for ' + exchangeInstance.name);
                await queue.add('insertOrderBook', { ohlcv, symbol });
                console.log('done inserting Order Books for ' + exchangeInstance.name);
            }))
        }
    }
}