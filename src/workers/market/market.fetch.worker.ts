import { Job, Queue } from "bullmq";
import { Exchange } from "ccxt";
import { FetchDataJob } from "../../interfaces/fetch-data-job";
import { MarketDataJob } from "../../interfaces/market-data-job";

export default function(exchange: Exchange, queue: Queue<MarketDataJob>) {
    return async (job: Job<FetchDataJob>) => {
        const { params } = job.data.options;
        const res = await exchange.fetchMarkets();
        await Promise.all(res.map(async market => {
            console.log('inserting Market for ' + exchange.name);
            await queue.add('insertMarket', market);
            console.log('done inserting Market for ' + exchange.name);
        }))
    }
}