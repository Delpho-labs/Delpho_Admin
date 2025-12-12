import React from "react"
import { ConnectWalletButton } from "./buttons/ConnectWalletButton"

interface TopNavProps {
    title?: string
    children?: React.ReactNode
}

const TopNav: React.FC<TopNavProps> = ({ title, children }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        {title && <h1 className="text-4xl font-bold">{title}</h1>}
        <div className="flex items-center gap-4">
            {children}
            <ConnectWalletButton />
        </div>
    </div>
)

export default TopNav
