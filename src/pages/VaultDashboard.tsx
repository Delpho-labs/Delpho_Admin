import React, { useMemo } from "react";
import { FiActivity, FiClock, FiPieChart, FiTrendingUp } from "react-icons/fi";
import HomeSidebar from "../components/HomeSidebar";
import TopNav from "../components/TopNav";
import CollateralTable from "./vault/components/CollateralTable";
import Section from "./vault/components/Section";
import StatCard from "./vault/components/StatCard";
import type { CollateralRow } from "./vault/types";
import { useVaultData } from "../hooks/useVaultData";

const formatDateTime = (timestamp?: number) => {
  if (!timestamp) return "—";
  return new Date(timestamp * 1000).toLocaleString();
};

const VaultDashboard: React.FC = () => {
  const { data, isLoading, error } = useVaultData();

  const derived = useMemo(() => {
    const utilization =
      data && data.totalCollateral > 0
        ? Math.min(
            (data.totalBorrowed / data.totalCollateral) * 100,
            999
          ).toFixed(1)
        : "0.0";

    const collateralRows: CollateralRow[] = [
      {
        label: "Total Collateral",
        hype: `${(data?.totalCollateral ?? 0).toFixed(3)} HYPE`,
        khype: "—",
      },
      {
        label: "Buffer Funds",
        hype: `${(data?.bufferFunds ?? 0).toFixed(3)} HYPE`,
        khype: "—",
      },
      {
        label: "Funds For Executor",
        hype: `${(data?.fundsForExecutor ?? 0).toFixed(3)} HYPE`,
        khype: "—",
      },
      {
        label: "Available For Withdraw",
        hype: `${(data?.roundData.availableCollateral ?? 0).toFixed(3)} HYPE`,
        khype: "—",
      },
      {
        label: "Withdraw Requests (current)",
        hype: `${(data?.roundData.totalWithdrawalRequests ?? 0).toFixed(
          3
        )} HYPE`,
        khype: "—",
      },
    ];

    return {
      utilization,
      collateralRows,
    };
  }, [data]);

  const shimmer = (
    <div className="h-5 w-24 animate-pulse rounded bg-white/10" aria-hidden />
  );

  return (
    <div className="min-h-screen bg-[#0A1010] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(38,255,212,0.08),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(88,139,255,0.08),transparent_30%)]" />
      </div>

      <div className="relative flex">
        <HomeSidebar />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-10">
          <TopNav title="Delpho Vault" />

          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              Unable to load live vault data. Showing placeholders.
            </div>
          )}

          {isLoading && (
            <div className="my-10 grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-28 animate-pulse rounded-2xl bg-white/5"
                />
              ))}
            </div>
          )}

          <div className="space-y-6">
            <Section title="Round Details">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={<FiActivity />}
                  label="Current Round"
                  value={data ? `#${data.currentRound}` : "—"}
                  hint={`Utilization ${derived.utilization}%`}
                  accent="from-emerald-500/15"
                />
                <StatCard
                  icon={<FiClock />}
                  label="Round Start"
                  value={data ? formatDateTime(data.roundData.startTime) : "—"}
                  hint="UTC"
                />
                <StatCard
                  icon={<FiClock />}
                  label="Round End"
                  value={data ? formatDateTime(data.roundData.endTime) : "—"}
                  hint="UTC"
                />
                <StatCard
                  icon={<FiTrendingUp />}
                  label="Expected Current Round"
                  value={data ? `#${data.currentRound}` : "—"}
                  hint="Projected sync"
                />
              </div>
            </Section>

            <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <Section
                title="Supply & Staking"
                subtitle="Ready for staking integration"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <StatCard
                    icon={<FiTrendingUp />}
                    label="USDV Total Supply"
                    value={data ? `${data.dusdMinted.toFixed(3)} USDV` : "—"}
                    hint="On-chain metric"
                    accent="from-emerald-400/15"
                  />
                  <StatCard
                    icon={<FiPieChart />}
                    label="USDV Staked"
                    value={
                      data
                        ? `${(data.dusdMinted * 0.42).toFixed(3)} USDV`
                        : shimmer
                    }
                    hint="Placeholder · hook when ready"
                    accent="from-indigo-400/15"
                  />
                </div>
              </Section>

              <Section title="Collateral Details" subtitle="HYPE & KHype legs">
                <CollateralTable rows={derived.collateralRows} />
              </Section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VaultDashboard;
