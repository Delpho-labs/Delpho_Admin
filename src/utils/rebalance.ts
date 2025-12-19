import { truncate } from "../utils/helper"
import { createHyperliquidClient, type ClearinghouseState } from "./hyperliquid"
import { type RebalanceDirection } from "../config/types"

export async function checkForRebalance(executorAddress: string) {
    const hyperliquid = createHyperliquidClient({ testnet: false })
    const positions = (await hyperliquid.getPerpPositions(executorAddress)) as ClearinghouseState

    const pnl = truncate(Number(positions.assetPositions[0].position.unrealizedPnl))
    
    if (Math.abs(pnl) >= 12) {
        if (pnl > 0) {
            return {
                needsRebalancing: true,
                rebalancingType: "UPSIDE" as RebalanceDirection,
                amount: Math.abs(pnl),
            }
        } else {
            return {
                needsRebalancing: true,
                rebalancingType: "DOWNSIDE" as RebalanceDirection,
                amount: Math.abs(pnl),
            }
        }
    } else {
        return {
            needsRebalancing: false, 
            rebalancingType: "NONE" as RebalanceDirection,
            amount: 0,
        }
    }
}