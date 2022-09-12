import { Trade } from "ccxt";
import { InsertDataJob } from "./insert-data-job";

export interface TradeDataJob extends Trade, InsertDataJob {}