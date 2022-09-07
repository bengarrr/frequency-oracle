import { Job, Queue } from "bullmq";
import { OrderBookDataJob } from "../../interfaces/order-book-data-job";
import { DbService } from "../../db/db.service";
import { Exchange } from "ccxt";

export default function(exchange: Exchange, queue?: Queue<OrderBookDataJob>) {
    const db = new DbService(exchange.name);
    return async function(job: Job<OrderBookDataJob>) {
        await db.insertOrderBook(job.data)
    }
}
