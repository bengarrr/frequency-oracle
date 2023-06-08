"use strict";
exports.__esModule = true;
exports.createWorker = void 0;
var bullmq_1 = require("bullmq");
function createWorker(name, processor, connection, concurrency) {
    if (concurrency === void 0) { concurrency = 1; }
    var worker = new bullmq_1.Worker(name, processor, {
        connection: connection,
        concurrency: concurrency
    });
    worker.on("completed", function (job, err) {
        console.log("Completed job on queue ".concat(name));
    });
    worker.on("failed", function (job, err) {
        console.log("Faille job on queue ".concat(name), err);
    });
    var scheduler = new bullmq_1.QueueScheduler(name, { connection: connection });
    return { worker: worker, scheduler: scheduler };
}
exports.createWorker = createWorker;
