import type { Strategy } from "./types"

export const STRATEGIES: Strategy[] = [
    {
        id: "hype-sentiment",
        title: "Hype - Sentiment Strategy",
        subtitle: "Signals-driven directional exposure",
        description: "Leverages real-time social sentiment and HyperLiquid perp liquidity for fast directional positioning.",
        focus: "BTC Perp",
        asset: "BTC",
        risk: "Medium",
    },
    {
        id: "hype-hyperlend",
        title: "Hype - Hyperlend Strategy",
        subtitle: "Capital-efficient looping",
        description: "Optimizes LTV by cycling collateral between HyperLend and HyperLiquid execution.",
        focus: "ETH Loop",
        asset: "ETH",
        risk: "Low",
    },
    {
        id: "khype-sentiment",
        title: "KHype - Sentiment Strategy",
        subtitle: "Multi-venue hedged sentiment",
        description: "Combines cross-venue hedges with momentum execution for lower variance.",
        focus: "Basket",
        asset: "SOL",
        risk: "Medium",
    },
    {
        id: "khype-hyperlend",
        title: "KHype - Hyperlend Strategy",
        subtitle: "Delta-neutral carry",
        description: "Deploys vault assets into carry trades while keeping health factor targets intact.",
        focus: "Stable Carry",
        asset: "USDC",
        risk: "Low",
    },
]
