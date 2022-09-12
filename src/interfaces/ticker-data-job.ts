import { Ticker } from "ccxt";
import { InsertDataJob } from "./insert-data-job";

export interface TickerDataJob extends Ticker, InsertDataJob {};