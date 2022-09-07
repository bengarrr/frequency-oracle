import { Exchange } from "ccxt";

export interface ExchangeInstance {
    instance: Exchange,
    symbols: Array<string>
}