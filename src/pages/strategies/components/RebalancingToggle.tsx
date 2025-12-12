import React from "react"
import type { RebalancingType } from "../types"

interface RebalancingToggleProps {
    selectedType: RebalancingType
    onTypeChange: (type: RebalancingType) => void
}

export const RebalancingToggle: React.FC<RebalancingToggleProps> = ({ selectedType, onTypeChange }) => {
    return (
        <div className="rounded-2xl border border-[#1A2323] bg-[#0D1515] p-5">
            <div className="flex gap-2">
                <button
                    onClick={() => onTypeChange("upside")}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                        selectedType === "upside"
                            ? "bg-[#00FFB2] text-[#101616] shadow-[0_0_20px_rgba(0,255,178,0.3)] font-semibold"
                            : "bg-white/5 text-[#A3B8B0] hover:bg-white/10 border border-[#1A2323]"
                    }`}
                >
                    Upside Rebalancing Needed
                </button>
                <button
                    onClick={() => onTypeChange("downside")}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                        selectedType === "downside"
                            ? "bg-[#00FFB2] text-[#101616] shadow-[0_0_20px_rgba(0,255,178,0.3)] font-semibold"
                            : "bg-white/5 text-[#A3B8B0] hover:bg-white/10 border border-[#1A2323]"
                    }`}
                >
                    Downside Rebalancing Needed
                </button>
            </div>
        </div>
    )
}
