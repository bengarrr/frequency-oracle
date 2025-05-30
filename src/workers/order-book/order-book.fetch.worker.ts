import { Job, Queue } from "bullmq";
import { Exchange } from "ccxt";
import { FetchDataJob } from "../../interfaces/fetch-data-job";
import { OrderBookDataJob } from "../../interfaces/order-book-data-job";

export default function(exchangeInstance: Exchange, queue: Queue<OrderBookDataJob>) {
    return async (job: Job<FetchDataJob>) => {
        const { symbol, limit, params } = job.data.options;
        if(symbol) {
            const res = await exchangeInstance.fetchOrderBook(symbol, limit, params);
            console.log('inserting Order Books for ' + exchangeInstance.name);
            await queue.add('insertOrderBook', { ...res, symbol });
            console.log('done inserting Order Books for ' + exchangeInstance.name);
        }
    }
}