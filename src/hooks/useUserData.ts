import { useQuery } from "@tanstack/react-query"
import { createPublicClient, http, parseUnits, type Address } from "viem"
import { useAccount } from "wagmi"
import { DELPHO_CONFIG_PROVIDER_ABI, DELPHO_STAKER_ABI, DELPHO_VAULT_LENS_ABI } from "../config/Abi"
import { hyperliquidMainnet } from "../config/chains"
import {
    DELPHO_CONFIG_PROVIDER_ADDRESS,
    DELPHO_STAKER_ADDRESS,
    DELPHO_VAULT_LENS_ADDRESS,
} from "../config/constants"
import type { UserMetrics, UserPosition, UserPositionRaw } from "../config/types"
import { getAssetInfo } from "../utils/helper"

const client = createPublicClient({
    chain: hyperliquidMainnet,
    transport: http(),
})

export function useUserData(userAddress: Address): UserMetrics {
    const { address } = useAccount()

    const {
        data: stabilityPoolData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["stabilityPoolFullData", address],
        queryFn: async (): Promise<UserMetrics> => {
            if (!address) {
                return {
                    userPosition: null,
                    isLoading: false,
                    error: null,
                }
            }

            try {
                const [allSupportedTokens, rawPosition, stakedBalance] = await Promise.all([
                    client.readContract({
                        address: DELPHO_CONFIG_PROVIDER_ADDRESS as `0x${string}`,
                        abi: DELPHO_CONFIG_PROVIDER_ABI,
                        functionName: "getAllSupportedTokens",
                        args: [],
                    }) as Promise<Address[]>,
                    client.readContract({
                        address: DELPHO_VAULT_LENS_ADDRESS as Address,
                        abi: DELPHO_VAULT_LENS_ABI,
                        functionName: "getUserPosition",
                        args: [userAddress],
                    }) as Promise<UserPositionRaw>,
                    client.readContract({
                        address: DELPHO_STAKER_ADDRESS as Address,
                        abi: DELPHO_STAKER_ABI,
                        functionName: "balanceOf",
                        args: [userAddress],
                    }) as Promise<bigint>,
                ])

                const {
                    totalCollateralValueUsd,
                    currentDebt,
                    pendingInterest,
                    borrowedAmount,
                    currentLtv,
                    depositedAssets: rawDepositedAssets,
                    depositedAmounts: rawDepositedAmounts,
                    availableForWithdrawal: rawAvailableForWithdrawal,
                    depositedAmountUsd: rawDepositedAmountUsd,
                    hasActiveLoan,
                    loanId,
                    liquidationPrice,
                    isLtvHealthy,
                } = rawPosition

                console.log(rawPosition, "rawPosition")
                console.log(allSupportedTokens, "allSupportedTokens")
                console.log(stakedBalance, "stakedBalance")

                const supportedTokenMap = new Map<string, boolean>()
                allSupportedTokens.forEach((token) => {
                    supportedTokenMap.set(token.toLowerCase(), true)
                })

                const depositedAssets: Address[] = []
                const depositedAssetsName: string[] = []
                const depositedAmounts: bigint[] = []
                const availableForWithdrawal: bigint[] = []
                const depositedAmountUsd: bigint[] = []

                // Add all assets from the raw position
                rawDepositedAssets.forEach((asset, index) => {
                    depositedAssets.push(asset)

                    // Get display name
                    const assetInfo = getAssetInfo(asset)
                    const displayName =
                        assetInfo.symbol !== "UNKNOWN"
                            ? assetInfo.symbol
                            : `${asset.substring(0, 6)}...${asset.substring(asset.length - 4)}`
                    depositedAssetsName.push(displayName)

                    depositedAmounts.push(rawDepositedAmounts[index])
                    availableForWithdrawal.push(rawAvailableForWithdrawal[index])
                    depositedAmountUsd.push(rawDepositedAmountUsd[index])
                })

                // Add any supported tokens that aren't in the deposited assets
                allSupportedTokens.forEach((token) => {
                    const tokenLower = token.toLowerCase()
                    const isAlreadyAdded = rawDepositedAssets.some((asset) => asset.toLowerCase() === tokenLower)

                    if (!isAlreadyAdded) {
                        depositedAssets.push(token)

                        const assetInfo = getAssetInfo(token)
                        const displayName =
                            assetInfo.symbol !== "UNKNOWN"
                                ? assetInfo.symbol
                                : `${token.substring(0, 6)}...${token.substring(token.length - 4)}`
                        depositedAssetsName.push(displayName)

                        depositedAmounts.push(0n)
                        availableForWithdrawal.push(0n)
                        depositedAmountUsd.push(0n)
                    }
                })

                const userPosition: UserPosition = {
                    totalCollateralValueUsd: parseUnits(totalCollateralValueUsd.toString(), 6),
                    currentDebt: parseUnits(currentDebt.toString(), 6),
                    pendingInterest: parseUnits(pendingInterest.toString(), 6),
                    borrowedAmount: parseUnits(borrowedAmount.toString(), 6),
                    currentLtv: currentLtv / BigInt(10000),
                    depositedAssets,
                    depositedAssetsName,
                    depositedAmounts,
                    availableForWithdrawal,
                    depositedAmountUsd,
                    hasActiveLoan,
                    loanId,
                    liquidationPrice,
                    isLtvHealthy,
                    stakedBalance: parseUnits(stakedBalance.toString(), 6),
                }

                return {
                    userPosition,
                    isLoading: false,
                    error: null,
                }
            } catch (error) {
                console.error("Error fetching stability pool data:", error)
                return {
                    userPosition: null,
                    isLoading: false,
                    error: error as Error,
                }
            }
        },
        enabled: !!address,
        refetchInterval: 30000,
    })

    return (
        stabilityPoolData || {
            userPosition: null,
            isLoading,
            error: error as Error | null,
        }
    )
}
