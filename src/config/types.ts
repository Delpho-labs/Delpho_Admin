import type { Address } from "viem"

export type UserPositionRaw = {
    totalCollateralValueUsd: bigint
    currentDebt: bigint
    pendingInterest: bigint
    borrowedAmount: bigint
    currentLtv: bigint
    depositedAssets: Address[]
    depositedAmounts: bigint[]
    availableForWithdrawal: bigint[]
    depositedAmountUsd: bigint[]
    hasActiveLoan: boolean
    loanId: bigint
    liquidationPrice: bigint
    isLtvHealthy: boolean
}

export type UserPosition = {
    totalCollateralValueUsd: bigint
    currentDebt: bigint
    pendingInterest: bigint
    borrowedAmount: bigint
    currentLtv: bigint
    depositedAssets: Address[]
    depositedAssetsName: string[]
    depositedAmounts: bigint[]
    availableForWithdrawal: bigint[]
    depositedAmountUsd: bigint[]
    hasActiveLoan: boolean
    loanId: bigint
    liquidationPrice: bigint
    isLtvHealthy: boolean
    stakedBalance: bigint
}

export interface UserMetrics {
    userPosition: UserPosition | null
    isLoading: boolean
    error: Error | null
}

export type AssetInfo = {
    address: string
    symbol: string
    name: string
    decimals: number
    feedId: string
}

export type RebalanceDirection = "UPSIDE" | "DOWNSIDE" | "NONE"

export interface RebalanceInfo {
    needsRebalancing: boolean
    rebalancingType: RebalanceDirection
    amount: number
}
