import { Job, Queue } from "bullmq";
import { DbService } from "../../db/db.service";
import { Exchange } from "ccxt";
import { OHLCVDataJob } from "../../interfaces/ohlcv-data-job";

export default function(exchange: Exchange, queue?: Queue<OHLCVDataJob>) {
    const db = new DbService(exchange.name);
    return async function(job: Job<OHLCVDataJob>) {
        await db.insertOHLCV(job.data)
    }
}