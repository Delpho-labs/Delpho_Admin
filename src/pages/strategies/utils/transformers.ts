import type { ClearinghouseState } from "../../../utils/hyperliquid";
import type { HyperLiquidRow } from "../types";

export const transformPositionsTable = (
  positions: ClearinghouseState
): HyperLiquidRow[] => {
  if (!positions?.assetPositions?.length) return [];

  return positions.assetPositions.map((position) => ({
    coin: position.position?.coin ?? "-",
    size: position.position?.szi
      ? Math.abs(parseFloat(position.position.szi)).toFixed(4)
      : "0.0000",
    entryPrice: position.position?.entryPx
      ? `$${parseFloat(position.position.entryPx).toFixed(2)}`
      : "$0.00",
    markPrice: position.position?.liquidationPx
      ? `$${parseFloat(position.position.liquidationPx).toFixed(2)}`
      : "$0.00",
    pnl: position.position?.unrealizedPnl
      ? `${parseFloat(position.position.unrealizedPnl) >= 0 ? "+" : ""}${parseFloat(
          position.position.unrealizedPnl
        ).toFixed(2)}`
      : "+0.00",
  }));
};

