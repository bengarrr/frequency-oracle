import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE || 'development'}` })

import { createWorker } from "./workers/worker.factory";
import { CCXT } from "./ccxt/ccxt";
import { Queue, QueueScheduler, Worker } from "bullmq";
import { FetchDataJob } from "./interfaces/fetch-data-job";
import { Exchange } from "ccxt";
import { ExchangeDefiniton } from "./interfaces/exchange-definition";
import { ExchangeInstance } from "./interfaces/exchange-instance";
import { OrderBookDataJob } from "./interfaces/order-book-data-job";
import { TickerDataJob } from "./interfaces/ticker-data-job";
import { TradeDataJob } from "./interfaces/trade-data-job";
import { OHLCVDataJob } from "./interfaces/ohlcv-data-job";
import { MarketDataJob } from "./interfaces/market-data-job";

import {exchanges as exchangeDefinitions} from "../exchanges.json";
import orderBookFetchProcessorFactory from "./workers/order-book/order-book.fetch.worker";
import orderBookInsertProcessorFactory from "./workers/order-book/order-book.insert.worker";
import tickerFetchProcessorFactory from "./workers/ticker/ticker.fetch.worker";
import tickerInsertProcessorFactory from "./workers/ticker/ticker.insert.worker";
import tradeFetchProcessorFactory from "./workers/trade/trade.fetch.worker";
import tradeInsertProcessorFactory from "./workers/trade/trade.insert.worker";
import marketFetchProcessorFactory from "./workers/market/market.fetch.worker";
import marketInsertProcessorFactory from "./workers/market/market.insert.worker";
import ohlvcFetchProcessorFactory from "./workers/ohlvc/ohlcv.fetch.worker";
import ohlcvInsertProcessorFactory from "./workers/ohlvc/ohlcv.insert.worker";

export type AppWorker = {
    worker: Worker,
    scheduler: QueueScheduler
}

export type FetchQueues = {
    [key: string]: Queue<FetchDataJob>
}

const connection = {
    host: process.env.REDIS_HOST as string,
    port: parseInt(process.env.REDIS_PORT as string)
}

const fetchProcessorFactories = [
    orderBookFetchProcessorFactory,
    tickerFetchProcessorFactory,
    tradeFetchProcessorFactory,
    marketFetchProcessorFactory,
    ohlvcFetchProcessorFactory
];

const insertProcessorFactories = [
    orderBookInsertProcessorFactory,
    tickerInsertProcessorFactory,
    tradeInsertProcessorFactory,
    marketInsertProcessorFactory,
    ohlcvInsertProcessorFactory
];

const orderBookQueue = new Queue<FetchDataJob>('orderBookFetch', { connection })

function run() {
    const exchangeInstances = createExchanges(exchangeDefinitions);
    const exchangeFetchWorkers = createFetchWorkers(exchangeInstances, fetchProcessorFactories);
    const exchangeInsertWorkers = createInsertWorkers(exchangeInstances);
    const exchangeOrderBookQueues = createFetchQueues(exchangeInstances, 'orderBook');
    const exchangeTickerQueues = createFetchQueues(exchangeInstances, 'ticker')
    const exchangeTradeQueues = createFetchQueues(exchangeInstances, 'trade')
    const exchangeOHLCVQueues = createFetchQueues(exchangeInstances, 'ohlcv')
    const exchangeMarketQueues = createFetchQueues(exchangeInstances, '')

    process.on("SIGTERM", async () => {
        console.info("SIGTERM signal received: closing queues");
        exchangeFetchWorkers.map((worker) => {
            worker.worker.close();
            worker.scheduler.close();
        })
        exchangeInsertWorkers.map((worker) => {
            worker.worker.close();
            worker.scheduler.close();
        })
    });

    scheduleOrderBookPullAll(exchangeInstances, exchangeOrderBookQueues);
    scheduleTickerFetchPullAll(exchangeInstances, exchangeTickerQueues);
    sceheduleTradeFetchPullAll(exchangeInstances, exchangeTradeQueues);
    scheduleOHLCVFetchPullAll(exchangeInstances, exchangeOHLCVQueues);
    scheduleMarketFetchPullAll(exchangeInstances, exchangeMarketQueues);
}
run();

async function scheduleOrderBookPullAll(exchanges: Array<ExchangeInstance>, queues: FetchQueues): Promise<void> {
    for(const exchange of exchanges) {
        for(const symbol of exchange.symbols) {
            await queues[exchange.instance.name].add('fetchOrderBooks', { options: { symbol } })
            await queues[exchange.instance.name].close();
        }
    }
}

async function scheduleTickerFetchPullAll(exchanges: Array<ExchangeInstance>, queues: FetchQueues): Promise<void> {
    for(const exchange of exchanges) {
        for(const symbol of exchange.symbols) {
            await queues[exchange.instance.name].add('fetchTicker', { options: { symbol }});
            await queues[exchange.instance.name].close();
        }
    }
}

async function sceheduleTradeFetchPullAll(exchanges: Array<ExchangeInstance>, queues: FetchQueues): Promise<void> {
    for(const exchange of exchanges) {
        for(const symbol of exchange.symbols) {
            await queues[exchange.instance.name].add('fetchTrade', { options: { symbol }})
        }
    }
}

async function scheduleOHLCVFetchPullAll(exchanges: Array<ExchangeInstance>, queues: FetchQueues): Promise<void> {
    for(const exchange of exchanges) {
        for(const symbol of exchange.symbols) {
            await queues[exchange.instance.name].add('fetchOHLCV', { options: { symbol }})
        }
    }
}

async function scheduleMarketFetchPullAll(exchanges: Array<ExchangeInstance>, queues: FetchQueues): Promise<void> {
    for(const exchange of exchanges) {
        for(const symbol of exchange.symbols) {
            await queues[exchange.instance.name].add('fetchMarkets', { options: { symbol }})
        }
    }
}

function createFetchQueues(exchanges: Array<ExchangeInstance>, resource: string): FetchQueues {
    let queues: any = {}
    exchanges.map(exchange => {
        const queueName = getFetchQueueName(exchange.instance, resource);
        const queue = new Queue<FetchDataJob>(queueName, { connection });
        queues[exchange.instance.name] = queue
    })
    return queues
}

function createExchange(exchange: string): Exchange {
    return new CCXT[exchange]();
}

function createExchanges(exchanges: Array<ExchangeDefiniton>): Array<ExchangeInstance> {
    return exchanges.map(exchange => {
        return {
            instance: createExchange(exchange.exchange),
            symbols: exchange.symbols
        }
    })
}

function createFetchWorkers(exchanges: Array<ExchangeInstance>, factories: Array<Function>): Array<AppWorker> {
    let workers: any[] = [];

    exchanges.map(exchange => {
        workers.push(createFetchWorker<OrderBookDataJob>(exchange.instance, orderBookFetchProcessorFactory, 'orderBook'))
        workers.push(createFetchWorker<TickerDataJob>(exchange.instance, tickerFetchProcessorFactory, 'ticker'))
        workers.push(createFetchWorker<TradeDataJob>(exchange.instance, tradeFetchProcessorFactory, 'trade'))
        workers.push(createFetchWorker<OHLCVDataJob>(exchange.instance, ohlvcFetchProcessorFactory, 'ohlcv'))
        workers.push(createFetchWorker<MarketDataJob>(exchange.instance, marketFetchProcessorFactory, 'market'))
    });

    return workers;
}

function createInsertWorkers(exchanges: Array<ExchangeInstance>): Array<AppWorker> {
    let workers: any[] = [];

    exchanges.map(exchange => {
        workers.push(createInsertWorker(exchange.instance, orderBookInsertProcessorFactory, 'orderBook'))
        workers.push(createInsertWorker(exchange.instance, tickerInsertProcessorFactory, 'ticker'))
        workers.push(createInsertWorker(exchange.instance, tradeInsertProcessorFactory, 'trade'))
        workers.push(createInsertWorker(exchange.instance, ohlcvInsertProcessorFactory, 'ohlcv'))
        workers.push(createInsertWorker(exchange.instance, marketInsertProcessorFactory, 'market'))
    })

    return workers;
}

function createFetchWorker<T>(exchange: Exchange, factory: any, resource: string) {
    const insertQueue = new Queue<T>(exchange.name+'_'+resource+'Insert', { connection })
    const processor = factory(exchange, insertQueue);
    const { worker, scheduler } = createWorker(getFetchQueueName(exchange, resource), processor, connection);
    return { worker, scheduler };
}

function createInsertWorker(exchange: Exchange, factory: any, resource: string) {
    const processor = factory(exchange);
    const { worker, scheduler } = createWorker(getInsertQueueName(exchange, resource), processor, connection );
    return { worker, scheduler };
}

function getFetchQueueName(exchange: Exchange, resource: string) {
    return exchange.name+'_'+resource+'Fetch';
}
function getInsertQueueName(exchange: Exchange, resource: string) {
    return exchange.name+'_'+resource+'Insert';
}