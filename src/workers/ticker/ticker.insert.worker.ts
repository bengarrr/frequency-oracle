import { Job, Queue } from "bullmq";
import { DbService } from "../../db/db.service";
import { Exchange, Ticker } from "ccxt";
import { TickerDataJob } from "../../interfaces/ticker-data-job";

export default function(exchange: Exchange, queue?: Queue<TickerDataJob>) {
    const db = new DbService(exchange.name);
    return async function(job: Job<TickerDataJob>) {
        await db.insertTicker(job.data)
    }
}