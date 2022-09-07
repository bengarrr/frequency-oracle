# SecretNodes ExchangeTracker 
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

