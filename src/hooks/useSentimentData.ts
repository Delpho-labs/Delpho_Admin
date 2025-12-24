import { useQuery } from "@tanstack/react-query"
import { type Address, createPublicClient, formatEther, formatUnits, http } from "viem"
import { useChainId } from "wagmi"
import { WHYPE, ETH_ADDRESS, SENTIMENT_LENS_ADDRESS, SENTIMENT_RISK_POOL_ADDRESS } from "../config/constants"
import { hyperliquidMainnet } from "../config/chains"
import { SENTIMENT_LENS_ABI, SENTIMENT_RISK_POOL_ABI } from "../config/Abi"
import { getTokenPrice, truncate } from "../utils/helper"

interface AssetData {
    asset: Address
    amount: bigint
    valueInEth: bigint
}

interface DebtData {
    asset: Address
    amount: bigint
    valueInEth: bigint
}

interface PositionData {
    assets: AssetData[]
    debts: DebtData[]
}

interface UserPosition {
    totalCollateral: number
    totalDebt: number
    netAssetValue: number
    leverage: number
    healthFactor: number
    liquidationPrice: number | null
    ltv: number
    maxLeverage: number
    collateralAmount: number
    debtAmount: number
    currentPrice: number
    hypePrice: number
    ethPrice: number
    liquidationThreshold: number
    assetAddress: string
}

export function useSentimentData(address: string) {
    const chainId = useChainId()

    return useQuery<UserPosition | null>({
        queryKey: ["sentimentData", address, chainId],
        queryFn: async () => {
            if (!address) return null

            const chain = hyperliquidMainnet
            const client = createPublicClient({
                chain,
                transport: http(),
            })

            try {
                // const positionAddress = (await client.readContract({
                //         address: DELPHO_SENTIMENT_EXECUTOR_ADDRESS,
                //         abi: DELPHO_SENTIMENT_EXECUTOR_ABI,
                //         functionName: "positionAddress",
                //         args: [],
                // })) as string
                const positionAddress = "0x031e891101a748c07c25f954fe69cff3785515a4"
                console.log(positionAddress, "positionAddress")

                const [positionData, maxLtvValue, ethPriceUSD, hypePrice] = await Promise.all([
                    (await client.readContract({
                        address: SENTIMENT_LENS_ADDRESS,
                        abi: SENTIMENT_LENS_ABI,
                        functionName: "getPositionData",
                        args: [positionAddress as Address],
                    })) as PositionData,
                    // Get max LTV from risk pool
                    client.readContract({
                        address: SENTIMENT_RISK_POOL_ADDRESS,
                        abi: SENTIMENT_RISK_POOL_ABI,
                        functionName: "maxLtv",
                    }) as Promise<bigint>,

                    // Get ETH price
                    getTokenPrice(ETH_ADDRESS),

                    // Get WHYPE price
                    getTokenPrice(WHYPE),
                ])
                console.log(positionData, "positionData")
                console.log(ethPriceUSD, "ethPriceUSD")
                console.log(hypePrice, "hypePrice")
                console.log(positionData, "positionData")

                const assetData = positionData.assets
                const debtData = positionData.debts

                // If no assets or debts, return null
                if (assetData.length === 0 && debtData.length === 0) {
                    return null
                }

                // Get primary collateral price
                const primaryCollateral = assetData[0].asset
                console.log(primaryCollateral, "primaryCollateral")

                const currentPriceUSD = await getTokenPrice(primaryCollateral)

                // Convert ETH values to USD
                const totalAssetValueETH = assetData[0]?.valueInEth || BigInt(0)
                const totalDebtValueETH = debtData[0]?.valueInEth || BigInt(0)

                const totalAssetValueUSD = Number(formatEther(totalAssetValueETH)) * ethPriceUSD

                const totalDebtValueUSD = Number(formatEther(totalDebtValueETH)) * ethPriceUSD

                // Convert max LTV to ratio
                const maxLtvRatio = Number(formatEther(maxLtvValue))

                // Convert amounts to numbers
                const collateralAmount = Number(formatUnits(assetData[0]?.amount || BigInt(0), 18))
                const debtAmount = Number(formatUnits(debtData[0]?.amount || BigInt(0), 18))

                // Calculate core metrics
                const netAssetValue = totalAssetValueUSD - totalDebtValueUSD

                // Leverage = Total Position Value / Net Equity
                const leverage = truncate(totalAssetValueUSD / netAssetValue)

                // LTV = Debt Value / Collateral Value
                const ltv = truncate(totalDebtValueUSD / totalAssetValueUSD)

                // Max Leverage from Max LTV: Max Leverage = 1 / (1 - Max LTV)
                const maxLeverage = Number((1 / (1 - maxLtvRatio)).toFixed(1))

                // Health Factor = (Collateral Value × Max LTV) / Debt Value
                const healthFactor = (totalAssetValueUSD * maxLtvRatio) / totalDebtValueUSD

                // Liquidation Price = Debt / (Collateral × Max LTV)
                const liquidationPrice = totalDebtValueUSD / (collateralAmount * maxLtvRatio)

                return {
                    totalCollateral: truncate(totalAssetValueUSD),
                    totalDebt: truncate(totalDebtValueUSD),
                    netAssetValue: truncate(netAssetValue),
                    leverage: isFinite(leverage) ? leverage : 0,
                    healthFactor: isFinite(healthFactor) ? truncate(healthFactor) : 0,
                    liquidationPrice: liquidationPrice > 0 ? truncate(liquidationPrice) : null,
                    ltv: isFinite(ltv) ? truncate(ltv * 100) : 0, // Convert to percentage
                    maxLeverage: isFinite(maxLeverage) ? maxLeverage : 0,
                    collateralAmount: truncate(collateralAmount),
                    debtAmount: truncate(debtAmount),
                    currentPrice: truncate(currentPriceUSD),
                    hypePrice: truncate(hypePrice),
                    ethPrice: truncate(ethPriceUSD),
                    liquidationThreshold: truncate(maxLtvRatio * 100),
                    assetAddress: assetData[0]?.asset || "",
                }
            } catch (error) {
                console.error("Error fetching sentiment data:", error)
                throw new Error("Failed to fetch sentiment position data")
            }
        },
        enabled: !!address && !!SENTIMENT_LENS_ADDRESS && !!SENTIMENT_RISK_POOL_ADDRESS,
        staleTime: 60_000,
        refetchInterval: 300_000,
    })
}
