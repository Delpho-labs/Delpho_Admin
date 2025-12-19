import { useQuery } from "@tanstack/react-query"
import { createPublicClient, formatUnits, http } from "viem"
import { useChainId } from "wagmi"
import { HYPERLEND_POOL_ADDRESS } from "../config/constants"
import { hyperliquidMainnet } from "../config/chains"
import { HYPERLEND_ABI } from "../config/Abi"

interface HyperLendData {
    totalCollateral: number
    totalDebt: number
    availableBorrows: number
    liquidationThreshold: number
    ltv: number
    healthFactor: number
}

export function useHyperLendData(address: string) {

    const chainId = useChainId()

    return useQuery<HyperLendData | null>({
        queryKey: ["hyperlendData", address, chainId],
        queryFn: async () => {
            if (!address) return null

            const chain = hyperliquidMainnet
            const client = createPublicClient({
                chain,
                transport: http(),
            })

            const result = (await client.readContract({
                address: HYPERLEND_POOL_ADDRESS,
                abi: HYPERLEND_ABI,
                functionName: "getUserAccountData",
                args: [address],
            })) as [bigint, bigint, bigint, bigint, bigint, bigint]

            const [totalCollateralBase, totalDebtBase, availableBorrowsBase, currentLiquidationThreshold, ltv, healthFactor] =
                result

            const decimals = 8

            return {
                totalCollateral: parseFloat(formatUnits(totalCollateralBase, decimals)),
                totalDebt: parseFloat(formatUnits(totalDebtBase, decimals)),
                availableBorrows: parseFloat(formatUnits(availableBorrowsBase, decimals)),
                liquidationThreshold: parseFloat(formatUnits(currentLiquidationThreshold, 2)),
                ltv: parseFloat(formatUnits(ltv, 2)),
                healthFactor: parseFloat(formatUnits(healthFactor, 18)),
            }
        },
        enabled: !!address,
        staleTime: 60_000,
        refetchInterval: 300_000,
    })
}
