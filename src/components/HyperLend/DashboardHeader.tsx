import React from "react"
import { motion } from "framer-motion"

interface TopNavProps {
    title?: string
    children?: React.ReactNode
}

const TopNav: React.FC<TopNavProps> = ({ title, children }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        {title && <h1 className="text-4xl font-bold">{title}</h1>}
        <div className="flex items-center gap-4">
            {children}
            <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-6 py-2 rounded-full border border-[#E6FFF6] text-[#E6FFF6] hover:bg-[#1A2323] transition"
            >
                Connect Wallet
            </motion.button>
        </div>
    </div>
)

export default TopNav
