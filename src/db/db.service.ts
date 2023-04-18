import { Market, OHLCV, OrderBook, Ticker, Trade } from 'ccxt';
import sql from './sql.service';
const sparkmd5: any = require("spark-md5");

const tables = ['orderbooks', 'tickers', 'trades', 'markets', 'ohlcv'];

export class DbService {
    private readonly tableRoot: string = "";
    constructor(tableRoot: string= "") {
        this.tableRoot = tableRoot.toLowerCase();
        // this.createTables();
        // this.createTableCoinInfo();
    }

    async insert(table: string, json: any) {
        try {
            const tableName = this.tableRoot+'_'+table;
            const json_hash = sparkmd5.hash(JSON.stringify(json));
            const _json = await sql`
                INSERT INTO ${ sql(tableName) }
                    (json, json_hash, symbol)
                VALUES
                    (${ json }, ${ json_hash }, ${ json.symbol })
                ON CONFLICT (json_hash) 
                DO NOTHING
                RETURNING json
            `
            return _json
        }
        catch(error) {
            console.log(error)
        }
        return {}
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
        const _json = await this.insert('markets', {...json, symbol: 'none'});
        return _json;
    }

    async insertOHLCV(json: any) {
        const _json = await this.insert('ohlcv', json);
        return _json;
    }

    async createTables() {
        for(const table of tables) {
            const tableName = this.tableRoot+'_'+table;
            sql`
                CREATE TABLE IF NOT EXISTS ${ sql(tableName) } (
                    id BIGSERIAL,
                    json JSONB,
                    json_hash VARCHAR UNIQUE,
                    symbol VARCHAR,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    PRIMARY KEY(id)
                )
            `.catch(err => {
                console.log(err)
            }).then(res => {
                console.log(res)
            })
        }   
    }

    async createTableCoinInfo() {
        let tableName = "coin_info";

        sql`
            CREATE TABLE IF NOT EXISTS ${ sql(tableName) } (
                id BIGSERIAL,
                json JSONB,
                timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
                PRIMARY KEY(id)
            )
        `.catch(err => {
            console.log(err)
        }).then(res => {
            console.log(res)
        })
    }

    async insertCoinInfo(coinInfo: any) {
        let tableName = "coin_info";

        sql`
            INSERT INTO ${ sql(tableName) }
                (json)
            VALUES
                (${ coinInfo })
        `.catch(err => {
            console.log(err);
        }).then(res => {
            console.log(res);
        });
    }
}