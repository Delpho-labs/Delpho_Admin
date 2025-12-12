import React from "react"
import { motion } from "framer-motion"
import MetricCard from "./MetricCard"
import { useHyperLendData } from "../../hooks/useHyperLendData"

const MetricsSection: React.FC = () => {
    const { data, isLoading, error } = useHyperLendData()

    if (isLoading) {
        return (
            <div className="bg-[#0B1212] rounded-2xl p-6 md:p-8 mb-8 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E6FFF6]"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-[#0B1212] rounded-2xl p-6 md:p-8 mb-8 text-red-400">
                Error loading HyperLend data: {error instanceof Error ? error.message : "Unknown error"}
            </div>
        )
    }

    if (!data) {
        return (
            <div className="bg-[#0B1212] rounded-2xl p-6 md:p-8 mb-8 text-[#A3B8B0]">
                Connect your wallet to view HyperLend metrics
            </div>
        )
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    const formatPercentage = (value: number) => {
        return `${value.toFixed(2)}%`
    }

    const healthFactorColor = data.healthFactor > 1.5 ? "#00FFB2" : data.healthFactor > 1 ? "#FFA500" : "#FF4B4B"

    const healthFactorPercentage = Math.min(data.healthFactor * 20, 100)

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#0B1212] rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-stretch relative overflow-hidden w-full"
        >
            <div className="flex-1 w-full">
                <div className="text-[#A3B8B0] mb-2 flex items-center gap-2">
                    <span>HyperLend Account Overview</span>
                </div>
                <h2 className="text-3xl font-bold mb-6">Your Position</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    <MetricCard title="Total Collateral" value={formatCurrency(data.totalCollateral)} />
                    <MetricCard title="Total Debt" value={formatCurrency(data.totalDebt)} />
                    <MetricCard title="Available to Borrow" value={formatCurrency(data.availableBorrows)} />
                    <MetricCard
                        title="Health Factor"
                        value={<span style={{ color: healthFactorColor }}>{data.healthFactor.toFixed(2)}</span>}
                    >
                        <div className="w-full h-2 bg-[#1A2323] rounded-full mt-2">
                            <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                    width: `${healthFactorPercentage}%`,
                                    backgroundColor: healthFactorColor,
                                }}
                            />
                        </div>
                    </MetricCard>
                </div>
            </div>
            {/* Right Card */}
            <div className="bg-[#101616] rounded-2xl p-6 min-w-[260px] flex flex-col gap-4 w-full max-w-xs shadow-md">
                <div>
                    <span className="text-xs text-[#A3B8B0]">Loan-to-Value (LTV)</span>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold">{formatPercentage(data.ltv)}</span>
                    </div>
                </div>
                <div>
                    <span className="text-xs text-[#A3B8B0]">Liquidation Threshold</span>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold">{formatPercentage(data.liquidationThreshold)}</span>
                    </div>
                </div>
            </div>
        </motion.section>
    )
}

export default MetricsSection
