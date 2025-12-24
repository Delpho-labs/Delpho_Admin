import React from "react"

type RebalancingType = "upside" | "downside" | null

interface RebalancingToggleProps {
    selectedType: RebalancingType
    onTypeChange: (type: RebalancingType) => void
    disabled?: boolean
}

export const RebalancingToggle: React.FC<RebalancingToggleProps> = ({ selectedType, onTypeChange, disabled = false }) => {
    return (
        <div className="space-y-3">
            <p className="text-sm text-[#A3B8B0]">
                {selectedType === null
                    ? "No rebalancing required"
                    : `${selectedType === "upside" ? "Upside" : "Downside"} rebalancing detected`}
            </p>

            <div className="inline-flex rounded-xl border border-[#1A2323] bg-[#0D1515] p-1">
                <button
                    onClick={() => !disabled && onTypeChange("upside")}
                    disabled={disabled}
                    className={`px-4 py-2 text-sm rounded-lg transition-all ${
                        selectedType === "upside"
                            ? "bg-[#00FFB2] text-[#0D1515] font-semibold shadow-lg"
                            : disabled
                              ? "text-[#3A4A4A] cursor-not-allowed"
                              : "text-[#A3B8B0] hover:text-[#E6FFF6] cursor-pointer"
                    }`}
                >
                    Upside
                </button>
                <button
                    onClick={() => !disabled && onTypeChange("downside")}
                    disabled={disabled}
                    className={`px-4 py-2 text-sm rounded-lg transition-all ${
                        selectedType === "downside"
                            ? "bg-[#00FFB2] text-[#0D1515] font-semibold shadow-lg"
                            : disabled
                              ? "text-[#3A4A4A] cursor-not-allowed"
                              : "text-[#A3B8B0] hover:text-[#E6FFF6] cursor-pointer"
                    }`}
                >
                    Downside
                </button>
                <button
                    onClick={() => !disabled && onTypeChange(null)}
                    disabled={disabled}
                    className={`px-4 py-2 text-sm rounded-lg transition-all ${
                        selectedType === null
                            ? "bg-[#00FFB2] text-[#0D1515] font-semibold shadow-lg"
                            : disabled
                              ? "text-[#3A4A4A] cursor-not-allowed"
                              : "text-[#A3B8B0] hover:text-[#E6FFF6] cursor-pointer"
                    }`}
                >
                    None
                </button>
            </div>
        </div>
    )
}
