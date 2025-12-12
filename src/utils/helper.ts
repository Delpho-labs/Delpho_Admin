import { ASSET_MAP, COIN_NAME_MAP } from "../config/constants"
import type { AssetInfo } from "../config/types"
import type { ClearinghouseState, SpotClearinghouseState } from "./hyperliquid"

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
export const calculatePriceWithSlippage = (price: number, slippage: number, isBuy: boolean) => {
    const slippageMultiplier = isBuy ? 1 + slippage : 1 - slippage
    const calculatedPrice = price * slippageMultiplier

    const truncatedPrice = Math.floor(calculatedPrice * 10000) / 10000
    return truncatedPrice
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
    return (
        ASSET_MAP[normalizedAddress] || {
            address: address,
            symbol: "UNKNOWN",
            name: "Unknown Asset",
            decimals: 18,
        }
    )
}
