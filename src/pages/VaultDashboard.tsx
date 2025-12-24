import React, { useEffect, useMemo } from "react"
import { FiActivity, FiClock, FiPieChart, FiTrendingUp, FiDollarSign, FiPercent } from "react-icons/fi"
import HomeSidebar from "../components/HomeSidebar"
import TopNav from "../components/TopNav"
import Section from "./vault/components/Section"
import StatCard from "./vault/components/StatCard"
import CollateralTable from "./vault/components/CollateralTable"
import { useVaultData } from "../hooks/useVaultData"
import { getAssetInfo, getTokenPrice } from "../utils/helper"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../store"
import { setVaultData } from "../features/vaultSlice"

const formatDateTime = (timestamp?: number) => {
    if (!timestamp) return "—"
    return new Date(timestamp * 1000).toLocaleString()
}

const VaultDashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const vaultState = useSelector((state: RootState) => state.vault)
    const { data, isLoading, error } = useVaultData()

    useEffect(() => {
        if (data) {
            dispatch(setVaultData(data))
        }
    }, [data, dispatch])

    const vaultData = vaultState.data

    // State to store token prices
    const [tokenPrices, setTokenPrices] = React.useState<{ [address: string]: number }>({})

    // Fetch token prices when vault data is available
    useEffect(() => {
        const fetchTokenPrices = async () => {
            if (!vaultData) return

            const prices: { [address: string]: number } = {}
            for (const token of vaultData.tokensData) {
                try {
                    const price = await getTokenPrice(token.address)
                    prices[token.address] = price
                } catch (error) {
                    console.error(`Failed to fetch price for token ${token.address}:`, error)
                    prices[token.address] = 0
                }
            }
            setTokenPrices(prices)
        }

        fetchTokenPrices()
    }, [vaultData])

    // Calculate total collateral value in USD
    const calculateTotalCollateralValue = () => {
        if (!vaultData || Object.keys(tokenPrices).length === 0) return 0

        return vaultData.tokensData.reduce((sum, token) => {
            const price = tokenPrices[token.address] || 0
            return sum + token.totalCollateral * price
        }, 0)
    }

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return "$0.00"
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    const totalCollateralValue = calculateTotalCollateralValue()
    const ltvRatio =
        vaultData && totalCollateralValue > 0 ? ((vaultData.dusdMinted / totalCollateralValue) * 100).toFixed(2) : "0.00"

    const derived = useMemo(() => {
        if (!vaultData) {
            return {
                totalBorrowed: 0,
                tokenDetails: [],
            }
        }

        const totalBorrowed = vaultData.dusdMinted

        // Create token details for the display
        const tokenDetails = vaultData.tokensData.map((token) => {
            const assetInfo = getAssetInfo(token.address)
            return {
                name: assetInfo.name,
                symbol: assetInfo.symbol,
                address: token.address,
                totalCollateral: token.totalCollateral,
                bufferFunds: token.bufferFunds,
                fundsForExecutor: token.fundsForExecutor,
                availableForWithdraw: token.availableForWithdrawRequest,
                withdrawalRequests: token.totalWithdrawalRequests,
                decimals: assetInfo.decimals,
            }
        })

        return {
            totalBorrowed,
            tokenDetails,
        }
    }, [vaultData])

    const shimmer = <div className="h-5 w-24 animate-pulse rounded bg-white/10" aria-hidden />

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
                                <div key={idx} className="h-28 animate-pulse rounded-2xl bg-white/5" />
                            ))}
                        </div>
                    )}

                    <div className="space-y-6">
                        <Section title="Round Details">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <StatCard
                                    icon={<FiActivity />}
                                    label="Current Round"
                                    value={vaultData ? `#${vaultData.currentRound}` : "—"}
                                    accent="from-emerald-500/15"
                                />
                                <StatCard
                                    icon={<FiClock />}
                                    label="Round Start"
                                    value={vaultData ? formatDateTime(vaultData.roundData.startTime) : "—"}
                                    hint="UTC"
                                />
                                <StatCard
                                    icon={<FiClock />}
                                    label="Round End"
                                    value={vaultData ? formatDateTime(vaultData.roundData.endTime) : "—"}
                                    hint="UTC"
                                />
                                <StatCard
                                    icon={<FiTrendingUp />}
                                    label="Expected Current Round"
                                    value={vaultData ? `#${vaultData.calculatedRound}` : "—"}
                                />
                            </div>
                        </Section>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <Section title="Supply & Staking">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <StatCard
                                        icon={<FiTrendingUp />}
                                        label="USDV Total Supply"
                                        value={vaultData ? `${vaultData.dusdMinted.toFixed(3)} USDV` : "—"}
                                        accent="from-emerald-400/15"
                                    />
                                    <StatCard
                                        icon={<FiPieChart />}
                                        label="USDV Staked"
                                        value={vaultData ? `${vaultData.totalStaked.toFixed(3)} USDV` : shimmer}
                                        accent="from-indigo-400/15"
                                    />
                                    <StatCard
                                        icon={<FiDollarSign />}
                                        label="Total Collateral Value"
                                        value={
                                            Object.keys(tokenPrices).length > 0 ? formatCurrency(totalCollateralValue) : shimmer
                                        }
                                        accent="from-blue-400/15"
                                    />
                                    <StatCard
                                        icon={<FiPercent />}
                                        label="LTV Ratio"
                                        value={Object.keys(tokenPrices).length > 0 ? `${ltvRatio}%` : shimmer}
                                        accent="from-purple-400/15"
                                    />
                                </div>
                            </Section>
                        </div>

                        <Section title="Collateral Details" subtitle={`${derived.tokenDetails.length} supported tokens`}>
                            <CollateralTable tokenDetails={derived.tokenDetails} />
                        </Section>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default VaultDashboard
