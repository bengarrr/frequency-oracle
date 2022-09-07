import { Job } from "bullmq";
import { DbService } from "../../db/db.service";
import { Exchange } from "ccxt";
import { TradeDataJob } from "../../interfaces/trade-data-job";

export default function(exchange: Exchange) {
    const db = new DbService(exchange.name);
    return async function(job: Job<TradeDataJob>) {
        await db.insertTrade(job.data)
    }
}