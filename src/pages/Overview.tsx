import React from "react";
import HomeSidebar from "../components/HomeSidebar";
import TopNav from "../components/TopNav";
import { useHyperLendData } from "../hooks/useHyperLendData";

interface UserPositionRow {
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

const MOCK_USER_POSITIONS: UserPositionRow[] = [
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

const Overview: React.FC = () => {
  const { data: hyperLendData, isLoading, error } = useHyperLendData();

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

  const totalStrategies = 4;

  return (
    <div className="min-h-screen flex bg-[#101616] text-[#E6FFF6]">
      <HomeSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-8">
        <TopNav title="Overview" />

        <section className="grid gap-4 md:grid-cols-4">
          <OverviewCard
            label="All Supplied TVL"
            value={formatCurrency(hyperLendData?.totalCollateral)}
          />
          <OverviewCard
            label="Total Minted USDV"
            value={formatCurrency(hyperLendData?.totalDebt)}
          />
          <OverviewCard
            label="Health Factor"
            value={
              hyperLendData?.healthFactor !== undefined
                ? hyperLendData.healthFactor.toFixed(3)
                : "0.000"
            }
            highlight
          />
          <OverviewCard
            label="Active Strategies"
            value={totalStrategies.toString()}
          />
        </section>

        <section>
          <div className="bg-[#0B1212] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Portfolio Snapshot</h2>
                <p className="text-sm text-[#A3B8B0]">
                  High-level view across lending, minting and strategies.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E6FFF6]" />
              </div>
            ) : error ? (
              <div className="rounded-xl bg-red-900/40 p-4 text-sm text-red-200">
                Error loading overview data
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <OverviewMetric
                  label="Available to Borrow"
                  value={formatCurrency(hyperLendData?.availableBorrows)}
                />
                <OverviewMetric
                  label="Loan to Value (LTV)"
                  value={formatPercent(hyperLendData?.ltv)}
                />
                <OverviewMetric
                  label="Liquidation Threshold"
                  value={formatPercent(hyperLendData?.liquidationThreshold)}
                />
                <OverviewMetric
                  label="Utilization"
                  value={
                    hyperLendData?.totalCollateral
                      ? `${(
                          (hyperLendData.totalDebt /
                            hyperLendData.totalCollateral) *
                          100
                        ).toFixed(2)}%`
                      : "0.00%"
                  }
                />
              </div>
            )}
          </div>
        </section>

        <VaultUsersSection />

        <section>
          <div className="bg-[#0B1212] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Strategy Overview</h2>
              <span className="text-xs text-[#A3B8B0]">
                See details on the Strategies page
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <OverviewMetric label="Hype Programs" value="2 live" />
              <OverviewMetric label="KHype Programs" value="2 live" />
              <OverviewMetric label="Net Exposure" value="Balanced / Hedged" />
              <OverviewMetric label="Execution Venue" value="HyperLiquid" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

interface OverviewCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  label,
  value,
  highlight,
}) => (
  <div className="rounded-3xl bg-[#0B1212] border border-[#1A2323] p-5 flex flex-col justify-between">
    <p className="text-xs uppercase tracking-wide text-[#A3B8B0] mb-2">
      {label}
    </p>
    <p
      className={`text-2xl font-semibold ${
        highlight ? "text-[#00FFB2]" : "text-[#E6FFF6]"
      }`}
    >
      {value}
    </p>
  </div>
);

interface OverviewMetricProps {
  label: string;
  value: string;
}

const OverviewMetric: React.FC<OverviewMetricProps> = ({ label, value }) => (
  <div className="rounded-2xl border border-[#1A2323] p-4">
    <p className="text-sm text-[#A3B8B0]">{label}</p>
    <p className="text-lg font-semibold mt-1">{value}</p>
  </div>
);

const VaultUsersSection: React.FC = () => {
  const [userSearch, setUserSearch] = React.useState("");
  const [sortConfig, setSortConfig] = React.useState<{
    key: UserPositionKey;
    direction: "asc" | "desc";
  }>({
    key: "ltv",
    direction: "desc",
  });

  const filteredAndSorted = React.useMemo(() => {
    const filtered = MOCK_USER_POSITIONS.filter((user) =>
      user.address.toLowerCase().includes(userSearch.toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      const { key, direction } = sortConfig;
      const dir = direction === "asc" ? 1 : -1;
      if (typeof a[key] === "string" && typeof b[key] === "string") {
        return (a[key] as string).localeCompare(b[key] as string) * dir;
      }
      return ((a[key] as number) - (b[key] as number)) * dir;
    });
  }, [userSearch, sortConfig]);

  const handleSort = (key: UserPositionKey) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "desc" };
    });
  };

  const formatCurrencyLocal = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <section className="bg-[#0B1212] rounded-3xl p-6 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Vault Users & Collateral</h3>
          <p className="text-sm text-[#A3B8B0]">
            Supplied collateral, minted USDV, and liquidation posture.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search address"
          value={userSearch}
          onChange={(event) => setUserSearch(event.target.value)}
          className="bg-[#111818] border border-[#1A2323] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#00FFB2]"
        />
      </div>
      <div className="rounded-2xl border border-[#1A2323] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#111818] text-[#A3B8B0]">
            <tr>
              {(
                [
                  ["address", "User"],
                  ["suppliedCollateral", "Supplied"],
                  ["mintedUSDV", "Minted USDV"],
                  ["stakedSUSDV", "Staked sUSDV"],
                  ["ltv", "LTV"],
                  ["liquidationPrice", "Liq. Price"],
                  ["healthFactor", "Health"],
                ] as [UserPositionKey, string][]
              ).map(([key, label]) => (
                <th
                  key={key}
                  className="px-4 py-3 cursor-pointer select-none hover:text-[#E6FFF6] transition-colors"
                  onClick={() => handleSort(key)}
                >
                  {label}
                  {sortConfig.key === key && (
                    <span className="ml-1 text-xs">
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-[#A3B8B0]"
                >
                  No users found
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((user) => (
                <tr
                  key={user.address}
                  className="border-t border-[#1A2323] hover:bg-[#111818]"
                >
                  <td className="px-4 py-3 font-mono text-sm">
                    {user.address}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrencyLocal(user.suppliedCollateral)}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrencyLocal(user.mintedUSDV)}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrencyLocal(user.stakedSUSDV)}
                  </td>
                  <td className="px-4 py-3">{user.ltv.toFixed(1)}%</td>
                  <td className="px-4 py-3">
                    {formatCurrencyLocal(user.liquidationPrice)}
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      user.healthFactor < 1.15
                        ? "text-red-400"
                        : user.healthFactor < 1.4
                        ? "text-yellow-300"
                        : "text-[#00FFB2]"
                    }`}
                  >
                    {user.healthFactor.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Overview;
