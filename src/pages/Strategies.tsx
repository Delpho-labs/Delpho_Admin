import React, { useEffect, useMemo, useState } from "react";
import HomeSidebar from "../components/HomeSidebar";
import TopNav from "../components/TopNav";
import { useHyperliquid } from "../hooks/useHyperliquidData";
import { useHyperLendData } from "../hooks/useHyperLendData";
import type { ClearinghouseState } from "../utils/hyperliquid";

interface Strategy {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  focus: string;
  asset: string;
  risk: "Low" | "Medium" | "High";
}

interface UserPosition {
  address: string;
  suppliedCollateral: number;
  mintedUSDV: number;
  stakedSUSDV: number;
  ltv: number;
  liquidationPrice: number;
  healthFactor: number;
}

type UserPositionKey =
  | "address"
  | "suppliedCollateral"
  | "mintedUSDV"
  | "stakedSUSDV"
  | "ltv"
  | "liquidationPrice"
  | "healthFactor";

const STRATEGIES: Strategy[] = [
  {
    id: "hype-sentiment",
    title: "Hype - Sentiment Strategy",
    subtitle: "Signals-driven directional exposure",
    description:
      "Leverages real-time social sentiment and HyperLiquid perp liquidity for fast directional positioning.",
    focus: "BTC Perp",
    asset: "BTC",
    risk: "Medium",
  },
  {
    id: "hype-hyperlend",
    title: "Hype - Hyperlend Strategy",
    subtitle: "Capital-efficient looping",
    description:
      "Optimizes LTV by cycling collateral between HyperLend and HyperLiquid execution.",
    focus: "ETH Loop",
    asset: "ETH",
    risk: "Low",
  },
  {
    id: "khype-sentiment",
    title: "KHype - Sentiment Strategy",
    subtitle: "Multi-venue hedged sentiment",
    description:
      "Combines cross-venue hedges with momentum execution for lower variance.",
    focus: "Basket",
    asset: "SOL",
    risk: "Medium",
  },
  {
    id: "khype-hyperlend",
    title: "KHype - Hyperlend Strategy",
    subtitle: "Delta-neutral carry",
    description:
      "Deploys vault assets into carry trades while keeping health factor targets intact.",
    focus: "Stable Carry",
    asset: "USDC",
    risk: "Low",
  },
];

const USER_POSITIONS: UserPosition[] = [
  {
    address: "0x8a2...42d1",
    suppliedCollateral: 210_000,
    mintedUSDV: 110_000,
    stakedSUSDV: 45_000,
    ltv: 52.4,
    liquidationPrice: 32_500,
    healthFactor: 1.58,
  },
  {
    address: "0x4b1...ee99",
    suppliedCollateral: 125_500,
    mintedUSDV: 62_800,
    stakedSUSDV: 20_000,
    ltv: 50.0,
    liquidationPrice: 29_900,
    healthFactor: 1.71,
  },
  {
    address: "0xf91...bc33",
    suppliedCollateral: 98_420,
    mintedUSDV: 70_000,
    stakedSUSDV: 31_750,
    ltv: 71.1,
    liquidationPrice: 25_400,
    healthFactor: 1.21,
  },
  {
    address: "0xe10...aa02",
    suppliedCollateral: 350_000,
    mintedUSDV: 140_500,
    stakedSUSDV: 60_000,
    ltv: 40.1,
    liquidationPrice: 34_200,
    healthFactor: 2.02,
  },
  {
    address: "0x7ce...f201",
    suppliedCollateral: 64_100,
    mintedUSDV: 48_000,
    stakedSUSDV: 10_500,
    ltv: 74.9,
    liquidationPrice: 21_900,
    healthFactor: 1.09,
  },
];

const Strategies: React.FC = () => {
  const [selectedStrategyId, setSelectedStrategyId] = useState(STRATEGIES[0].id);
  const selectedStrategy =
    STRATEGIES.find((strategy) => strategy.id === selectedStrategyId) ??
    STRATEGIES[0];

  const {
    positions,
    loading: hyperLiquidLoading,
    error: hyperLiquidError,
    fetchCompleteState,
  } = useHyperliquid();
  const {
    data: hyperLendData,
    isLoading: hyperLendLoading,
    error: hyperLendError,
  } = useHyperLendData();
  const [userSearch, setUserSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: UserPositionKey;
    direction: "asc" | "desc";
  }>({
    key: "ltv",
    direction: "desc",
  });

  useEffect(() => {
    fetchCompleteState();
    // We only need the full HyperLiquid snapshot once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hyperLiquidRows = useMemo(
    () => transformPositionsTable(positions),
    [positions]
  );

  const sortedUsers = useMemo(() => {
    const filtered = USER_POSITIONS.filter((user) =>
      user.address.toLowerCase().includes(userSearch.toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      const key = sortConfig.key;
      const direction = sortConfig.direction === "asc" ? 1 : -1;
      if (typeof a[key] === "string" && typeof b[key] === "string") {
        return (a[key] as string).localeCompare(b[key] as string) * direction;
      }
      return ((a[key] as number) - (b[key] as number)) * direction;
    });
  }, [userSearch, sortConfig]);

  const handleSort = (key: UserPositionKey) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "desc" };
    });
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return "0.00%";
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen flex bg-[#101616] text-[#E6FFF6]">
      <HomeSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <TopNav title="Strategies" />

        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-[#7E8F89]">
                  Strategy Shelf
                </p>
                <h2 className="text-2xl font-semibold">Active Programs</h2>
              </div>
              <span className="text-sm text-[#A3B8B0]">
                {STRATEGIES.length} curated strategies
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {STRATEGIES.map((strategy) => {
                const isSelected = strategy.id === selectedStrategyId;
                return (
                  <button
                    key={strategy.id}
                    className={`text-left rounded-2xl border px-5 py-4 transition-all ${
                      isSelected
                        ? "border-[#00FFB2] bg-gradient-to-br from-[#132020] to-[#0B1515] shadow-[0_0_20px_rgba(0,255,178,0.2)]"
                        : "border-[#1A2323] bg-[#0D1515] hover:border-[#00FFB2]/40"
                    }`}
                    onClick={() => setSelectedStrategyId(strategy.id)}
                  >
                    <p className="text-lg font-semibold truncate">
                      {strategy.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <div className="bg-[#0B1212] rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  Position from HyperLiquid
                </h3>
                {hyperLiquidLoading && (
                  <span className="text-sm text-[#A3B8B0]">Refreshing…</span>
                )}
              </div>

              {hyperLiquidError && (
                <div className="mb-4 rounded-xl bg-red-900/40 p-3 text-sm text-red-200">
                  {hyperLiquidError}
                </div>
              )}

              <div className="rounded-2xl border border-[#1A2323] overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#111818] text-[#A3B8B0]">
                    <tr>
                      <th className="px-4 py-3">Coin</th>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Entry Price</th>
                      <th className="px-4 py-3">Mark Price</th>
                      <th className="px-4 py-3">PNL (ROE %)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hyperLiquidRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-[#A3B8B0]"
                        >
                          No open positions yet
                        </td>
                      </tr>
                    ) : (
                      hyperLiquidRows.map((row, idx) => (
                        <tr
                          key={`${row.coin}-${idx}`}
                          className="border-t border-[#1A2323] hover:bg-[#111818]"
                        >
                          <td className="px-4 py-3">{row.coin}</td>
                          <td className="px-4 py-3">{row.size}</td>
                          <td className="px-4 py-3">{row.entryPrice}</td>
                          <td className="px-4 py-3">{row.markPrice}</td>
                          <td className="px-4 py-3">{row.pnl}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#0B1212] rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Position from Strategy</h3>
                {hyperLendLoading && (
                  <span className="text-sm text-[#A3B8B0]">Loading…</span>
                )}
              </div>

              {hyperLendError && (
                <div className="rounded-xl bg-red-900/40 p-3 text-sm text-red-200">
                  {hyperLendError instanceof Error
                    ? hyperLendError.message
                    : "Unable to load strategy data"}
                </div>
              )}

              <div className="rounded-2xl border border-[#1A2323] p-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <CompactMetric
                    label="Total Collateral"
                    value={formatCurrency(hyperLendData?.totalCollateral)}
                  />
                  <CompactMetric
                    label="Total Debt / Minted"
                    value={formatCurrency(hyperLendData?.totalDebt)}
                  />
                  <CompactMetric
                    label="Available to Borrow"
                    value={formatCurrency(hyperLendData?.availableBorrows)}
                  />
                  <CompactMetric
                    label="Health Factor"
                    value={
                      hyperLendData?.healthFactor !== undefined
                        ? hyperLendData.healthFactor.toFixed(4)
                        : "0.0000"
                    }
                    highlight
                  />
                  <CompactMetric
                    label="LTV"
                    value={formatPercent(hyperLendData?.ltv)}
                  />
                  <CompactMetric
                    label="Liq. Threshold"
                    value={formatPercent(hyperLendData?.liquidationThreshold)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#0B1212] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Positions in Execution</h3>
              {hyperLiquidLoading && (
                <span className="text-sm text-[#A3B8B0]">Syncing...</span>
              )}
            </div>
            <div className="rounded-2xl border border-[#1A2323] overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#111818] text-[#A3B8B0]">
                  <tr>
                    <th className="px-4 py-3">Strategy</th>
                    <th className="px-4 py-3">Coin</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Entry</th>
                    <th className="px-4 py-3">Mark</th>
                    <th className="px-4 py-3">PNL</th>
                  </tr>
                </thead>
                <tbody>
                  {hyperLiquidRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-[#A3B8B0]"
                      >
                        No live execution at the moment
                      </td>
                    </tr>
                  ) : (
                    hyperLiquidRows.map((row, idx) => (
                      <tr
                        key={`${row.coin}-exec-${idx}`}
                        className="border-t border-[#1A2323] hover:bg-[#111818]"
                      >
                        <td className="px-4 py-3">Linked</td>
                        <td className="px-4 py-3">{row.coin}</td>
                        <td className="px-4 py-3">{row.size}</td>
                        <td className="px-4 py-3">{row.entryPrice}</td>
                        <td className="px-4 py-3">{row.markPrice}</td>
                        <td className="px-4 py-3">{row.pnl}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <MetricTile
              label="All Supplied TVL"
              value={formatCurrency(hyperLendData?.totalCollateral)}
            />
            <MetricTile
              label="Total Minted USDV"
              value={formatCurrency(hyperLendData?.totalDebt)}
            />
            <MetricTile
              label="Utilization"
              value={
                hyperLendData?.totalCollateral
                  ? `${(
                      (hyperLendData.totalDebt / hyperLendData.totalCollateral) *
                      100
                    ).toFixed(2)}%`
                  : "0.00%"
              }
            />
          </section>

        </div>
      </main>
    </div>
  );
};

interface HyperLiquidRow {
  coin: string;
  size: string;
  entryPrice: string;
  markPrice: string;
  pnl: string;
}

const transformPositionsTable = (
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

interface MetricTileProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const MetricTile: React.FC<MetricTileProps> = ({ label, value, highlight }) => (
  <div className="rounded-2xl border border-[#1A2323] p-4">
    <p className="text-sm text-[#A3B8B0]">{label}</p>
    <p
      className={`text-2xl font-semibold mt-2 ${
        highlight ? "text-[#00FFB2]" : "text-[#E6FFF6]"
      }`}
    >
      {value}
    </p>
  </div>
);

interface CompactMetricProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const CompactMetric: React.FC<CompactMetricProps> = ({
  label,
  value,
  highlight,
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] uppercase tracking-wide text-[#7E8F89]">
      {label}
    </span>
    <span
      className={`text-sm font-semibold ${
        highlight ? "text-[#00FFB2]" : "text-[#E6FFF6]"
      }`}
    >
      {value}
    </span>
  </div>
);

export default Strategies;

