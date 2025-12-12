import React from "react"
import type { StatCardProps } from "../types"

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, hint, accent = "from-emerald-500/20" }) => (
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

export default StatCard
