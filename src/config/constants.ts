export const CORE_WRITER_ADDRESS = "0x3333333333333333333333333333333333333333" as const
export const EXECUTOR_ADDRESS = "0xBC5A1E5833daC6Ce165c26f44c8b51284DF53391" as const
export const DELPHO_VAULT_ADDRESS = "0x43a4747e3D47a4c60A6A5908fb26dC6EaCD6452B" as const
export const DELPHO_STABLE_ADDRESS = "0xa36c5FDE12f61C005fAA743bCbB4C6F4dA0fc60F" as const
export const HYPERLEND_POOL_ADDRESS = "0x00A89d7a5A02160f20150EbEA7a2b5E4879A1A8b" as const
export const DELPHO_CONFIG_PROVIDER_ADDRESS = "0x896cAecbAdE2279b6E74e6b901C0dAe8909BCAf5" as const
export const DELPHO_HYPER_LEND_EXECUTOR_ADDRESS = "0x083C2ef17d68aa225D239E99590De9FB77F3CB4e" as const
export const DELPHO_SENTIMENT_EXECUTOR_ADDRESS = "0x083C2ef17d68aa225D239E99590De9FB77F3CB4e" as const
export const DELPHO_ORACLE_ADDRESS = "0x9110CA80F856B5D79c66Bd743817C61163ABFcc6" as const
export const DELPHO_ROUTER_ADDRESS = "0xfC732Dc642aA2473878AcFA7cEB242cEAD24F11f" as const
export const DELPHO_STABILITY_POOL_ADDRESS = "0xecfC01A40fc83D6edD25aD5d0b35EEB857AA97d6" as const
export const DELPHO_STAKER_ADDRESS = "0x59C9b36a5f8bf3bEec221c696a852556F894b11D" as const
export const DELPHO_VAULT_LENS_ADDRESS = "0xa6A8669544AEe3DE8D6b7372225bD107cF1A8FFe" as const
export const SENTIMENT_LENS_ADDRESS = "0x9700750001dDD7C4542684baC66C64D74fA833c0" as const
export const SENTIMENT_POOL_ADDRESS = "0x36BFD6b40e2c9BbCfD36a6B1F1Aa65974f4fFA5D" as const
export const SENTIMENT_RISK_POOL_ADDRESS = "0xd22dE451Ba71fA6F06C65962649ba4E2Aea10863" as const

export const WST_HYPE = "0x94e8396e0869c9F2200760aF0621aFd240E1CF38" as const
export const USDT = "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb" as const
export const W_HYPE = "0x5555555555555555555555555555555555555555" as const
export const K_HYPE = "0xfD739d4e423301CE9385c1fb8850539D657C296D" as const
export const ST_HYPE_ADDRESS = "0xfFaa4a3D97fE9107Cef8a3F48c069F577Ff76cC1" as const
export const ETH_ADDRESS = "0xBe6727B535545C67d5cAa73dEa54865B92CF7907" as const

export const WHYPE = "0x5555555555555555555555555555555555555555" as const
export const KHYPE = "0xfD739d4e423301CE9385c1fb8850539D657C296D" as const
export const UETH = "0xBe6727B535545C67d5cAa73dEa54865B92CF7907" as const

export const ETH_PRICE_FEED_PYTH = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace" as const

export const ENCODING_VERSION = 1
export const ACTION_IDS = {
    USDC_CLASS_TRANSFER: 7,
    LIMIT_ORDER: 1,
    SPOT_SEND: 6,
} as const

export const TOKEN_IDS = {
    USDT: 1105n,
} as const

export const PERP_IDS = {
    HYPE: 159,
} as const

export const SPOT_IDS = {
    USDT: 10_166,
} as const

export const MARKET_IDS = {
    USDT_USDC_SPOT: 11115,
    HYPE_PERP: 135,
} as const

export const COIN_NAME_MAP: Record<string, string> = {
    "@1115": "USDT",
}

export const ASSET_MAP: Record<string, { symbol: string; name: string; decimals: number; feedId: string }> = {
    [WHYPE.toLowerCase()]: {
        symbol: "WHYPE",
        name: "WHYPE",
        decimals: 18,
        feedId: "0x4279e31cc369bbcc2faf022b382b080e32a8e689ff20fbc530d2a603eb6cd98b",
    },
    [KHYPE.toLowerCase()]: {
        symbol: "KHYPE",
        name: "KHYPE",
        decimals: 18,
        feedId: "0x2837a61ae8165c018b0e406ac32b1527270e57b81f0069260afbef71b9cf8ffe",
    },
    [UETH.toLowerCase()]: {
        symbol: "UETH",
        name: "UETH",
        decimals: 18,
        feedId: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    },
    [WST_HYPE.toLowerCase()]: {
        symbol: "WST_HYPE",
        name: "WST_HYPE",
        decimals: 18,
        feedId: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    },
}
