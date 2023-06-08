"use strict";
exports.__esModule = true;
var postgres_1 = require("postgres");
// const connection = {
//     host: process.env.POSTGRES_HOST || 'localhost',
//     port: parseInt(process.env.POSTGRES_PORT || '5432')
// }
var connection = "postgres://".concat(process.env.POSTGRES_USER, ":").concat(process.env.POSTGRES_PASSWORD, "@").concat(process.env.POSTGRES_HOST, ":").concat(process.env.POSTGRES_PORT, "/").concat(process.env.POSTGRES_DB);
var sql = (0, postgres_1["default"])(connection);
exports["default"] = sql;
