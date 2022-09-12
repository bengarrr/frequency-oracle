import { Job, Queue } from "bullmq";
import { Exchange } from "ccxt";
import { FetchDataJob } from "../../interfaces/fetch-data-job";
import { TickerDataJob } from "../../interfaces/ticker-data-job";

export default function(exchangeInstance: Exchange, queue: Queue<TickerDataJob>) {
    return async (job: Job<FetchDataJob>) => {
        const { symbol, params } = job.data.options;
        if(symbol) {
            const res = await exchangeInstance.fetchTicker(symbol, params);
            console.log('inserting Ticker for ' + exchangeInstance.name);
            await queue.add('insertTicker', { ...res, symbol });
            console.log('done inserting Ticker for ' + exchangeInstance.name);
        }
    }
}