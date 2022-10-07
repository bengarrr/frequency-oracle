# Oracle
## Setup Redis

* Install/configure redis
* Make sure redis instance has setting
    * maxmemory-policy=noeviction
* Add REDIS_HOST and REDIS_PORT variables to .env file

## Setup Postgresql

* Install/lconfigure psql
* Create user and db named app
* Add POSTGRES_HOST and POSTGRES_PORT variables to .env file


## Configure exchanges

* Each exchange is configured in exchanges.json
* To add an exchange add exchange definition to the array of exchanges in exchanges.json

Example exchange definition

    {
        "exchange": "kraken",
        "symbols": [ "BTC/USD", "ETH/USD", "SCRT/USD" ]
    }

To get a list of available exchanges for tracking run:

    node run list-exchanges

* Each exchange definition contains an array of Price symbols: i.e. [ "BTC/USD", "ETH/USD", ... ]

## Command Line Options

run command is 

    ts-node src/app.ts 

run 

    ts-node src/app.ts -h 

to get a list of all available command line options

run as insert worker

    ts-node src/app.ts --insert

run as fetch worker

    ts-node src/app.ts --fetch --symbol TRADING/PAIR
ex:

    ts-node src/app.ts --fetch --symbol BTC/USD




