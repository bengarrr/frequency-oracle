import { OHLCV } from "ccxt";
import { InsertDataJob } from "./insert-data-job";

export interface OHLCVDataJob {
    ohlcv: OHLCV,
    symbol: string
}