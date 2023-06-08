"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.DbService = void 0;
var sql_service_1 = require("./sql.service");
var sparkmd5 = require("spark-md5");
var tables = ['orderbooks', 'tickers', 'trades', 'markets', 'ohlcv'];
var DbService = /** @class */ (function () {
    function DbService(tableRoot) {
        if (tableRoot === void 0) { tableRoot = ""; }
        this.tableRoot = "";
        this.tableRoot = tableRoot.toLowerCase();
        // this.createTables();
        // this.createTableCoinInfo();
    }
    DbService.prototype.insert = function (table, json) {
        return __awaiter(this, void 0, void 0, function () {
            var tableName, json_hash, _json, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        tableName = this.tableRoot + '_' + table;
                        json_hash = sparkmd5.hash(JSON.stringify(json));
                        return [4 /*yield*/, (0, sql_service_1["default"])(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n                INSERT INTO ", "\n                    (json, json_hash, symbol)\n                VALUES\n                    (", ", ", ", ", ")\n                ON CONFLICT (json_hash) \n                DO NOTHING\n                RETURNING json\n            "], ["\n                INSERT INTO ", "\n                    (json, json_hash, symbol)\n                VALUES\n                    (", ", ", ", ", ")\n                ON CONFLICT (json_hash) \n                DO NOTHING\n                RETURNING json\n            "])), (0, sql_service_1["default"])(tableName), json, json_hash, json.symbol)];
                    case 1:
                        _json = _a.sent();
                        return [2 /*return*/, _json];
                    case 2:
                        error_1 = _a.sent();
                        console.log(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, {}];
                }
            });
        });
    };
    DbService.prototype.insertOrderBook = function (json) {
        return __awaiter(this, void 0, void 0, function () {
            var _json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.insert('orderbooks', json)];
                    case 1:
                        _json = _a.sent();
                        return [2 /*return*/, _json];
                }
            });
        });
    };
    DbService.prototype.insertTicker = function (json) {
        return __awaiter(this, void 0, void 0, function () {
            var _json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.insert('tickers', json)];
                    case 1:
                        _json = _a.sent();
                        return [2 /*return*/, _json];
                }
            });
        });
    };
    DbService.prototype.insertTrade = function (json) {
        return __awaiter(this, void 0, void 0, function () {
            var _json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.insert('trades', json)];
                    case 1:
                        _json = _a.sent();
                        return [2 /*return*/, _json];
                }
            });
        });
    };
    DbService.prototype.insertMarket = function (json) {
        return __awaiter(this, void 0, void 0, function () {
            var _json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.insert('markets', __assign(__assign({}, json), { symbol: 'none' }))];
                    case 1:
                        _json = _a.sent();
                        return [2 /*return*/, _json];
                }
            });
        });
    };
    DbService.prototype.insertOHLCV = function (json) {
        return __awaiter(this, void 0, void 0, function () {
            var _json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.insert('ohlcv', json)];
                    case 1:
                        _json = _a.sent();
                        return [2 /*return*/, _json];
                }
            });
        });
    };
    DbService.prototype.createTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, tables_1, table, tableName;
            return __generator(this, function (_a) {
                for (_i = 0, tables_1 = tables; _i < tables_1.length; _i++) {
                    table = tables_1[_i];
                    tableName = this.tableRoot + '_' + table;
                    (0, sql_service_1["default"])(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n                CREATE TABLE IF NOT EXISTS ", " (\n                    id BIGSERIAL,\n                    json JSONB,\n                    json_hash VARCHAR UNIQUE,\n                    symbol VARCHAR,\n                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),\n                    PRIMARY KEY(id)\n                )\n            "], ["\n                CREATE TABLE IF NOT EXISTS ", " (\n                    id BIGSERIAL,\n                    json JSONB,\n                    json_hash VARCHAR UNIQUE,\n                    symbol VARCHAR,\n                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),\n                    PRIMARY KEY(id)\n                )\n            "])), (0, sql_service_1["default"])(tableName))["catch"](function (err) {
                        console.log(err);
                    }).then(function (res) {
                        console.log(res);
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    DbService.prototype.createTableCoinInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tableName;
            return __generator(this, function (_a) {
                tableName = "coin_info";
                (0, sql_service_1["default"])(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n            CREATE TABLE IF NOT EXISTS ", " (\n                id BIGSERIAL,\n                json JSONB,\n                timestamp TIMESTAMP NOT NULL DEFAULT NOW(),\n                PRIMARY KEY(id)\n            )\n        "], ["\n            CREATE TABLE IF NOT EXISTS ", " (\n                id BIGSERIAL,\n                json JSONB,\n                timestamp TIMESTAMP NOT NULL DEFAULT NOW(),\n                PRIMARY KEY(id)\n            )\n        "])), (0, sql_service_1["default"])(tableName))["catch"](function (err) {
                    console.log(err);
                }).then(function (res) {
                    console.log(res);
                });
                return [2 /*return*/];
            });
        });
    };
    DbService.prototype.insertCoinInfo = function (coinInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var tableName;
            return __generator(this, function (_a) {
                tableName = "coin_info";
                (0, sql_service_1["default"])(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n            INSERT INTO ", "\n                (json)\n            VALUES\n                (", ")\n        "], ["\n            INSERT INTO ", "\n                (json)\n            VALUES\n                (", ")\n        "])), (0, sql_service_1["default"])(tableName), coinInfo)["catch"](function (err) {
                    console.log(err);
                }).then(function (res) {
                    console.log(res);
                });
                return [2 /*return*/];
            });
        });
    };
    return DbService;
}());
exports.DbService = DbService;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
