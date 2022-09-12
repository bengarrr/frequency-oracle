import { OrderBook } from "ccxt";
import { InsertDataJob } from "./insert-data-job";

export interface OrderBookDataJob extends OrderBook, InsertDataJob {
}