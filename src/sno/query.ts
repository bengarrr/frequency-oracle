import { SecretNetworkClient } from "secretjs";

const LCD_ENDPOINT = "https://lcd.secret.express";
const VAULT_ADDRESS = "secret1tejwnma86amug6mfy74qhwclsx92zutd9rfquy"
const VAULT_CODE_HASH = "491656820a20a3034becea7a6ace40de4c79583b0d23b46c482959d6f780d80e"
const SNO_TOKEN_ADDR = "secret1z994u9dq26rc8wwuyfey509y2kcynue9gahcg7"

// To create a readonly secret.js client, just pass in a gRPC-web endpoint
const secretjs = new SecretNetworkClient({
  url: LCD_ENDPOINT,
  chainId: "secret-4",
});

type SpotPrice = {
    spot_price: {
        amount_out: number
    }
}

/**
 * @param asset_in the human addr of the asset in we are getting the spot price for
 * @param asset_out the human addr of the asset we are trying to get 
 *      @default sno_token_addr
 * @param pool_id the id of the pool we are querying
 */
async function getSpotPrice(asset_in: string = SNO_TOKEN_ADDR, asset_out: string, pool_id: number): Promise<number> {
    const resp: SpotPrice = await secretjs.query.compute.queryContract({
        contract_address: VAULT_ADDRESS,
        code_hash: VAULT_CODE_HASH,
        query: {
            spot_price: {
                pool_id: pool_id,
                asset_in,
                asset_out
            }
        }
    });

    return resp.spot_price.amount_out
}

const priceQuery = getSpotPrice(SNO_TOKEN_ADDR, "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek", 11);
priceQuery.then((price) => {
    console.log(price);
})