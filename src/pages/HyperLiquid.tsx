import React, { useState, useEffect } from "react";
import HomeSidebar from "../components/HomeSidebar";
import TopNav from "../components/TopNav";
import { motion } from "framer-motion";
import AdminTradeExecutor from "../components/AdminTradeExecutor";
import {
  type FrontendOpenOrders,
  type ClearinghouseState,
  type TwapSliceFill,
  type UserFills,
  type UserFunding,
  type HistoricalOrder,
  type SpotClearinghouseState,
  type Position
} from "../utils/hyperliquid";
import { calculatePriceWithSlippage, resolveCoinName, sortDirection } from "../utils/helper";
import { useHyperliquid } from "../hooks/useHyperliquidData";
import { parseUnits } from "viem";
import { useCoreActions } from "../hooks/useCoreActions";
import { createHyperliquidClient } from "../utils/hyperliquid";

const TABS = [
  "Balances",
  "Positions",
  "Open Orders",
  "TWAP",
  "Trade History",
  "Funding History",
  "Order History",
] as const;

type TabType = typeof TABS[number];

interface TableData {
  [key: string]: TableRow[];
}

interface TableRow {
  [key: string]: string | number | boolean | React.ReactNode | Position;
}

const HyperLiquid: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TABS[0]);
  const [isClosing, setIsClosing] = useState(false);
  const hyperliquid = createHyperliquidClient({ testnet: false });
  const { closeHypeShort } = useCoreActions();

  const {
    balances,
    positions,
    openOrders,
    activeTWAPs,
    tradeHistory,
    fundingHistory,
    orderHistory,
    loading: isLoading,
    error,
    fetchCompleteState,
  } = useHyperliquid();

  useEffect(() => {
    fetchCompleteState();
  }, []);

  const transformBalances = (balances: SpotClearinghouseState): TableRow[] => {
    if (!balances?.balances) return [];

    return balances.balances.map(balance => ({
      coin: balance.coin || '-',
      totalBalance: balance.total ? parseFloat(balance.total).toFixed(4) : '0.0000',
      availableBalance: balance.total && balance.hold
        ? (parseFloat(balance.total) - parseFloat(balance.hold)).toFixed(4)
        : '0.0000',
      usdcValue: balance.coin === 'USDC'
        ? `$${parseFloat(balance.total).toFixed(2)}`
        : '$0.00',
      pnl: "+0.00 (0.00%)",
      contract: balance.token?.toString() || '-'
    }));
  };

  const transformPositions = (positions: ClearinghouseState): TableRow[] => {
    if (!positions?.assetPositions) return [];
    
    return positions.assetPositions.map(position => ({
      coin: position.position?.coin || '-',
      size: position.position?.szi ? Math.abs(parseFloat(position.position.szi)).toFixed(4) : '0.0000',
      positionValue: position.position?.positionValue ? `$${parseFloat(position.position.positionValue).toFixed(2)}` : '$0.00',
      entryPrice: position.position?.entryPx ? `$${parseFloat(position.position.entryPx).toFixed(2)}` : '$0.00',
      markPrice: position.position?.liquidationPx ? `$${parseFloat(position.position.liquidationPx).toFixed(2)}` : '$0.00',
      pnl: position.position?.unrealizedPnl ?
        `${parseFloat(position.position.unrealizedPnl) >= 0 ? '+' : ''}${parseFloat(position.position.unrealizedPnl).toFixed(2)}` : '+0.00',
      liqPrice: position.position?.liquidationPx ? `$${parseFloat(position.position.liquidationPx).toFixed(2)}` : '$0.00',
      margin: position.position?.marginUsed ? `$${parseFloat(position.position.marginUsed).toFixed(2)}` : '$0.00',
      funding: position.position?.cumFunding?.allTime ?
        `$${parseFloat(position.position.cumFunding.allTime).toFixed(4)}` : '$0.0000',
      rawSize: position.position?.szi ? position.position.szi : '0',
      rawCoin: position.position?.coin || '',
      rawPosition: position.position,
      action: position.position?.szi ? (
        <button
          onClick={() => handleClosePosition(position.position)}
          disabled={isClosing}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {isClosing ? "Closing..." : "Close"}
        </button>
      ) : null
    }));
  };

  const transformOpenOrders = (orders: FrontendOpenOrders): TableRow[] => {
    if (!orders || !Array.isArray(orders)) return [];
    return orders.map(order => ({
      time: order.timestamp ? new Date(order.timestamp).toLocaleString() : '-',
      type: order.orderType || 'Limit',
      coin: resolveCoinName(order.coin) || '-',
      direction: sortDirection(order.side) || '-',
      size: order.sz ? parseFloat(order.sz).toFixed(4) : '0.0000',
      originalSize: order.origSz ? parseFloat(order.origSz).toFixed(4) : '0.0000',
      orderValue: order.sz && order.limitPx ?
        `$${(parseFloat(order.sz) * parseFloat(order.limitPx)).toFixed(2)}` : '$0.00',
      price: order.limitPx ? `$${parseFloat(order.limitPx).toFixed(2)}` : 'Market',
      reduceOnly: order.reduceOnly ? "Yes" : "No",
      triggerConditions: order.triggerPx ? `$${parseFloat(order.triggerPx).toFixed(2)}` : "-",
      tpSl: order.isPositionTpsl ? "TP/SL" : "-"
    }));
  };

  const transformTwaps = (twaps: TwapSliceFill[]): TableRow[] => {
    if (!twaps || !Array.isArray(twaps)) return [];

    return twaps.map(twap => ({
      coin: twap.fill?.coin || '-',
      size: twap.fill?.sz ? parseFloat(twap.fill.sz).toFixed(4) : '0.0000',
      executedSize: twap.fill?.sz ? parseFloat(twap.fill.sz).toFixed(4) : '0.0000',
      averagePrice: twap.fill?.px ? `$${parseFloat(twap.fill.px).toFixed(2)}` : '$0.00',
      runningTime: "N/A",
      reduceOnly: twap.fill?.reduceOnly ? "Yes" : "No",
      creationTime: twap.fill?.time ? new Date(twap.fill.time).toLocaleString() : '-',
      terminate: "-"
    }));
  };

  const transformTradeHistory = (trades: UserFills): TableRow[] => {
    if (!trades || !Array.isArray(trades)) return [];

    return trades.map(trade => ({
      time: trade.time ? new Date(trade.time).toLocaleString() : '-',
      type: trade.crossed ? "Market" : "Limit",
      coin: resolveCoinName(trade.coin) || '-',
      direction: sortDirection(trade.side) || '-',
      price: trade.px ? `$${parseFloat(trade.px).toFixed(2)}` : '$0.00',
      size: trade.sz ? parseFloat(trade.sz).toFixed(4) : '0.0000',
      tradeValue: trade.sz && trade.px ?
        `$${(parseFloat(trade.sz) * parseFloat(trade.px)).toFixed(2)}` : '$0.00',
      fee: trade.fee ? parseFloat(trade.fee).toFixed(2) : '0.00',
      closedPnl: trade.closedPnl ?
        `${parseFloat(trade.closedPnl) >= 0 ? '+' : ''}${parseFloat(trade.closedPnl).toFixed(2)}` : '+0.00'
    }));
  };

  const transformFundingHistory = (funding: UserFunding): TableRow[] => {
    if (!funding || !Array.isArray(funding)) return [];

    return funding.map(entry => ({
      time: entry.time ? new Date(entry.time).toLocaleString() : '-',
      coin: entry.delta?.coin || '-',
      size: entry.delta?.szi ? parseFloat(entry.delta.szi).toFixed(4) : '0.0000',
      positionSide: entry.delta?.szi ?
        (parseFloat(entry.delta.szi) > 0 ? "Long" : "Short") : '-',
      payment: entry.delta?.usdc ? `$${parseFloat(entry.delta.usdc).toFixed(4)}` : '$0.0000',
      rate: entry.delta?.fundingRate ?
        `${(parseFloat(entry.delta.fundingRate) * 100).toFixed(4)}%` : '0.0000%'
    }));
  };

  const transformOrderHistory = (orders: HistoricalOrder[]): TableRow[] => {
    if (!orders || !Array.isArray(orders)) return [];

    return orders.map(order => ({
      time: order.order?.timestamp ? new Date(order.order.timestamp).toLocaleString() : '-',
      type: order.order?.orderType || '-',
      coin: resolveCoinName(order.order.coin || '-'),
      direction: sortDirection(order.order?.side || '-'),
      size: order.order?.sz ? parseFloat(order.order.sz).toFixed(4) : '0.0000',
      filledSize: order.status === 'filled' && order.order?.sz ?
        parseFloat(order.order.sz).toFixed(4) : "0.0000",
      orderValue: order.order?.sz && order.order?.limitPx ?
        `$${(parseFloat(order.order.sz) * parseFloat(order.order.limitPx)).toFixed(2)}` : '$0.00',
      price: order.order?.limitPx ? `$${parseFloat(order.order.limitPx).toFixed(2)}` : "Market",
      reduceOnly: order.order?.reduceOnly ? "Yes" : "No",
      triggerConditions: order.order?.triggerPx ?
        `$${parseFloat(order.order.triggerPx).toFixed(2)}` : "-",
      tpSl: order.order?.isPositionTpsl ? "TP/SL" : "-",
      status: order.status ?
        (order.status.charAt(0).toUpperCase() + order.status.slice(1)) : '-',
      orderId: order.order?.oid ? order.order.oid.toString() : '-'
    }));
  };

  const handleClosePosition = async (position: Position) => {
    if (!position?.coin || !position?.szi) return;
    
    setIsClosing(true);
    try {
      const midPrice = await hyperliquid.getAssetPrice(position.coin, true);
      if (!midPrice) throw new Error("Could not fetch price");

      const isLong = parseFloat(position.szi) > 0;
      const closePrice = calculatePriceWithSlippage(midPrice, 0.01, !isLong);

      await closeHypeShort(
        parseUnits(closePrice.toFixed(2), 8),
        parseUnits(Math.abs(parseFloat(position.szi)).toString(), 8)
      );

      await fetchCompleteState();
    } catch (error) {
      console.error("Error closing position:", error);
    } finally {
      setIsClosing(false);
    }
  };

  const data: TableData = {
    Balances: transformBalances(balances),
    Positions: transformPositions(positions),
    "Open Orders": transformOpenOrders(openOrders),
    TWAP: transformTwaps(activeTWAPs),
    "Trade History": transformTradeHistory(tradeHistory),
    "Funding History": transformFundingHistory(fundingHistory),
    "Order History": transformOrderHistory(orderHistory)
  };

  const columns = {
    Balances: [
      { label: "Coin", key: "coin" },
      { label: "Total Balance", key: "totalBalance" },
      { label: "Available Balance", key: "availableBalance" },
      { label: "USDC Value", key: "usdcValue" },
      { label: "PNL (ROE %)", key: "pnl" },
      { label: "Contract", key: "contract" },
    ],
    Positions: [
      { label: "Coin", key: "coin" },
      { label: "Size", key: "size" },
      { label: "Position Value", key: "positionValue" },
      { label: "Entry Price", key: "entryPrice" },
      { label: "Mark Price", key: "markPrice" },
      { label: "PNL (ROE %)", key: "pnl" },
      { label: "Liq. Price", key: "liqPrice" },
      { label: "Margin", key: "margin" },
      { label: "Funding", key: "funding" },
      { label: "Action", key: "action" }
    ],
    "Open Orders": [
      { label: "Time", key: "time" },
      { label: "Type", key: "type" },
      { label: "Coin", key: "coin" },
      { label: "Direction", key: "direction" },
      { label: "Size", key: "size" },
      { label: "Original Size", key: "originalSize" },
      { label: "Order Value", key: "orderValue" },
      { label: "Price", key: "price" },
      { label: "Reduce Only", key: "reduceOnly" },
      { label: "Trigger Conditions", key: "triggerConditions" },
      { label: "TP/SL", key: "tpSl" },
    ],
    TWAP: [
      { label: "Coin", key: "coin" },
      { label: "Size", key: "size" },
      { label: "Executed Size", key: "executedSize" },
      { label: "Average Price", key: "averagePrice" },
      { label: "Running Time / Total", key: "runningTime" },
      { label: "Reduce Only", key: "reduceOnly" },
      { label: "Creation Time", key: "creationTime" },
      { label: "Terminate", key: "terminate" },
    ],
    "Trade History": [
      { label: "Time", key: "time" },
      { label: "Type", key: "type" },
      { label: "Coin", key: "coin" },
      { label: "Direction", key: "direction" },
      { label: "Price", key: "price" },
      { label: "Size", key: "size" },
      { label: "Trade Value", key: "tradeValue" },
      { label: "Fee", key: "fee" },
      { label: "Closed PNL", key: "closedPnl" },
    ],
    "Funding History": [
      { label: "Time", key: "time" },
      { label: "Coin", key: "coin" },
      { label: "Size", key: "size" },
      { label: "Position Side", key: "positionSide" },
      { label: "Payment", key: "payment" },
      { label: "Rate", key: "rate" },
    ],
    "Order History": [
      { label: "Time", key: "time" },
      { label: "Type", key: "type" },
      { label: "Coin", key: "coin" },
      { label: "Direction", key: "direction" },
      { label: "Size", key: "size" },
      { label: "Filled Size", key: "filledSize" },
      { label: "Order Value", key: "orderValue" },
      { label: "Price", key: "price" },
      { label: "Reduce Only", key: "reduceOnly" },
      { label: "Trigger Conditions", key: "triggerConditions" },
      { label: "TP/SL", key: "tpSl" },
      { label: "Status", key: "status" },
      { label: "Order ID", key: "orderId" },
    ],
  };

  const noDataMessages = {
    Balances: "No balances yet",
    Positions: "No open positions yet",
    "Open Orders": "No open orders yet",
    TWAP: "No active TWAP orders",
    "Trade History": "No trades yet",
    "Funding History": "No funding distributions yet",
    "Order History": "No historical orders yet",
  };

  const activeColumns = columns[activeTab];
  const activeData = data[activeTab] || [];
  const noDataMsg = noDataMessages[activeTab];

  return (
    <div className="min-h-screen flex bg-[#101616] text-[#E6FFF6]">
      <HomeSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <TopNav title="HyperCore Dashboard" />

        <div className="my-8">
          <AdminTradeExecutor />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border-b border-[#1A2323] flex items-center gap-2 mb-4 overflow-x-auto"
        >
          {TABS.map((tab) => (
            <motion.button
              key={tab}
              className={`px-4 py-2 text-base font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                ? "border-[#00FFB2] text-[#E6FFF6]"
                : "border-transparent text-[#A3B8B0] hover:text-[#E6FFF6]"
                }`}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {tab}
            </motion.button>
          ))}
        </motion.div>

        <div className="mt-6">
          <div className="bg-[#0B1212] rounded-xl p-0 min-h-[200px] overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00FFB2]"></div>
              </div>
            ) : (
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-[#A3B8B0] border-b border-[#1A2323]">
                    {activeColumns.map((col) => (
                      <th key={col.key} className="py-2 px-4 font-normal">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={activeColumns.length}
                        className="py-4 px-4 text-[#E6FFF6] text-center"
                      >
                        {noDataMsg}
                      </td>
                    </tr>
                  ) : (
                    activeData.map((row, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                        className="border-b border-[#1A2323] hover:bg-[#0F1717]"
                      >
                        {activeColumns.map((col) => (
                          <td key={col.key} className="py-2 px-4">
                            {row[col.key] as string}
                          </td>
                        ))}
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HyperLiquid;