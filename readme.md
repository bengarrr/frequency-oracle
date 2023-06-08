# Setup

## Dependencies 

### Typescript

* Install typescript

        npm install -g typescript
        npm install -g ts-node

### Redis

* Install/configure redis
* Make sure redis instance has setting
    * maxmemory-policy=noeviction
* Add `REDIS_*` variables to .env file(s)

### Postgresql

* Install/configure psql
* Create role and db named app
* Add `POSTGRES_*` variables to .env file(s)

### PM2

For production make sure to install `pm2`

    npm install -g pm2


# Configure exchanges

* Each exchange is configured in exchanges.json
* To add an exchange add exchange definition to the array of exchanges in exchanges.json

Example exchange definition

    {
        "exchange": "kraken",
    },
    {
        "exchange: "...",
    }
    ...

To get a list of available exchanges for tracking run:

    node run list-exchanges

# Building

run 

    tsc ./src/app.js

*see ts.config for build options

# Running

## Production

*note make sure pm2 is installed 

*copy desired .env.production file to `./build` dir

run fetch worker

    NODE=production pm2 start ./build/src/app.js -- --fetch --symbol TRADE/PAIR

run insert worker

    NODE=production pm2 start -i max ./build/src/app.js -- --insert 

run backfill 

    NODE=production pm2 start ./build/src/app.js -- --backfill 
 
 or

    NODE=production pm2 start ./build/src/app.js -- --backfill YYYY/MM/DD:HH:ss 
    
    #optional date to backfill from for historical backfilling

## Development

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

# PM2

If on a fresh deployment make sure to install the pm2 daemon

    pm2 startup

Then, after starting at least one worker application run:

    pm2 save

Save command will store all currently running pm2 processes and automatically respawn them on a machine restart.

* Note: using the pm2 `-i` [cluster](https://pm2.keymetrics.io/docs/usage/cluster-mode/) command flag for insert workers. Simple concurrency for the insert worker process, to make sure the insert worker can keep up with fetch workers. 




