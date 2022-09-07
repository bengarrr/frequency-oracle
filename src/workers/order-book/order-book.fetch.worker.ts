import { Job, Queue } from "bullmq";
import { Exchange } from "ccxt";
import { FetchDataJob } from "../../interfaces/fetch-data-job";
import { OrderBookDataJob } from "../../interfaces/order-book-data-job";

export default function(exchangeInstance: Exchange, queue: Queue<OrderBookDataJob>) {
    return async (job: Job<FetchDataJob>) => {
        const { symbols, limit, params } = job.data.options;
        if(symbols) {
            const res = await exchangeInstance.fetchOrderBook(symbols[0], limit, params);
            console.log('inserting Order Books for ' + exchangeInstance.name);
            await queue.add('insertOrderBook', res);
            console.log('done inserting Order Books for ' + exchangeInstance.name);
        }
        await queue.close();
    }
}