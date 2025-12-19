import axios from "axios"
import { ASSET_MAP, COIN_NAME_MAP, K_HYPE } from "../config/constants"
import type { AssetInfo } from "../config/types"
import type { ClearinghouseState, SpotClearinghouseState } from "./hyperliquid"
import { formatEther, parseUnits } from "viem"

export function resolveCoinName(apiCoinName: string): string {
    if (COIN_NAME_MAP[apiCoinName]) {
        return COIN_NAME_MAP[apiCoinName]
    }
    return apiCoinName
}

export function sortDirection(direction: string): string {
    if (direction === "A") return "Buy"
    if (direction === "B") return "Sell"
    return direction
}

/**
 * Get spot balance for a specific asset
 * @param balances - The balances object from Hyperliquid API
 * @param assetName - The asset name to get balance for (e.g., "USDC")
 * @returns The balance as a number (0 if asset not found)
 */
export const getUserSpotBalance = (balances: SpotClearinghouseState, assetName: string): number => {
    const assetBalance = balances.balances.find((balance) => balance.coin === assetName)
    return assetBalance ? parseFloat(assetBalance.total) : 0
}

/**
 * Get withdrawable balance from perpetual positions
 * @param positions - The positions object from Hyperliquid API
 * @returns The withdrawable balance as a number
 */
export const getUserPerpWithdrawableBalance = (positions: ClearinghouseState): string => {
    return positions.withdrawable
}

/**
 * Helper function to get LTV status color
 */
export function getLtvStatusColor(ltv: number): string {
    if (ltv < 50) return "text-emerald-400"
    if (ltv < 65) return "text-yellow-400"
    if (ltv < 75) return "text-orange-400"
    return "text-red-400"
}

/**
 * Helper function to calculate health factor
 */
export function calculateHealthFactor(ltv: number, maxLtv: number = 65): number {
    if (ltv === 0) return Infinity
    return maxLtv / ltv
}

/**
 * Helper function to decode asset address to readable name and symbol
 */
export function getAssetInfo(address: string): AssetInfo {
    const normalizedAddress = address.toLowerCase()
    const assetData = ASSET_MAP[normalizedAddress]

    if (assetData) {
        return {
            address: address,
            symbol: assetData.symbol,
            name: assetData.name,
            decimals: assetData.decimals,
            feedId: assetData.feedId,
        }
    }

    return {
        address: address,
        symbol: "UNKNOWN",
        name: "Unknown Asset",
        decimals: 18,
        feedId: "0x",
    }
}

export function truncate(num: number) {
    return Math.floor(num * 100) / 100
}

export async function getTokenPrice(address: string): Promise<number> {
    const feedId = getAssetInfo(address).feedId
    const url = `https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=${feedId}&encoding=hex&parsed=true`

    const response = await axios.get(url, {
        headers: {
            accept: "application/json",
        },
    })
    const priceData = response.data.parsed[0].price
    const parsedPrice = parseUnits(priceData.price ,18 + priceData.expo)
    const price = formatEther(parsedPrice)
    return truncate(Number(price))
}

export function calculatePriceWithSlippage(price: number, slippagePercent: number, isBuy: boolean): number {
    const slippageMultiplier = isBuy ? 1 + slippagePercent : 1 - slippagePercent
    return truncate(price * slippageMultiplier)
}

export async function wait(ms: number = 1000): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function calculateBorrowAmountRaw(
    collateralAmount: bigint, // e.g. 35e18n
    leverage: bigint = 15000n // 1.5x leverage represented as 15000, scale = 10000
): Promise<bigint> {
    const price = truncate(await getTokenPrice(K_HYPE))
    const priceRaw: bigint = parseUnits(price.toString(), 6)

    const ONE_E18 = 10n ** 18n

    // Step 1: Collateral value in USD (scaled by priceDecimals)
    const collateralValueRaw = (collateralAmount * priceRaw) / ONE_E18

    // Step 2: Target exposure = collateral * leverage
    const targetExposureRaw = (collateralValueRaw * leverage) / 10000n

    // Step 3: Extra exposure in USD
    const extraExposureRaw = targetExposureRaw - collateralValueRaw

    return extraExposureRaw
}