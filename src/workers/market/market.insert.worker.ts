import { Job, Queue } from "bullmq";
import { DbService } from "../../db/db.service";
import { Exchange } from "ccxt";
import { MarketDataJob } from "../../interfaces/market-data-job";

export default function(exchange: Exchange, queue?: Queue<MarketDataJob>) {
    const db = new DbService(exchange.name);
    return async function(job: Job<MarketDataJob>) {
        await db.insertMarket(job.data)
    }
}