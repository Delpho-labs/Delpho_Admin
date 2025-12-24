export interface Strategy {
    id: string
    address: string
    title: string
    subtitle: string
    description: string
    focus: string
    asset: string
    risk: "Low" | "Medium" | "High"
    strategyType: "Hyperlend" | "Sentiment"
}

export interface HyperLiquidRow {
    coin: string
    size: string
    entryPrice: string
    markPrice: string
    pnl: string
}

export type RebalancingType = "upside" | "downside" | null

export type ActionType = "rebalance" | "close"

export interface ProcessStep {
    id: string
    label: string
    status: "pending" | "processing" | "completed" | "error"
}
