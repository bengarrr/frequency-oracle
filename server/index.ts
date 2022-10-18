import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE || 'development'}` });

import Fastify from "fastify";
import sql from "./sql.service";

const tradepairs = ['SCRT/USD', 'BTC/USD', 'ETH/USD', 'OSMO/ATOM'];
const exchanges = require('../exchanges.json');

const fastify = Fastify({
    logger: true
});

fastify.get('/', async (request, reply) => {
    const { date, exchange, symbol, interval } = request.query as any;

    const json = await query(date, exchange, symbol, interval);

    const averaged_market_price = json.reduce((prevPriceSum, curr) => {
        const sum_closing_price = curr.json[4] + prevPriceSum;
        return sum_closing_price;
    }, 0) / interval;

    const last_timestamp = json[interval-1][0];
    const payload = { json, averaged_market_price, next: last_timestamp };
    reply.send(payload);
    return;

    reply.send(payload);
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`Server is now listening on ${address}`);
})

async function query(date, exchange = "kraken", interval = 30, symbol = "SCRT/USD") {
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