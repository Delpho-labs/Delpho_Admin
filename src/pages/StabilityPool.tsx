import React, { useMemo } from "react";
import { FiActivity, FiAperture, FiBarChart2, FiLayers, FiShield } from "react-icons/fi";
import HomeSidebar from "../components/HomeSidebar";
import TopNav from "../components/TopNav";

type Metric = {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  accent?: string;
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
  rightContent?: React.ReactNode;
};

const SectionCard: React.FC<SectionProps> = ({ title, children, rightContent }) => (
  <div className="rounded-3xl border border-white/5 bg-[#0B1212] px-6 py-5 shadow-[0_15px_80px_-35px_rgba(0,0,0,0.45)]">
    <div className="mb-4 flex items-center justify-between">
      <div className="text-lg font-semibold text-white">{title}</div>
      {rightContent}
    </div>
    {children}
  </div>
);

const StatCard: React.FC<Metric> = ({ label, value, hint, icon, accent = "from-emerald-500/20" }) => (
  <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0F1515] via-[#0C1212] to-[#0A0F0F] p-4">
    <div className={`absolute inset-0 blur-3xl ${accent}`} aria-hidden />
    <div className="relative flex items-start justify-between gap-3">
      <div className="flex flex-col gap-1">
        <div className="text-sm text-[#94B0A8]">{label}</div>
        <div className="text-xl font-semibold text-white">{value}</div>
        {hint && <div className="text-xs text-[#7FA197]">{hint}</div>}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-emerald-300">
        {icon}
      </div>
    </div>
  </div>
);

const StabilityPool: React.FC = () => {
  // Placeholder values; replace with hook-based data when integrations are ready.
  const mockData = {
    hypeDeposits: 128_400.32,
    khypeDeposits: 97_240.11,
    usdvMinted: 210_550.87,
    currentLtv: 54.2,
    usdvStaked: 120_300.5,
  };

  const metrics = useMemo<Metric[]>(() => [
    {
      label: "Collateral deposits · Hype",
      value: `${mockData.hypeDeposits.toLocaleString(undefined, { maximumFractionDigits: 2 })} HYPE`,
      hint: "Liquidity securing USDV",
      icon: <FiLayers />,
      accent: "from-emerald-500/15",
    },
    {
      label: "Collateral deposits · KHype",
      value: `${mockData.khypeDeposits.toLocaleString(undefined, { maximumFractionDigits: 2 })} KHYPE`,
      hint: "Delta-hedged leg",
      icon: <FiShield />,
      accent: "from-cyan-500/15",
    },
    {
      label: "USDV Minted",
      value: `${mockData.usdvMinted.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDV`,
      hint: "Outstanding supply",
      icon: <FiActivity />,
      accent: "from-blue-500/15",
    },
    {
      label: "Current LTV",
      value: `${mockData.currentLtv.toFixed(2)}%`,
      hint: "Loan-to-value",
      icon: <FiBarChart2 />,
      accent: "from-purple-500/15",
    },
    {
      label: "USDV Staked",
      value: `${mockData.usdvStaked.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDV`,
      hint: "Ready for SP rewards",
      icon: <FiAperture />,
      accent: "from-indigo-500/15",
    },
  ], [mockData]);

  return (
    <div className="min-h-screen bg-[#0A1010] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(38,255,212,0.08),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(88,139,255,0.08),transparent_30%)]" />
      </div>

      <div className="relative flex">
        <HomeSidebar />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-10">
          <TopNav title="Stability Pool" />

          <SectionCard
            title="Stability Pool Metrics"
            rightContent={
              <div className="flex items-center gap-2 text-xs text-[#9BB5AE]">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Ready for on-chain hook
              </div>
            }
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {metrics.map((metric) => (
                <StatCard key={metric.label} {...metric} />
              ))}
            </div>
          </SectionCard>
        </main>
      </div>
    </div>
  );
};

export default StabilityPool;

