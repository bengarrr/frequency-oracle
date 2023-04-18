"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var dotenv_1 = require("dotenv");
dotenv_1["default"].config({ path: ".env.".concat(process.env.NODE || 'development') });
var yargs_1 = require("yargs");
var worker_factory_1 = require("./workers/worker.factory");
var ccxt_1 = require("./ccxt/ccxt");
var bullmq_1 = require("bullmq");
var exchanges_json_1 = require("../exchanges.json");
var order_book_fetch_worker_1 = require("./workers/order-book/order-book.fetch.worker");
var order_book_insert_worker_1 = require("./workers/order-book/order-book.insert.worker");
var ticker_fetch_worker_1 = require("./workers/ticker/ticker.fetch.worker");
var ticker_insert_worker_1 = require("./workers/ticker/ticker.insert.worker");
var trade_fetch_worker_1 = require("./workers/trade/trade.fetch.worker");
var trade_insert_worker_1 = require("./workers/trade/trade.insert.worker");
var market_fetch_worker_1 = require("./workers/market/market.fetch.worker");
var market_insert_worker_1 = require("./workers/market/market.insert.worker");
var ohlcv_fetch_worker_1 = require("./workers/ohlvc/ohlcv.fetch.worker");
var ohlcv_insert_worker_1 = require("./workers/ohlvc/ohlcv.insert.worker");
var db_service_1 = require("./db/db.service");
var connection = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASS
};
var fetchProcessorFactories = [
    order_book_fetch_worker_1["default"],
    ticker_fetch_worker_1["default"],
    trade_fetch_worker_1["default"],
    market_fetch_worker_1["default"],
    ohlcv_fetch_worker_1["default"]
];
var insertProcessorFactories = [
    order_book_insert_worker_1["default"],
    ticker_insert_worker_1["default"],
    trade_insert_worker_1["default"],
    market_insert_worker_1["default"],
    ohlcv_insert_worker_1["default"]
];
var argv = yargs_1["default"]
    .option('insert', {
    description: 'option to configure sevrice as databse insert worker',
    type: 'boolean'
})
    .option('fetch', {
    description: 'option to configure service as fetch worker',
    type: 'boolean'
})
    .option('symbol', {
    description: 'option for fetch workers, which symbol to fetch from exchanges ex',
    type: 'string'
})
    .option('backfill', {
    description: 'option for fetch workers date to backfill to, date should be in the form YYYY-MM-DD',
    type: 'string'
})
    .option('coins', {
    description: 'option to scrape coin information',
    type: 'boolean'
})
    .help()
    .alias('help', 'h')
    .parseSync();
function run() {
    if (argv.fetch) {
        var exchangeInstances = createExchanges(exchanges_json_1.exchanges);
        runFetchWorkers(exchangeInstances);
    }
    else if (argv.insert) {
        var exchangeInstances = createExchanges(exchanges_json_1.exchanges);
        runInsertWorkers(exchangeInstances);
    }
    else if (argv.coins) {
        runScrape();
    }
}
run();
function runFetchWorkers(exchangeInstances) {
    var _this = this;
    var symbol = argv.symbol;
    if (!symbol) {
        throw new Error('Arguments error: no --symbol flag is set');
    }
    var exchangeFetchWorkers = createFetchWorkers(exchangeInstances, fetchProcessorFactories);
    var exchangeOrderBookQueues = createFetchQueues(exchangeInstances, 'orderBook');
    var exchangeTickerQueues = createFetchQueues(exchangeInstances, 'ticker');
    var exchangeTradeQueues = createFetchQueues(exchangeInstances, 'trade');
    var exchangeOHLCVQueues = createFetchQueues(exchangeInstances, 'ohlcv');
    var exchangeMarketQueues = createFetchQueues(exchangeInstances, 'market');
    process.on("SIGINT", function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.info("SIGINT signal received: closing queues");
            exchangeFetchWorkers.map(function (worker) {
                var _a;
                worker.worker.close();
                worker.scheduler.close();
                (_a = worker.insertQueue) === null || _a === void 0 ? void 0 : _a.close();
            });
            return [2 /*return*/];
        });
    }); });
    //scheduleOrderBookPullAll(exchangeInstances, exchangeOrderBookQueues, symbol);
    scheduleTickerFetchPullAll(exchangeInstances, exchangeTickerQueues, symbol);
    //sceheduleTradeFetchPullAll(exchangeInstances, exchangeTradeQueues, symbol);
    scheduleOHLCVFetchPullAll(exchangeInstances, exchangeOHLCVQueues, symbol);
    scheduleMarketFetchPullAll(exchangeInstances, exchangeMarketQueues, symbol);
}
function runInsertWorkers(exchangeInstances) {
    var _this = this;
    var exchangeInsertWorkers = createInsertWorkers(exchangeInstances);
    process.on("SIGINT", function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.info("SIGINT signal received: closing queues");
            exchangeInsertWorkers.map(function (worker) {
                worker.worker.close();
                worker.scheduler.close();
            });
            return [2 /*return*/];
        });
    }); });
}
function scheduleOrderBookPullAll(exchanges, queues, symbol) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, exchanges_1, exchange;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, exchanges_1 = exchanges;
                    _a.label = 1;
                case 1:
                    if (!(_i < exchanges_1.length)) return [3 /*break*/, 4];
                    exchange = exchanges_1[_i];
                    return [4 /*yield*/, queues[exchange.instance.name].add('fetchOrderBooks', { options: { symbol: symbol } }, {
                            repeat: {
                                every: 2000
                            }
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function scheduleTickerFetchPullAll(exchanges, queues, symbol) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, exchanges_2, exchange;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, exchanges_2 = exchanges;
                    _a.label = 1;
                case 1:
                    if (!(_i < exchanges_2.length)) return [3 /*break*/, 4];
                    exchange = exchanges_2[_i];
                    return [4 /*yield*/, queues[exchange.instance.name].add('fetchTicker', { options: { symbol: symbol } }, {
                            repeat: {
                                every: 60000
                            }
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function sceheduleTradeFetchPullAll(exchanges, queues, symbol) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, exchanges_3, exchange;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, exchanges_3 = exchanges;
                    _a.label = 1;
                case 1:
                    if (!(_i < exchanges_3.length)) return [3 /*break*/, 4];
                    exchange = exchanges_3[_i];
                    return [4 /*yield*/, queues[exchange.instance.name].add('fetchTrade', { options: { symbol: symbol } }, {
                            repeat: {
                                every: 2000
                            }
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function scheduleOHLCVFetchPullAll(exchanges, queues, symbol, backfillDate) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, exchanges_4, exchange;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, exchanges_4 = exchanges;
                    _a.label = 1;
                case 1:
                    if (!(_i < exchanges_4.length)) return [3 /*break*/, 4];
                    exchange = exchanges_4[_i];
                    return [4 /*yield*/, queues[exchange.instance.name].add('fetchOHLCV', { options: { symbol: symbol } }, {
                            repeat: {
                                every: 60000
                            }
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function scheduleMarketFetchPullAll(exchanges, queues, symbol) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, exchanges_5, exchange;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, exchanges_5 = exchanges;
                    _a.label = 1;
                case 1:
                    if (!(_i < exchanges_5.length)) return [3 /*break*/, 4];
                    exchange = exchanges_5[_i];
                    return [4 /*yield*/, queues[exchange.instance.name].add('fetchMarkets', { options: { symbol: symbol } }, {
                            repeat: {
                                every: 60000
                            }
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function createFetchQueues(exchanges, resource) {
    var queues = {};
    exchanges.map(function (exchange) {
        var queueName = getFetchQueueName(exchange.instance, resource);
        var queue = new bullmq_1.Queue(queueName, { connection: connection, defaultJobOptions: {
                removeOnComplete: true, removeOnFail: 1000
            } });
        queues[exchange.instance.name] = queue;
    });
    return queues;
}
function createExchange(exchange) {
    return new ccxt_1.CCXT[exchange]();
}
function createExchanges(exchanges) {
    return exchanges.map(function (exchange) {
        return {
            instance: createExchange(exchange.exchange),
            symbols: exchange.symbols
        };
    });
}
function createFetchWorkers(exchanges, factories) {
    var workers = [];
    exchanges.map(function (exchange) {
        workers.push(createFetchWorker(exchange.instance, order_book_fetch_worker_1["default"], 'orderBook'));
        workers.push(createFetchWorker(exchange.instance, ticker_fetch_worker_1["default"], 'ticker'));
        workers.push(createFetchWorker(exchange.instance, trade_fetch_worker_1["default"], 'trade'));
        workers.push(createFetchWorker(exchange.instance, ohlcv_fetch_worker_1["default"], 'ohlcv'));
        workers.push(createFetchWorker(exchange.instance, market_fetch_worker_1["default"], 'market'));
    });
    return workers;
}
function createInsertWorkers(exchanges) {
    var workers = [];
    exchanges.map(function (exchange) {
        workers.push(createInsertWorker(exchange.instance, order_book_insert_worker_1["default"], 'orderBook'));
        workers.push(createInsertWorker(exchange.instance, ticker_insert_worker_1["default"], 'ticker'));
        workers.push(createInsertWorker(exchange.instance, trade_insert_worker_1["default"], 'trade'));
        workers.push(createInsertWorker(exchange.instance, ohlcv_insert_worker_1["default"], 'ohlcv'));
        workers.push(createInsertWorker(exchange.instance, market_insert_worker_1["default"], 'market'));
    });
    return workers;
}
function createFetchWorker(exchange, factory, resource) {
    var insertQueue = new bullmq_1.Queue(getInsertQueueName(exchange, resource), { connection: connection });
    var processor = factory(exchange, insertQueue);
    var _a = (0, worker_factory_1.createWorker)(getFetchQueueName(exchange, resource), processor, connection), worker = _a.worker, scheduler = _a.scheduler;
    return { worker: worker, scheduler: scheduler, insertQueue: insertQueue };
}
function createInsertWorker(exchange, factory, resource) {
    var processor = factory(exchange);
    var _a = (0, worker_factory_1.createWorker)(getInsertQueueName(exchange, resource), processor, connection), worker = _a.worker, scheduler = _a.scheduler;
    return { worker: worker, scheduler: scheduler };
}
function getFetchQueueName(exchange, resource) {
    return exchange.name + '_' + resource + 'Fetch';
}
function getInsertQueueName(exchange, resource) {
    return exchange.name + '_' + resource + 'Insert';
}
function runScrape() {
    return __awaiter(this, void 0, void 0, function () {
        var db, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = new db_service_1.DbService();
                    return [4 /*yield*/, db.createTableCoinInfo()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fetchScrapingInfo()];
                case 2:
                    json = _a.sent();
                    if (!json) return [3 /*break*/, 4];
                    return [4 /*yield*/, db.insertCoinInfo(json)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function fetchScrapingInfo() {
    return __awaiter(this, void 0, void 0, function () {
        var res, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch('https://na36v10ce3.execute-api.us-east-1.amazonaws.com/API-mainnet-STAGE/token_prices', {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json'
                        }
                    })];
                case 1:
                    res = _a.sent();
                    if (!res.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.json()];
                case 2:
                    json = _a.sent();
                    return [2 /*return*/, json];
                case 3: return [2 /*return*/];
            }
        });
    });
}
