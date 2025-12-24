import ky from "ky"
import { truncate, wait } from "./helper"
import { USDT } from "../config/constants"

// ------------------- GlueX -------------------

async function getQuote(params: GlueXQuoteParams): Promise<GlueXQuoteResponse> {
    const { inputToken, outputToken, inputAmount, userAddress, outputAmount, orderType } = params
    console.log("Fetching GlueX quote with params:", params)

    const outputReceiver = userAddress

    const GlueXQuote = await ky
        .post("https://router.glueX.xyz/v1/quote", {
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.GLUE_X_API_KEY,
            },
            json: {
                chainID: "hyperevm",
                inputToken,
                outputToken,
                inputAmount,
                outputAmount,
                orderType,
                //slippage: 1,
                userAddress,
                outputReceiver,
                uniquePID: process.env.GLUE_X_PID,
            },
            timeout: 20000,
        })
        .json<any>()
    console.log("GlueX Quote:", GlueXQuote)

    if (GlueXQuote?.statusCode !== 200 || GlueXQuote?.result?.revert === true) {
        throw new Error(`GlueX API returned status: ${GlueXQuote?.statusCode}, revert: ${GlueXQuote?.result?.revert}`)
    }

    return {
        calldata: GlueXQuote?.result?.calldata,
        outputAmount: GlueXQuote?.result.outputAmount,
        effectiveOutputAmount: GlueXQuote?.result.effectiveOutputAmount,
        effectiveInputAmount: GlueXQuote?.result.effectiveInputAmount,
        minCollateralAmount: GlueXQuote?.result?.minOutputAmount,
        rawQuote: GlueXQuote,
        revert: GlueXQuote?.result?.revert,
    }
}

/**
 * Fetch a GlueX quote and return calldata + minCollateralAmount
 */
export async function getGlueXQuote(params: GlueXQuoteParams, maxRetries: number = 5): Promise<GlueXQuoteResponse> {
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt} of ${maxRetries} for get glueX quote`)
            const result = await getQuote(params)

            console.log(`get glueX quote succeeded on attempt ${attempt}`)
            return result
        } catch (error) {
            lastError = error
            console.warn(`Attempt ${attempt} failed:`, error)

            if (attempt < maxRetries) {
                console.log(`Waiting before retry...`)
                await wait(3000)
            }
        }
    }

    console.error(`glueX failed after ${maxRetries} attempts`)
    throw lastError
}

export async function getTokenPrice(tokenAddress: string, maxRetries: number = 3): Promise<number> {
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt} of ${maxRetries} for getting token price:`, tokenAddress)

            const requestBody = [
                {
                    foreign_token: USDT,
                    domestic_blockchain: "hyperevm",
                    domestic_token: tokenAddress.toString(),
                    foreign_blockchain: "hyperevm",
                },
            ]

            console.log("Request body:", requestBody)

            const response = await ky
                .post("https://exchange-rates.gluex.xyz/", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    json: requestBody,
                    timeout: 20000,
                })
                .json<ExchangeRateResponse[]>()

            console.log("Exchange Rates Response:", response)

            if (!response || !response[0] || !response[0].price || response[0].price == "") {
                throw new Error("Invalid response format from exchange rates API")
            }

            //TODO: parse price to 18 decimals and return a bigint
            const price = truncate(Number(response[0].price) * 1e12)
            console.log(`Token price fetch succeeded on attempt ${attempt}: ${price}`)
            return price
        } catch (error) {
            lastError = error
            console.warn(`Attempt ${attempt} failed for token price:`, error)

            if (attempt < maxRetries) {
                console.log(`Waiting before retry...`)
                await wait()
            }
        }
    }
    console.error(`Token price fetch failed after ${maxRetries} attempts`)
    throw lastError
}

interface ExchangeRateResponse {
    price: string
    foreign_token: string
    domestic_token: string
}

export interface GlueXQuoteParams {
    inputToken: string
    outputToken: string
    inputAmount?: string | number // For SELL orders
    outputAmount?: string | number // For BUY orders
    userAddress: string
    orderType?: "BUY" | "SELL"
}
export interface GlueXQuoteResponse {
    calldata?: string
    outputAmount?: string
    effectiveOutputAmount?: string
    minCollateralAmount?: string
    rawQuote: unknown
    revert: boolean
    effectiveInputAmount?: string
}
