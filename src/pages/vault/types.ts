export interface CollateralRow {
    label: string
    hype: string
    khype: string
    tokenAddress?: string
    totalCollateral?: number
    bufferFunds?: number
    fundsForExecutor?: number
    availableForWithdraw?: number
    isSummary?: boolean
}

export interface SectionProps {
    title: string
    subtitle?: string
    children: React.ReactNode
}

export interface StatCardProps {
    icon: React.ReactNode
    label: string
    value: React.ReactNode
    hint?: React.ReactNode
    accent?: string
}

export interface TokenDetail {
    name: string
    symbol: string
    address: string
    totalCollateral: number
    bufferFunds: number
    fundsForExecutor: number
    availableForWithdraw: number
    withdrawalRequests: number
    decimals: number
}

export interface CollateralTableProps {
    tokenDetails: TokenDetail[]
}
