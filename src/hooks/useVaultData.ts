import { useQuery } from "@tanstack/react-query"
import { createPublicClient, http } from "viem"
import { DELPHO_STABLE_ABI, DELPHO_VAULT_ABI } from "../config/Abi"
import { hyperliquidMainnet } from "../config/chains"
import { DELPHO_STABLE_ADDRESS, DELPHO_VAULT_ADDRESS } from "../config/constants"

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

export interface VaultMetrics {
    dusdMinted: number
    totalBorrowed: number
    totalCollateral: number
    bufferFunds: number
    fundsForExecutor: number
    currentRound: number
    roundData: RoundData
}

export function useVaultData() {
    return useQuery<VaultMetrics>({
        queryKey: ["vaultData"],
        queryFn: async () => {
            try {
                const [dusdTotalSupply, totalBorrowed, totalCollateral, bufferFunds, fundsForExecutor, currentRound] =
                    await Promise.all([
                        client.readContract({
                            address: DELPHO_STABLE_ADDRESS as `0x${string}`,
                            abi: DELPHO_STABLE_ABI,
                            functionName: "totalSupply",
                        }),
                        client.readContract({
                            address: DELPHO_VAULT_ADDRESS as `0x${string}`,
                            abi: DELPHO_VAULT_ABI,
                            functionName: "totalBorrowed",
                        }),
                        client.readContract({
                            address: DELPHO_VAULT_ADDRESS as `0x${string}`,
                            abi: DELPHO_VAULT_ABI,
                            functionName: "totalCollateral",
                        }),
                        client.readContract({
                            address: DELPHO_VAULT_ADDRESS as `0x${string}`,
                            abi: DELPHO_VAULT_ABI,
                            functionName: "getAvailableBuffer",
                        }),
                        client.readContract({
                            address: DELPHO_VAULT_ADDRESS as `0x${string}`,
                            abi: DELPHO_VAULT_ABI,
                            functionName: "getFundsForExecutor",
                        }),
                        client.readContract({
                            address: DELPHO_VAULT_ADDRESS as `0x${string}`,
                            abi: DELPHO_VAULT_ABI,
                            functionName: "currentRound",
                        }),
                    ])

                // Get round data for the current round
                const roundData = (await client.readContract({
                    address: DELPHO_VAULT_ADDRESS as `0x${string}`,
                    abi: DELPHO_VAULT_ABI,
                    functionName: "roundData",
                    args: [currentRound],
                })) as [bigint, bigint, bigint, bigint]

                return {
                    dusdMinted: Number(dusdTotalSupply) / 1e6,
                    totalBorrowed: Number(totalBorrowed) / 1e6,
                    totalCollateral: Number(totalCollateral) / 1e18,
                    bufferFunds: Number(bufferFunds) / 1e18,
                    fundsForExecutor: Number(fundsForExecutor) / 1e18,
                    currentRound: Number(currentRound),
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
