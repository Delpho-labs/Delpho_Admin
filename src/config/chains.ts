import { type Chain } from "viem"

export const hyperliquidTestnet = {
    id: 998,
    name: "Hyperliquid Testnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: { http: ["https://rpc.hyperliquid-testnet.xyz/evm"] },
    },
    blockExplorers: {
        default: {
            name: "Hyperliquid Explorer",
            url: "https://testnet.purrsec.com/",
        },
    },
} as const satisfies Chain

export const hyperliquidMainnet = {
    id: 999,
    name: "Hyperliquid Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: { http: ["https://rpc.hyperliquid.xyz/evm"] },
    },
    blockExplorers: {
        default: {
            name: "Hyperliquid Explorer",
            url: "https://purrsec.com/",
        },
    },
} as const satisfies Chain
