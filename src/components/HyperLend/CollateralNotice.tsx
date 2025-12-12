import React from "react"
import { motion } from "framer-motion"

const CollateralNotice: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#101616] rounded-xl p-4 mb-8 flex items-center justify-between"
    >
        {children}
    </motion.div>
)

export default CollateralNotice
