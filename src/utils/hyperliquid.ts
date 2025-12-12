import axios from "axios"

export type FrontendOpenOrders = {
    coin: string
    isPositionTpsl: boolean
    isTrigger: boolean
    limitPx: string
    oid: number
    orderType: string
    origSz: string
    reduceOnly: boolean
    side: string
    sz: string
    timestamp: number
    triggerCondition: string
    triggerPx: string
}[]

const emptyClearinghouseState: ClearinghouseState = {
    assetPositions: [],
    crossMaintenanceMarginUsed: "0",
    crossMarginSummary: {
        accountValue: "0",
        totalMarginUsed: "0",
        totalNtlPos: "0",
        totalRawUsd: "0",
    },
    marginSummary: {
        accountValue: "0",
        totalMarginUsed: "0",
        totalNtlPos: "0",
        totalRawUsd: "0",
    },
    time: 0,
    withdrawable: "0",
}
export type Position = {
    coin: string
    cumFunding: {
        allTime: string
        sinceChange: string
        sinceOpen: string
    }
    entryPx: string
    leverage: {
        rawUsd: string
        type: string
        value: number
    }
    liquidationPx: string
    marginUsed: string
    maxLeverage: number
    positionValue: string
    returnOnEquity: string
    szi: string
    unrealizedPnl: string
}

export interface HistoricalOrder {
    order: {
        coin: string
        side: string
        limitPx: string
        sz: string
        oid: number
        timestamp: number
        triggerCondition: string
        isTrigger: boolean
        triggerPx: string
        children: any[]
        isPositionTpsl: boolean
        reduceOnly: boolean
        orderType: string
        origSz: string
        tif: string
        cloid: string | null
    }
    status: "filled" | "open" | "canceled" | "triggered" | "rejected" | "marginCanceled"
}

export interface ClearinghouseState {
    assetPositions: {
        position: {
            coin: string
            cumFunding: {
                allTime: string
                sinceChange: string
                sinceOpen: string
            }
            entryPx: string
            leverage: {
                rawUsd: string
                type: string
                value: number
            }
            liquidationPx: string
            marginUsed: string
            maxLeverage: number
            positionValue: string
            returnOnEquity: string
            szi: string
            unrealizedPnl: string
        }
        type: string
    }[]
    crossMaintenanceMarginUsed: string
    crossMarginSummary: {
        accountValue: string
        totalMarginUsed: string
        totalNtlPos: string
        totalRawUsd: string
    }
    marginSummary: {
        accountValue: string
        totalMarginUsed: string
        totalNtlPos: string
        totalRawUsd: string
    }
    time: number
    withdrawable: string
}
export interface TwapOrder {
    coin: string
    is_buy: boolean
    sz: number
    reduce_only: boolean
    minutes: number
    randomize: boolean
}

export interface UserFundingDelta {
    coin: string
    fundingRate: string
    szi: string
    type: "funding"
    usdc: string
}

export interface UserFundingEntry {
    delta: UserFundingDelta
    hash: string
    time: number
}

export type UserFunding = UserFundingEntry[]

export interface UserOrderHistoryEntry {
    order: {
        coin: string
        side: string
        limitPx: string
        sz: string
        oid: number
        timestamp: number
        triggerCondition: string
        isTrigger: boolean
        triggerPx: string
        children: unknown[]
        isPositionTpsl: boolean
        reduceOnly: boolean
        orderType: string
        origSz: string
        tif: string
        cloid: string | null
    }
    status: "filled" | "open" | "canceled" | "triggered" | "rejected" | "marginCanceled"
    statusTimestamp: number
}

export type UserOrderHistory = UserOrderHistoryEntry[]

export interface AllMids {
    [coin: string]: string
}
export type UserFills = {
    closedPnl: string
    coin: string
    crossed: boolean
    dir: string
    hash: string
    fee: string
    oid: number
    px: string
    side: string
    startPosition: string
    sz: string
    time: number
}[]

export interface TwapSliceFill {
    fill: {
        closedPnl: string
        coin: string
        crossed: boolean
        dir: string
        hash: string
        oid: number
        reduceOnly: boolean
        px: string
        side: string
        startPosition: string
        sz: string
        time: number
        fee: string
        feeToken: string
        tid: number
    }
    twapId: number
}

export interface SpotClearinghouseState {
    balances: {
        coin: string
        entryNtl: string
        hold: string
        token: number
        total: string
    }[]
}
export interface TokenDetails {
    name: string
    maxSupply: string
    totalSupply: string
    circulatingSupply: string
    szDecimals: number
    weiDecimals: number
    midPx: string
    markPx: string
    prevDayPx: string
    genesis: {
        userBalances: [string, string][]
        existingTokenBalances: [number, string][]
    }
    deployer: string
    deployGas: string
    deployTime: string
    seededUsdc: string
    nonCirculatingUserBalances: string[]
    futureEmissions: string
}

export interface SpotToken {
    name: string
    szDecimals: number
    weiDecimals: number
    index: number
    tokenId: string
    isCanonical: boolean
}

export interface SpotMarket {
    name: string
    tokens: [number, number]
    index: number
    isCanonical: boolean
}

export interface SpotMeta {
    tokens: SpotToken[]
    universe: SpotMarket[]
}

export function createHyperliquidClient(options: { testnet?: boolean } = {}) {
    const baseUrl = options.testnet ? "https://api.hyperliquid-testnet.xyz" : "https://api.hyperliquid.xyz"

    const api = axios.create({
        baseURL: baseUrl,
        headers: {
            "Content-Type": "application/json",
        },
    })

    return {
        /**
         * Get user open orders (perpetual positions)
         * @param userAddress - User's wallet address
         */
        async getUserOpenOrders(userAddress: string): Promise<FrontendOpenOrders> {
            try {
                const response = await api.post("/info", {
                    type: "frontendOpenOrders",
                    user: userAddress,
                })

                return response.data
            } catch (error) {
                console.error("Error fetching user open orders:", error)
                return []
            }
        },

        /**
         * Get spot clearinghouse state (spot balances)
         * @param userAddress - User's wallet address
         */
        async getSpotClearinghouseState(userAddress: string): Promise<SpotClearinghouseState> {
            try {
                const response = await api.post(`/info`, {
                    type: "spotClearinghouseState",
                    user: userAddress,
                })

                return response.data || { balances: [] }
            } catch (error) {
                console.error("Error fetching spot clearinghouse state:", error)
                return { balances: [] }
            }
        },

        /**
         * Get all perpetual mid prices
         */
        async getAllMids(): Promise<AllMids> {
            try {
                const response = await api.post("/info", {
                    type: "allMids",
                })
                return response.data
            } catch (error) {
                console.error("Error fetching perpetual mid prices:", error)
                return {}
            }
        },

        /**
         * Get spot metadata
         */
        async getSpotMeta(): Promise<SpotMeta> {
            try {
                const response = await api.post("/info", {
                    type: "spotMeta",
                })
                return response.data || { tokens: [], universe: [] }
            } catch (error) {
                console.error("Error fetching spot meta:", error)
                return { tokens: [], universe: [] }
            }
        },

        /**
         * Get token details
         * @param tokenId - Token ID (as string to match API)
         */
        async getTokenDetails(tokenId: string): Promise<TokenDetails | null> {
            try {
                const response = await api.post("/info", {
                    tokenId: tokenId,
                    type: "tokenDetails",
                })
                return response.data || null
            } catch (error) {
                console.error("Error fetching token details:", error)
                return null
            }
        },

        /**
         * Get token details by asset name
         * @param asset - Asset name
         */
        async getTokenDetailsByName(asset: string): Promise<TokenDetails | null> {
            try {
                const spotState = await this.getSpotMeta()
                const spotToken = spotState.tokens.find((token) => token.name.toUpperCase() === asset.toUpperCase())

                if (spotToken) {
                    const tokenDetails = await this.getTokenDetails(spotToken.tokenId)
                    return tokenDetails
                }
                return null
            } catch (error) {
                console.error("Error fetching token details:", error)
                return null
            }
        },

        /**
         * Get all spot balances for a user
         */
        async getSpotBalances(userAddress: string): Promise<SpotClearinghouseState> {
            return this.getSpotClearinghouseState(userAddress)
        },

        /**
         * Get all user positions and balances
         */
        async getUserState(userAddress: string): Promise<{ positions: ClearinghouseState; balances: SpotClearinghouseState }> {
            try {
                const [positions, balances] = await Promise.all([
                    this.getPerpPositions(userAddress),
                    this.getSpotBalances(userAddress),
                ])
                return { positions, balances }
            } catch (error) {
                console.error("Error fetching user state:", error)
                return { positions: emptyClearinghouseState, balances: { balances: [] } }
            }
        },

        /**
         * Get price for a single asset
         */
        async getAssetPrice(asset: string, isPerp: boolean = false): Promise<number | null> {
            const assetKey = `${asset.toUpperCase()}`

            try {
                if (isPerp) {
                    const allMids = await this.getAllMids()
                    if (allMids[assetKey]) {
                        return parseFloat(allMids[assetKey])
                    }
                } else {
                    const spotState = await this.getSpotMeta()
                    const spotToken = spotState.tokens.find((token) => token.name.toUpperCase() === assetKey)

                    if (spotToken) {
                        const tokenDetails = await this.getTokenDetails(spotToken.tokenId)

                        if (tokenDetails?.midPx) {
                            return parseFloat(tokenDetails.midPx)
                        }
                    }
                }

                console.warn(`Price not found for asset: ${asset}`)
                return null
            } catch (error) {
                console.error(`Error fetching ${asset} price:`, error)
                return null
            }
        },

        /**
         * Get all perpetual positions for a user (enhanced version)
         **/

        async getPerpPositions(userAddress: string): Promise<ClearinghouseState> {
            try {
                const response = await api.post("/info", {
                    type: "clearinghouseState",
                    user: userAddress,
                })

                return response.data || []
            } catch (error) {
                console.error("Error fetching perpetual positions:", error)
                return emptyClearinghouseState
            }
        },
        /**
         * Get user's trade history
         * @param userAddress - User's wallet address
         * @param startTime - Optional start time in milliseconds
         * @param endTime - Optional end time in milliseconds
         * @param limit - Number of trades to return (default: 100)
         */
        async getTradeHistory(
            userAddress: string,
            startTime?: number,
            endTime?: number,
            limit: number = 100
        ): Promise<UserFills> {
            try {
                const payload: any = {
                    type: "userFills",
                    user: userAddress,
                    limit: limit,
                }
                const date = new Date()
                const fifteenDaysAgo = new Date(date.getTime() - 15 * 24 * 60 * 60 * 1000)
                const tenYearLater = new Date(date.getTime() + 10 * 365 * 24 * 60 * 60 * 1000)

                if (startTime !== undefined) {
                    payload.startTime = startTime
                } else {
                    payload.startTime = fifteenDaysAgo.getTime()
                }

                if (endTime !== undefined) payload.endTime = endTime
                else {
                    payload.endTime = tenYearLater.getTime()
                }

                const response = await api.post("/info", payload)

                return response.data || []
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error("Error fetching trade history:", error.response?.data || error.message)
                } else {
                    console.error("Error fetching trade history:", error)
                }
                return []
            }
        },

        /**
         * Create a TWAP order
         * @param userAddress - User's wallet address
         * @param twapOrder - TWAP order details
         */
        async createTWAPOrder(userAddress: string, twapOrder: TwapOrder): Promise<{ success: boolean; message?: string }> {
            try {
                const response = await api.post("/exchange", {
                    type: "twapOrder",
                    user: userAddress,
                    ...twapOrder,
                })
                return { success: response.data?.status === "success", message: response.data?.message }
            } catch (error) {
                console.error("Error creating TWAP order:", error)
                return { success: false, message: error instanceof Error ? error.message : "Unknown error" }
            }
        },
        /**
         * Get user's funding history
         * @param userAddress - User's wallet address
         * @param startTime - Optional start time in milliseconds
         * @param endTime - Optional end time in milliseconds
         * @param limit - Number of funding events to return (default: 100)
         */
        async getFundingHistory(
            userAddress: string,
            startTime?: number,
            endTime?: number,
            limit: number = 100
        ): Promise<UserFunding> {
            try {
                const payload: any = {
                    type: "userFunding",
                    user: userAddress,
                    limit: limit,
                }

                if (startTime !== undefined) payload.startTime = startTime
                if (endTime !== undefined) payload.endTime = endTime

                const response = await api.post("/info", payload)
                return response.data || []
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error("Error fetching funding history:", error.response?.data || error.message)
                } else {
                    console.error("Error fetching funding history:", error)
                }
                return []
            }
        },
        /**
         * Get user's order history
         * @param userAddress - User's wallet address
         * @param startTime - Optional start time in milliseconds
         * @param endTime - Optional end time in milliseconds
         * @param limit - Number of orders to return (default: 100)
         */
        async getOrderHistory(userAddress: string, limit: number = 100): Promise<HistoricalOrder[]> {
            try {
                const payload: any = {
                    type: "historicalOrders",
                    user: userAddress,
                    limit: limit,
                }
                const response = await api.post("/info", payload)

                return response.data || []
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error("Error fetching order history:", error.response?.data || error.message)
                } else {
                    console.error("Error fetching order history:", error)
                }
                return []
            }
        },

        /**
         * Get active TWAP orders for a user
         * @param userAddress - User's wallet address
         */
        async getActiveTWAPOrders(userAddress: string): Promise<TwapSliceFill[]> {
            try {
                const response = await api.post("/info", {
                    type: "userTwapSliceFills",
                    user: userAddress,
                })
                return response.data || []
            } catch (error) {
                console.error("Error fetching active TWAP orders:", error)
                return []
            }
        },

        /**
         * Cancel a TWAP order
         * @param userAddress - User's wallet address
         * @param orderId - ID of the TWAP order to cancel
         */
        async cancelTWAPOrder(userAddress: string, orderId: number): Promise<{ success: boolean; message?: string }> {
            try {
                const response = await api.post("/exchange", {
                    type: "twapCancel",
                    user: userAddress,
                    oid: orderId,
                })
                return { success: response.data?.status === "success", message: response.data?.message }
            } catch (error) {
                console.error("Error canceling TWAP order:", error)
                return { success: false, message: error instanceof Error ? error.message : "Unknown error" }
            }
        },

        /**
         * Get complete user state including all requested data
         */
        async getCompleteUserState(
            userAddress: string,
            startTime?: number,
            endTime?: number,
            limit: number = 100
        ): Promise<{
            balances: SpotClearinghouseState
            positions: ClearinghouseState
            openOrders: FrontendOpenOrders
            tradeHistory: UserFills
            fundingHistory: UserFunding
            orderHistory: HistoricalOrder[]
            activeTWAPs: TwapSliceFill[]
        }> {
            try {
                const [balances, positions, openOrders, tradeHistory, fundingHistory, orderHistory, activeTWAPs] =
                    await Promise.all([
                        this.getSpotClearinghouseState(userAddress),
                        this.getPerpPositions(userAddress),
                        this.getUserOpenOrders(userAddress),
                        this.getTradeHistory(userAddress, startTime, endTime, limit),
                        this.getFundingHistory(userAddress, startTime, endTime, limit),
                        this.getOrderHistory(userAddress, limit),
                        this.getActiveTWAPOrders(userAddress),
                    ])

                return {
                    balances,
                    positions,
                    openOrders,
                    tradeHistory,
                    fundingHistory,
                    orderHistory,
                    activeTWAPs,
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error("Error fetching complete user state:", error.response?.data || error.message)
                } else {
                    console.error("Error fetching complete user state:", error)
                }
                return {
                    balances: { balances: [] },
                    positions: emptyClearinghouseState,
                    openOrders: [],
                    tradeHistory: [],
                    fundingHistory: [],
                    orderHistory: [],
                    activeTWAPs: [],
                }
            }
        },
    }
}

export type HyperliquidClient = ReturnType<typeof createHyperliquidClient>
