import { Job, Queue } from "bullmq";
import { Exchange } from "ccxt";
import { FetchDataJob } from "../../interfaces/fetch-data-job";
import { TradeDataJob } from "../../interfaces/trade-data-job";

export default function(exchange: Exchange, queue: Queue<TradeDataJob>) {
    return async (job: Job<FetchDataJob>) => {
        const { symbol, since, limit, params } = job.data.options;
        if(symbol) {
            const res = await exchange.fetchTrades(symbol, since, limit, params);
            await Promise.all(res.map(async (trade) => {
                console.log('inserting Trade for ' + exchange.name);
                await queue.add('insertTrade', { ...trade, symbol });
                console.log('done inserting Trade for ' + exchange.name);
            }))
        }
    }
}