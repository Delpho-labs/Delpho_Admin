import React from "react"
import { FiInfo } from "react-icons/fi"
import type { CollateralTableProps, TokenDetail } from "../types"
type MetricKey = keyof Omit<TokenDetail, "address" | "symbol"> | string

const CollateralTable: React.FC<CollateralTableProps> = ({ tokenDetails }) => {
    const metrics = [
        {
            key: "bufferFunds",
            label: "Buffer Funds",
            color: "text-blue-200",
            tooltip: "Global Buffer Funds",
        },
        {
            key: "fundsForExecutor",
            label: "Funds for executor",
            color: "text-purple-200",
            tooltip: "Funds allocated for executor operations",
        },
        {
            key: "availableForWithdraw",
            label: "Available for withdraw requests",
            color: "text-cyan-200",
            tooltip: "Funds available for withdraw requests",
        },
        {
            key: "withdrawalRequests",
            label: "Withdraw Requests",
            color: "text-amber-200",
            tooltip: "Withdraw requests for current round",
        },
        {
            key: "totalCollateral",
            label: "Total Collateral",
            color: "text-emerald-200",
            tooltip: "Total collateral deposited",
        },
    ]

    const getMetricValue = (token: TokenDetail, key: MetricKey): number => {
        return token[key as keyof TokenDetail] as number
    }

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-white/5">
                {/* Table Header */}
                <div
                    className="bg-white/5 px-4 py-3 text-xs uppercase tracking-wide text-[#8CA29A]"
                    style={{
                        display: "grid",
                        gridTemplateColumns: `200px repeat(${tokenDetails.length}, 1fr)`,
                        gap: "1rem",
                    }}
                >
                    <span>Metric</span>
                    {tokenDetails.map((token) => (
                        <div key={token.address} className="text-center">
                            <span className="block font-medium">{token.symbol}</span>
                        </div>
                    ))}
                </div>

                {/* Table Body */}
                <div className="divide-y divide-white/5">
                    {metrics.map((metric) => (
                        <div
                            key={metric.key}
                            className="group items-center bg-white/[0.02] px-4 py-3 text-sm text-white hover:bg-white/[0.04] transition-colors"
                            style={{
                                display: "grid",
                                gridTemplateColumns: `200px repeat(${tokenDetails.length}, 1fr)`,
                                gap: "1rem",
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-[#C7D7D2]">{metric.label}</span>
                                <div className="relative">
                                    <FiInfo className="text-xs text-[#8CA29A] opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
                                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 group-hover:block">
                                        <div className="whitespace-nowrap rounded bg-[#1A2525] px-2 py-1 text-xs text-[#C7D7D2] border border-white/10">
                                            {metric.tooltip}
                                            <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1A2525]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {tokenDetails.map((token) => (
                                <div key={`${token.address}-${metric.key}`} className="text-center">
                                    <span className={`font-medium ${metric.color}`}>
                                        {getMetricValue(token, metric.key).toFixed(3)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CollateralTable
