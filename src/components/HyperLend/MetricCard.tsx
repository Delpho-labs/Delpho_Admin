import React from "react"
import { motion } from "framer-motion"

interface MetricCardProps {
    title: string
    value: React.ReactNode
    subvalue?: React.ReactNode
    color?: string
    children?: React.ReactNode
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subvalue, color, children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
                scale: 1.04,
                boxShadow: "0 4px 24px 0 rgba(0,255,178,0.08)",
            }}
            transition={{ duration: 0.3 }}
            className={`bg-[#101616] rounded-2xl p-6 flex flex-col items-start min-w-[180px] w-full shadow-sm`}
            style={color ? { borderColor: color, borderWidth: 2, borderStyle: "solid" } : {}}
        >
            <span className="text-sm text-[#A3B8B0] mb-1">{title}</span>
            <span className="text-3xl font-bold" style={color ? { color } : {}}>
                {value}
            </span>
            {subvalue && (
                <span className="text-xs mt-1" style={color ? { color } : {}}>
                    {subvalue}
                </span>
            )}
            {children}
        </motion.div>
    )
}

export default MetricCard
