import { useMemo } from "react"
import { useHyperliquid } from "./useHyperliquidData"
import { useHyperLendData } from "./useHyperLendData"
import { useSentimentData } from "./useSentimentData"
import type { Strategy } from "../pages/strategies/types"

export function useStrategyDetails(strategy: Strategy | null) {
  const hyperlendData = useHyperLendData(strategy!.address )
  const sentimentData = useSentimentData(strategy!.address)
  const hyperliquidData = useHyperliquid(strategy!.address)

  return useMemo(() => {
    if (!strategy) return null

    if (strategy.strategyType === "Hyperlend") {
      return {
        address: strategy.address,
        strategyType: "Hyperlend",
        metrics: hyperlendData.data ? {
          totalCollateral: hyperlendData.data.totalCollateral,
          totalDebt: hyperlendData.data.totalDebt,
          availableBorrows: hyperlendData.data.availableBorrows,
          liquidationThreshold: hyperlendData.data.liquidationThreshold,
          ltv: hyperlendData.data.ltv,
          healthFactor: hyperlendData.data.healthFactor,
          optimalLTV: 65.0,
          borrowRate: 4.2,
        } : {
          totalCollateral: 0,
          totalDebt: 0,
          availableBorrows: 0,
          liquidationThreshold: 0,
          ltv: 0,
          healthFactor: 0,
          optimalLTV: 0,
          borrowRate: 0,
          },
        hyperliquidData,
        isLoading: hyperlendData.isLoading,
        error: hyperlendData.error?.message || null,
      }
    } else if (strategy.strategyType === "Sentiment") {
      return {
        address: strategy.address,
        strategyType: "Sentiment",
        metrics: sentimentData.data ? {
          totalCollateral: sentimentData.data.totalCollateral,
          totalDebt: sentimentData.data.totalDebt,
          availableBorrows: 0,
          liquidationThreshold: sentimentData.data.liquidationThreshold,
          ltv: sentimentData.data.ltv,
          healthFactor: sentimentData.data.healthFactor,
          netAssetValue: sentimentData.data.netAssetValue,
          leverage: sentimentData.data.leverage,
          positionSize: sentimentData.data.collateralAmount,
          assetSymbol: sentimentData.data.assetAddress,
        } : {
          totalCollateral: 0,
          totalDebt: 0,
          availableBorrows: 0,
          liquidationThreshold: 0,
          ltv: 0,
          healthFactor: 0,
          netAssetValue: 0,
          leverage: 0,
          positionSize: 0,

          },
        hyperliquidData,
        isLoading: sentimentData.isLoading,
        error: sentimentData.error?.message || null,
      }
    }

    return null
  }, [strategy, hyperlendData, sentimentData , hyperliquidData])
}