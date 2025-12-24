import React, { useMemo } from "react"
import { FiActivity, FiAperture, FiBarChart2, FiLayers, FiShield } from "react-icons/fi"
import HomeSidebar from "../components/HomeSidebar"
import TopNav from "../components/TopNav"
import { useUserData } from "../hooks/useUserData"
import { useAccount } from "wagmi"
import { formatUnits } from "viem"

type Metric = {
    label: string
    value: string
    hint?: string
    icon: React.ReactNode
    accent?: string
}

type SectionProps = {
    title: string
    children: React.ReactNode
    rightContent?: React.ReactNode
}

const SectionCard: React.FC<SectionProps> = ({ title, children, rightContent }) => (
    <div className="rounded-3xl border border-white/5 bg-[#0B1212] px-6 py-5 shadow-[0_15px_80px_-35px_rgba(0,0,0,0.45)]">
        <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-white">{title}</div>
            {rightContent}
        </div>
        {children}
    </div>
)

const StatCard: React.FC<Metric> = ({ label, value, hint, icon, accent = "from-emerald-500/20" }) => (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0F1515] via-[#0C1212] to-[#0A0F0F] p-4">
        <div className={`absolute inset-0 blur-3xl ${accent}`} aria-hidden />
        <div className="relative flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
                <div className="text-sm text-[#94B0A8]">{label}</div>
                <div className="text-xl font-semibold text-white">{value}</div>
                {hint && <div className="text-xs text-[#7FA197]">{hint}</div>}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-emerald-300">{icon}</div>
        </div>
    </div>
)

const StabilityPool: React.FC = () => {
    const { address } = useAccount()
    const { userPosition, isLoading, error } = useUserData(address || "0x0")

    // Helper function to format with more decimals for small amounts
    const formatAmount = useMemo(
        () =>
            (value: bigint, decimals: number = 18) => {
                const num = Number(formatUnits(value, decimals))
                if (num === 0) return "0"
                if (num < 0.0001) return "< 0.0001"
                if (num < 1) return num.toFixed(6)
                if (num < 1000) return num.toFixed(4)
                return num.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })
            },
        []
    )

    // Get all assets (including those with 0 amount)
    const allAssets = useMemo(() => {
        if (!userPosition) return []

        return userPosition.depositedAssetsName
            .map((name, index) => ({
                name,
                address: userPosition.depositedAssets[index],
                amount: userPosition.depositedAmounts[index],
                value: userPosition.depositedAmountUsd[index],
                available: userPosition.availableForWithdrawal[index],
                hasDeposit: userPosition.depositedAmounts[index] > 0n,
            }))
            .sort((a, b) => {
                // Sort by amount (highest first), then alphabetically
                if (a.amount > b.amount) return -1
                if (a.amount < b.amount) return 1
                return a.name.localeCompare(b.name)
            })
    }, [userPosition])

    // Count assets with deposits
    const assetsWithDepositsCount = useMemo(() => {
        return allAssets.filter((asset) => asset.hasDeposit).length
    }, [allAssets])

    const metrics = useMemo<Metric[]>(() => {
        if (isLoading) {
            return [
                {
                    label: "Collateral deposits",
                    value: "Loading...",
                    hint: "Fetching data...",
                    icon: <FiLayers />,
                    accent: "from-emerald-500/15",
                },
                {
                    label: "Current Debt",
                    value: "Loading...",
                    hint: "Fetching data...",
                    icon: <FiShield />,
                    accent: "from-cyan-500/15",
                },
                {
                    label: "Borrowed Amount",
                    value: "Loading...",
                    hint: "Fetching data...",
                    icon: <FiActivity />,
                    accent: "from-blue-500/15",
                },
                {
                    label: "Current LTV",
                    value: "Loading...",
                    hint: "Loan-to-value",
                    icon: <FiBarChart2 />,
                    accent: "from-purple-500/15",
                },
                {
                    label: "Staked Balance",
                    value: "Loading...",
                    hint: "Ready for SP rewards",
                    icon: <FiAperture />,
                    accent: "from-indigo-500/15",
                },
            ]
        }

        if (error || !userPosition) {
            const errorMessage = error?.message || "No position found"
            return [
                {
                    label: "Error",
                    value: "Data unavailable",
                    hint: errorMessage.substring(0, 50) + "...",
                    icon: <FiLayers />,
                    accent: "from-red-500/15",
                },
                {
                    label: "Current Debt",
                    value: "N/A",
                    hint: "Check connection",
                    icon: <FiShield />,
                    accent: "from-red-500/15",
                },
                {
                    label: "Borrowed Amount",
                    value: "N/A",
                    hint: "Check connection",
                    icon: <FiActivity />,
                    accent: "from-red-500/15",
                },
                {
                    label: "Current LTV",
                    value: "N/A",
                    hint: "Loan-to-value",
                    icon: <FiBarChart2 />,
                    accent: "from-red-500/15",
                },
                {
                    label: "Staked Balance",
                    value: "N/A",
                    hint: "Ready for SP rewards",
                    icon: <FiAperture />,
                    accent: "from-indigo-500/15",
                },
            ]
        }

        const totalCollateral = userPosition.totalCollateralValueUsd
        const currentDebt = userPosition.currentDebt
        const borrowedAmount = userPosition.borrowedAmount
        const currentLtv = userPosition.currentLtv
        const stakedBalance = userPosition.stakedBalance

        return [
            {
                label: "Total Collateral Value",
                value: `$${totalCollateral}`,
                hint:
                    assetsWithDepositsCount > 0
                        ? `${assetsWithDepositsCount} of ${allAssets.length} assets deposited`
                        : `No deposits `,
                icon: <FiLayers />,
                accent: assetsWithDepositsCount > 0 ? "from-emerald-500/15" : "from-gray-500/15",
            },
            {
                label: "Current Debt",
                value: `$${currentDebt}`,
                hint: userPosition.hasActiveLoan ? "Active loan" : "No active loan",
                icon: <FiShield />,
                accent: userPosition.hasActiveLoan ? "from-yellow-500/15" : "from-cyan-500/15",
            },
            {
                label: "Borrowed Amount",
                value: `$${borrowedAmount}`,
                hint: `Pending interest: $${userPosition.pendingInterest}`,
                icon: <FiActivity />,
                accent: "from-blue-500/15",
            },
            {
                label: "Current LTV",
                value: `${currentLtv}%`,
                hint: userPosition.isLtvHealthy ? "Healthy" : "At risk",
                icon: <FiBarChart2 />,
                accent: userPosition.isLtvHealthy ? "from-green-500/15" : "from-red-500/15",
            },
            {
                label: "Staked Balance",
                value: `${stakedBalance} USDV`,
                hint: userPosition.loanId ? `Loan ID: ${userPosition.loanId}` : "No active loan",
                icon: <FiAperture />,
                accent: "from-indigo-500/15",
            },
        ]
    }, [userPosition, isLoading, error, allAssets, assetsWithDepositsCount])

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

                    <SectionCard title="Stability Pool Metrics">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {metrics.map((metric) => (
                                <StatCard key={metric.label} {...metric} />
                            ))}
                        </div>

                        {!isLoading && userPosition && (
                            <div className="mt-6 rounded-xl border border-white/5 bg-[#0F1515] p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="text-sm font-medium text-[#94B0A8]">Deposited Assets</div>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {allAssets.map((asset, index) => (
                                        <div
                                            key={index}
                                            className={`rounded-lg p-3 ${asset.hasDeposit ? "bg-emerald-500/5 border border-emerald-500/10" : "bg-white/5"}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-white">{asset.name}</span>
                                                    {!asset.hasDeposit && <span className="text-xs text-[#7FA197]">(0)</span>}
                                                </div>
                                                <span
                                                    className={`text-sm font-medium ${asset.hasDeposit ? "text-emerald-300" : "text-[#7FA197]"}`}
                                                >
                                                    {formatAmount(asset.amount, 18)}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex justify-between text-xs text-[#7FA197]">
                                                <span>Value: ${Number(formatUnits(asset.value, 18)).toFixed(2)}</span>
                                                {asset.hasDeposit && <span>Available: {formatAmount(asset.available, 18)}</span>}
                                            </div>
                                            {asset.hasDeposit && (
                                                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
                                                    <div
                                                        className="h-full rounded-full bg-emerald-500/50"
                                                        style={{
                                                            width: `${Math.min((Number(asset.amount) / (Number(asset.amount) + Number(asset.available))) * 100, 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Show liquidation price if there's an active loan */}
                        {userPosition?.hasActiveLoan && userPosition.liquidationPrice > 0n && (
                            <div className="mt-6 rounded-xl border border-white/5 bg-[#0F1515] p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="text-sm font-medium text-[#94B0A8]">Liquidation Price</div>
                                    <div
                                        className={`text-sm font-medium ${userPosition.isLtvHealthy ? "text-green-400" : "text-orange-400"}`}
                                    >
                                        {userPosition.isLtvHealthy ? "Safe" : "Warning"}
                                    </div>
                                </div>
                                <div className="text-lg font-semibold text-white">${userPosition.liquidationPrice}</div>
                                <div className="mt-1 text-xs text-[#7FA197]">
                                    Your position will be at risk if the collateral value drops below this price
                                </div>
                            </div>
                        )}
                    </SectionCard>
                </main>
            </div>
        </div>
    )
}

export default StabilityPool
