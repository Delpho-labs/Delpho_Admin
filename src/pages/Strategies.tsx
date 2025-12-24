import React, { useMemo, useState, useEffect } from "react"
import HomeSidebar from "../components/HomeSidebar"
import TopNav from "../components/TopNav"
import { STRATEGIES } from "./strategies/constants"
import { transformPositionsTable } from "./strategies/utils/transformers"
import { RebalancingToggle } from "./strategies/components/RebalancingToggle"
import { ActionButtons } from "./strategies/components/ActionButtons"
import { ProcessingModal } from "./strategies/components/ProcessingModal"
import { CompactMetric } from "./strategies/components/CompactMetric"
import { MetricTile } from "./strategies/components/MetricTile"
import type { ActionType, RebalancingType } from "./strategies/types"
import { useStrategyDetails } from "../hooks/useStrategyDetails"
import type { ClearinghouseState } from "../utils/hyperliquid"
import { checkForRebalance } from "../utils/rebalance"

const Strategies: React.FC = () => {
    const [selectedStrategyId, setSelectedStrategyId] = useState(STRATEGIES[0].id)
    const [selectedRebalancingType, setSelectedRebalancingType] = useState<RebalancingType>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalActionType, setModalActionType] = useState<ActionType>("rebalance")
    const [modalRebalancingType, setModalRebalancingType] = useState<RebalancingType>(null)
    const [isCheckingRebalance, setIsCheckingRebalance] = useState(false)

    // Find the selected strategy
    const selectedStrategy = useMemo(
        () => STRATEGIES.find((strategy) => strategy.id === selectedStrategyId) || null,
        [selectedStrategyId]
    )

    // Use the unified hook for strategy details
    const strategyDetails = useStrategyDetails(selectedStrategy)

    // Check for rebalancing needs when strategy changes or data updates
    useEffect(() => {
        const checkRebalancing = async () => {
            if (!selectedStrategy?.address) return

            setIsCheckingRebalance(true)
            try {
                const result = await checkForRebalance(selectedStrategy.address)

                if (result.needsRebalancing) {
                    if (result.rebalancingType === "UPSIDE") {
                        setSelectedRebalancingType("upside")
                    } else if (result.rebalancingType === "DOWNSIDE") {
                        setSelectedRebalancingType("downside")
                    } else {
                        setSelectedRebalancingType(null)
                    }
                } else {
                    setSelectedRebalancingType(null)
                }
            } catch (error) {
                console.error("Error checking rebalance:", error)
                setSelectedRebalancingType(null)
            } finally {
                setIsCheckingRebalance(false)
            }
        }

        checkRebalancing()
    }, [selectedStrategy?.address, strategyDetails])

    const hyperLendData = useMemo(() => {
        if (!strategyDetails) return null
        console.log(strategyDetails, "strategyDetails")
        return {
            totalCollateral: strategyDetails.metrics?.totalCollateral,
            totalDebt: strategyDetails.metrics?.totalDebt,
            availableBorrows: strategyDetails.metrics?.availableBorrows,
            healthFactor: strategyDetails.metrics?.healthFactor,
            ltv: strategyDetails.metrics?.ltv,
            liquidationThreshold: strategyDetails.metrics?.liquidationThreshold,
        }
    }, [strategyDetails])

    const hyperliquidData = useMemo(() => {
        if (!strategyDetails) return { positions: [], loading: false, error: null, fetchCompleteState: () => {} }
        return strategyDetails.hyperliquidData || { positions: [], loading: false, error: null, fetchCompleteState: () => {} }
    }, [strategyDetails])

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return "$0.00"
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    const formatPercent = (value?: number) => {
        if (value === undefined || value === null) return "0.00%"
        return `${value.toFixed(2)}%`
    }

    const handleRebalance = () => {
        if (!selectedRebalancingType) return

        setModalActionType("rebalance")
        setModalRebalancingType(selectedRebalancingType)
        setIsModalOpen(true)
    }

    const handleCloseStrategy = () => {
        setModalActionType("close")
        setModalRebalancingType(null)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setModalActionType("rebalance")
        setModalRebalancingType(null)
    }

    const canRebalance = selectedRebalancingType !== null

    // Transform positions for table display
    const hyperLiquidRows = useMemo(
        () => transformPositionsTable(hyperliquidData.positions as ClearinghouseState),
        [hyperliquidData.positions]
    )

    return (
        <div className="min-h-screen flex bg-[#101616] text-[#E6FFF6]">
            <HomeSidebar />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <TopNav title="Strategies" />

                <div className="space-y-8">
                    <section className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <p className="text-sm uppercase tracking-wide text-[#7E8F89]">Strategy Shelf</p>
                                <h2 className="text-2xl font-semibold">Active Programs</h2>
                            </div>
                            <span className="text-sm text-[#A3B8B0]">{STRATEGIES.length} curated strategies</span>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {STRATEGIES.map((strategy) => {
                                const isSelected = strategy.id === selectedStrategyId
                                return (
                                    <button
                                        key={strategy.id}
                                        className={`text-left rounded-2xl border px-5 py-4 transition-all cursor-pointer ${
                                            isSelected
                                                ? "border-[#00FFB2] bg-gradient-to-br from-[#132020] to-[#0B1515] shadow-[0_0_20px_rgba(0,255,178,0.2)]"
                                                : "border-[#1A2323] bg-[#0D1515] hover:border-[#00FFB2]/40 hover:bg-[#0F1717]"
                                        }`}
                                        onClick={() => setSelectedStrategyId(strategy.id)}
                                    >
                                        <p className="text-lg font-semibold truncate">{strategy.title}</p>
                                        <p className="text-sm text-[#A3B8B0] mt-1">{strategy.strategyType}</p>
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="bg-[#0B1212] rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold">Position from HyperLiquid</h3>
                                {hyperliquidData.loading && <span className="text-sm text-[#A3B8B0]">Refreshing…</span>}
                            </div>

                            {hyperliquidData.error && (
                                <div className="mb-4 rounded-xl bg-red-900/40 p-3 text-sm text-red-200">
                                    {hyperliquidData.error}
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
                                                <td colSpan={5} className="px-4 py-6 text-center text-[#A3B8B0]">
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
                                <h3 className="text-xl font-semibold">
                                    Position from {selectedStrategy?.strategyType || "Strategy"}
                                </h3>
                                {strategyDetails?.isLoading && <span className="text-sm text-[#A3B8B0]">Loading…</span>}
                            </div>

                            {strategyDetails?.error && (
                                <div className="rounded-xl bg-red-900/40 p-3 text-sm text-red-200">{strategyDetails.error}</div>
                            )}

                            <div className="rounded-2xl border border-[#1A2323] p-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <CompactMetric
                                        label="Total Collateral"
                                        value={formatCurrency(hyperLendData?.totalCollateral)}
                                    />

                                    {strategyDetails?.strategyType === "Hyperlend" && strategyDetails.metrics && (
                                        <>
                                            <CompactMetric
                                                label="Available to Borrow"
                                                value={formatCurrency(hyperLendData?.availableBorrows)}
                                            />
                                        </>
                                    )}
                                    <CompactMetric label="Total Debt / Minted" value={formatCurrency(hyperLendData?.totalDebt)} />

                                    <CompactMetric
                                        label="Health Factor"
                                        value={
                                            hyperLendData?.healthFactor !== undefined
                                                ? hyperLendData.healthFactor.toFixed(4)
                                                : "0.0000"
                                        }
                                        highlight
                                    />
                                    <CompactMetric label="LTV" value={formatPercent(hyperLendData?.ltv)} />
                                    <CompactMetric
                                        label="Liq. Threshold"
                                        value={formatPercent(hyperLendData?.liquidationThreshold)}
                                    />

                                    {strategyDetails?.strategyType === "Sentiment" && strategyDetails.metrics && (
                                        <>
                                            <CompactMetric
                                                label="Leverage"
                                                value={
                                                    strategyDetails.metrics.leverage
                                                        ? `${strategyDetails.metrics.leverage.toFixed(2)}x`
                                                        : "0.00x"
                                                }
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-[#0B1212] rounded-3xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Rebalancing Status</h3>
                            {isCheckingRebalance && <span className="text-sm text-[#A3B8B0]">Checking...</span>}
                        </div>
                        <RebalancingToggle
                            selectedType={selectedRebalancingType}
                            onTypeChange={() => {}} // Make unclickable
                            disabled={true}
                        />
                        <ActionButtons
                            onRebalance={handleRebalance}
                            onCloseStrategy={handleCloseStrategy}
                            rebalanceDisabled={!canRebalance}
                            closeDisabled={false}
                        />
                    </section>

                    <section className="grid gap-4 md:grid-cols-3">
                        <MetricTile label="All Supplied TVL" value={formatCurrency(hyperLendData?.totalCollateral)} />
                        <MetricTile label="Total Minted USDV" value={formatCurrency(hyperLendData?.totalDebt)} />
                        <MetricTile
                            label="Utilization"
                            value={
                                hyperLendData?.totalCollateral && hyperLendData.totalCollateral > 0
                                    ? `${(((hyperLendData.totalDebt || 0) / hyperLendData.totalCollateral) * 100).toFixed(2)}%`
                                    : "0.00%"
                            }
                        />
                    </section>
                </div>

                <ProcessingModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    actionType={modalActionType}
                    rebalancingType={modalRebalancingType}
                    strategyId={selectedStrategyId}
                    strategyAddress={selectedStrategy!.address}
                />
            </main>
        </div>
    )
}

export default Strategies
