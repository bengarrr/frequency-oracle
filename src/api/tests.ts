import ccxt from "ccxt"

export async function listExchangeApiMethods(exchange: string) {
    const CCXT = ccxt as any;
    const exchange_instance = new CCXT[exchange];
    console.log(exchange_instance.api)
}

function run() {
    listExchangeApiMethods('kraken');
    listExchangeApiMethods('okx');
}

run()