import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

import Fastify from "fastify";
import sql from "./sql.service";

import * as scraper from "./scrape";

const tradepairs = ['SCRT/USD', 'BTC/USD', 'ETH/USD', 'OSMO/ATOM'];
const exchanges = require('../exchanges.json');

const fastify = Fastify({
    logger: true
});

fastify.get('/candles', async (request, reply) => {
    const { date, exchange, symbol, interval } = request.query as any;

    const json = await query(date, exchange, symbol, interval);

    const averaged_market_price = json!.reduce((prevPriceSum, curr) => {
        const sum_closing_price = curr.json[4] + prevPriceSum;
        return sum_closing_price;
    }, 0) / interval;

    const last_timestamp = json![interval-1][0];
    const payload = { json, averaged_market_price, next: last_timestamp };
    reply.send(payload);
    return;
});

fastify.get('/', async (request, reply) => {
    let count = 0;
    const maxTries = 3;
    let timestamp = null;
    if(request.query) {
        timestamp = (request.query as any).timestamp;
    }
    while(true) {
        try {
            let price: any = '';
            if(timestamp) {
                price = await scraper.getPrice(timestamp);
            } else  {
                price = await scraper.getPrice();
            }
            return reply.send({ price: price?.replace('$', ''), timestamp: scraper.currTime });
        }
        catch( error ) {
            await scraper.wait(1000);
            if(++count > maxTries) throw error;
        }
    }
})

fastify.get('/coins/:coin', async (request, reply) => {
    let { timestamp, compare, ids } = request.query as any;
    let { coin } = request.params as any;

    if (typeof timestamp === 'undefined') {
        timestamp = Date.now();
    }

    if(typeof ids !== "undefined") {
        let idArr = JSON.parse(ids);
        let coin_info = await coinInfoByIds(idArr);
        return reply.send(coin_info);
    }

    if(typeof compare !== 'undefined') {
        let compare_info = await coinCompare(coin, compare);
        return reply.send(compare_info);
    }

    let coin_info = await coinQuery(coin, parseInt(timestamp));
    return reply.send({ prices: coin_info });
})

fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }

    scraper.start().then(_ => {
        fastify.log.info(`Scraper has been intialized`);
    });

    setInterval(async () => {
        await scraper.restart();
        fastify.log.info(`Scraper has been restarted`);
    }, 60000);
})

async function query(date: number, exchange: string = "kraken", interval: number = 30, symbol: string = "SCRT/USD") {
    const table = exchange+'_'+'ohlcv';

    if(date) {
        return await sql`
            SELECT 
                json
            FROM ${ sql(table) }
            WHERE
                to_timestamp(cast(json->'0' as bigint)/1000)::date < ${ date }
            AND
                symbol = ${ symbol }
            ORDER BY
                json->'0'
            DESC
            LIMIT ${ interval }
        `
    }
}

async function coinQuery(asset: String, date: number, interval: number = 60) {
    const table = "coin_info";

    let rows = await sql`
        SELECT
            json, timestamp
        FROM ${ sql(table) }
        WHERE
            timestamp < to_timestamp(${ date })
        ORDER BY
            timestamp
        DESC
        LIMIT ${ interval } 
    `

    let coin_info = rows!.map(row => {
        let price = row.json.filter((coin: any) => 
            coin.name === asset
        )[0].value;
        let timestamp = new Date(row.timestamp);
        return [timestamp.getTime(), parseFloat(price)];
    });

    return coin_info
}

async function coinCompare(asset1: String, asset2: String) {
    const table = "coin_info";

    const row = await sql`
        SELECT
            json, timestamp
        FROM ${ sql(table) }
        ORDER BY
            timestamp
        DESC
        LIMIT 1
    `

    const price1 = row[0].json.filter((coin: any) => coin.name === asset1)[0].value;
    const price2 = row[0].json.filter((coin: any) => coin.name === asset2)[0].value;

    let compare_info: any = {};
    compare_info[asset1.toString()] = {usd: parseFloat(price1)};
    compare_info[asset2.toString()] = {usd: parseFloat(price2)};
    return compare_info;
}

async function coinInfoByIds(ids: Array<String>) {
    const table = "coin_info";

    const row = await sql`
        SELECT
            json, timestamp
        FROM ${ sql(table) }
        ORDER BY
            timestamp
        DESC
        LIMIT 1
    `

    let coin_info = row!.map(row => {
        let coins = row.json.filter((coin: any) => {
            return ids.includes(coin.name)
        })

        let info = {} as any;
        for(const coin of coins) {
            info[coin.name] = {usd: parseFloat(coin.value)}
        }

        return info;
    });

    return coin_info[0]
}