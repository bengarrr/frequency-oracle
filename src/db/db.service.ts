import { Market, OHLCV, OrderBook, Ticker, Trade } from 'ccxt';
import sql from './postgres';

export class DbService {
    private readonly tableRoot: string;
    constructor(tableRoot: string) {
        this.tableRoot = tableRoot;
    }

    async insert(table: string, json: any) {
        const _json = await sql`
            insert into ${this.tableRoot}_${table}
                (json)
            values
                (${json})
            returning json
        `
        return _json
    }

    async insertOrderBook(json: OrderBook) {
        const _json = await this.insert('orderbooks', json);
        return _json;
    }

    async insertTicker(json: Ticker) {
        const _json = await this.insert('tickers', json);
        return _json;
    }

    async insertTrade(json: Trade) {
        const _json = await this.insert('trades', json);
        return _json;
    }

    async insertMarket(json: Market) {
        const _json = await this.insert('market', json);
        return _json;
    }

    async insertOHLCV(json: OHLCV) {
        const _json = await this.insert('ohlcv', json);
        return _json;
    }
}