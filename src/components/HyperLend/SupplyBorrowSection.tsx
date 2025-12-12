import React from "react"
import { motion } from "framer-motion"

interface SupplyBorrowSectionProps {
    suppliedText: React.ReactNode
    borrowedText: React.ReactNode
}

const SupplyBorrowSection: React.FC<SupplyBorrowSectionProps> = ({ suppliedText, borrowedText }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#101616] rounded-xl p-6"
        >
            <h3 className="text-xl font-bold mb-2">You Supplied</h3>
            <div className="text-[#A3B8B0]">{suppliedText}</div>
        </motion.div>
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#101616] rounded-xl p-6"
        >
            <h3 className="text-xl font-bold mb-2">
                You Borrowed <span className="ml-2 text-xs bg-[#1A2323] px-2 py-1 rounded-full">E-Mode: OFF</span>
            </h3>
            <div className="text-[#A3B8B0]">{borrowedText}</div>
        </motion.div>
    </div>
)

export default SupplyBorrowSection
