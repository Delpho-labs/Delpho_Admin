import { useQuery } from "@tanstack/react-query"
import { createPublicClient, http } from "viem"
import { DELPHO_CONFIG_PROVIDER_ABI, DELPHO_STABLE_ABI, DELPHO_STAKER_ABI, DELPHO_VAULT_ABI } from "../config/Abi"
import { hyperliquidMainnet } from "../config/chains"
import {
    DELPHO_CONFIG_PROVIDER_ADDRESS,
    DELPHO_STABLE_ADDRESS,
    DELPHO_STAKER_ADDRESS,
    DELPHO_VAULT_ADDRESS,
} from "../config/constants"

const client = createPublicClient({
    chain: hyperliquidMainnet,
    transport: http(),
})

interface RoundData {
    totalWithdrawalRequests: number
    availableCollateral: number
    startTime: number
    endTime: number
}

export interface TokenData {
    address: string
    bufferFunds: number
    fundsForExecutor: number
    availableForWithdrawRequest: number
    totalCollateral: number
    totalWithdrawalRequests: number
}

export interface VaultMetrics {
    dusdMinted: number
    totalStaked: number
    currentRound: number
    calculatedRound: number
    supportedTokens: string[]
    tokensData: TokenData[]
    roundData: RoundData
}

export function useVaultData() {
    return useQuery<VaultMetrics>({
        queryKey: ["vaultData"],
        queryFn: async () => {
            try {
                const supportedTokens = (await client.readContract({
                    address: DELPHO_CONFIG_PROVIDER_ADDRESS as `0x${string}`,
                    abi: DELPHO_CONFIG_PROVIDER_ABI,
                    functionName: "getAllSupportedTokens",
                })) as string[]

                // 2. Get basic vault metrics
                const [dusdTotalSupply, sUSDVTotalStaked, currentRound, calculatedRound] = await Promise.all([
                    client.readContract({
                        address: DELPHO_STABLE_ADDRESS as `0x${string}`,
                        abi: DELPHO_STABLE_ABI,
                        functionName: "totalSupply",
                    }),
                    client.readContract({
                        address: DELPHO_STAKER_ADDRESS as `0x${string}`,
                        abi: DELPHO_STAKER_ABI,
                        functionName: "totalSupply",
                    }),
                    client.readContract({
                        address: DELPHO_VAULT_ADDRESS as `0x${string}`,
                        abi: DELPHO_VAULT_ABI,
                        functionName: "currentRound",
                    }),
                    client.readContract({
                        address: DELPHO_VAULT_ADDRESS as `0x${string}`,
                        abi: DELPHO_VAULT_ABI,
                        functionName: "calculateLatestRound",
                    }),
                ])

                console.log("currentRound", currentRound)

                // 3. Get round data for the current round
                const roundData = (await client.readContract({
                    address: DELPHO_VAULT_ADDRESS as `0x${string}`,
                    abi: DELPHO_VAULT_ABI,
                    functionName: "roundData",
                    args: [currentRound],
                })) as [bigint, bigint, bigint, bigint]

                // 4. Get token-specific data for all supported tokens
                const tokenDataPromises = supportedTokens.map(async (token) => {
                    const [bufferFunds, fundsForExecutor, availableForWithdrawRequest, totalCollateral, totalWithdrawalRequests] =
                        await Promise.all([
                            client.readContract({
                                address: DELPHO_VAULT_ADDRESS as `0x${string}`,
                                abi: DELPHO_VAULT_ABI,
                                functionName: "bufferFunds",
                                args: [token],
                            }),
                            client.readContract({
                                address: DELPHO_VAULT_ADDRESS as `0x${string}`,
                                abi: DELPHO_VAULT_ABI,
                                functionName: "fundsForExecutor",
                                args: [token],
                            }),
                            client.readContract({
                                address: DELPHO_VAULT_ADDRESS as `0x${string}`,
                                abi: DELPHO_VAULT_ABI,
                                functionName: "availableForWithdrawRequest",
                                args: [token],
                            }),
                            client.readContract({
                                address: DELPHO_VAULT_ADDRESS as `0x${string}`,
                                abi: DELPHO_VAULT_ABI,
                                functionName: "totalCollateral",
                                args: [token],
                            }),
                            client.readContract({
                                address: DELPHO_VAULT_ADDRESS as `0x${string}`,
                                abi: DELPHO_VAULT_ABI,
                                functionName: "getTotalWithdrawRequests",
                                args: [currentRound, token],
                            }),
                        ])

                    return {
                        address: token,
                        bufferFunds: Number(bufferFunds) / 1e18,
                        fundsForExecutor: Number(fundsForExecutor) / 1e18,
                        availableForWithdrawRequest: Number(availableForWithdrawRequest) / 1e18,
                        totalCollateral: Number(totalCollateral) / 1e18,
                        totalWithdrawalRequests: Number(totalWithdrawalRequests) / 1e18,
                    }
                })

                const tokensData = await Promise.all(tokenDataPromises)

                return {
                    dusdMinted: Number(dusdTotalSupply) / 1e6,
                    totalStaked: Number(sUSDVTotalStaked) / 1e6,
                    currentRound: Number(currentRound),
                    calculatedRound: Number(calculatedRound),
                    supportedTokens,
                    tokensData,
                    roundData: {
                        totalWithdrawalRequests: Number(roundData[2]) / 1e18,
                        availableCollateral: Number(roundData[3]) / 1e18,
                        startTime: Number(roundData[0]),
                        endTime: Number(roundData[1]),
                    },
                }
            } catch (error) {
                console.error("Error fetching vault data:", error)
                throw error
            }
        },
    })
}
