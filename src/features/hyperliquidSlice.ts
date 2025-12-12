import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import {
    type FrontendOpenOrders,
    type ClearinghouseState,
    type TwapSliceFill,
    type UserFills,
    type UserFunding,
    type HistoricalOrder,
    type SpotClearinghouseState,
} from "../utils/hyperliquid"

interface HyperliquidState {
    balances: SpotClearinghouseState
    positions: ClearinghouseState
    openOrders: FrontendOpenOrders
    activeTWAPs: TwapSliceFill[]
    tradeHistory: UserFills
    fundingHistory: UserFunding
    orderHistory: HistoricalOrder[]
    loading: boolean
    error: string | null
    lastUpdated: number | null
}

const initialState: HyperliquidState = {
    balances: { balances: [] },
    positions: {
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
    },
    openOrders: [],
    activeTWAPs: [],
    tradeHistory: [],
    fundingHistory: [],
    orderHistory: [],
    loading: false,
    error: null,
    lastUpdated: null,
}

const hyperliquidSlice = createSlice({
    name: "hyperliquid",
    initialState,
    reducers: {
        updateCompleteState(
            state,
            action: PayloadAction<{
                balances: SpotClearinghouseState
                positions: ClearinghouseState
                openOrders: FrontendOpenOrders
                tradeHistory: UserFills
                fundingHistory: UserFunding
                orderHistory: HistoricalOrder[]
                activeTWAPs: TwapSliceFill[]
            }>
        ) {
            state.balances = action.payload.balances
            state.positions = action.payload.positions
            state.openOrders = action.payload.openOrders
            state.tradeHistory = action.payload.tradeHistory
            state.fundingHistory = action.payload.fundingHistory
            state.orderHistory = action.payload.orderHistory
            state.activeTWAPs = action.payload.activeTWAPs
            state.lastUpdated = Date.now()
            state.error = null
        },

        updateBalances(state, action: PayloadAction<SpotClearinghouseState>) {
            state.balances = action.payload
            state.lastUpdated = Date.now()
        },

        updatePositions(state, action: PayloadAction<ClearinghouseState>) {
            state.positions = action.payload
            state.lastUpdated = Date.now()
        },

        updateOpenOrders(state, action: PayloadAction<FrontendOpenOrders>) {
            state.openOrders = action.payload
            state.lastUpdated = Date.now()
        },

        updateTradeHistory(state, action: PayloadAction<UserFills>) {
            state.tradeHistory = action.payload
            state.lastUpdated = Date.now()
        },

        updateFundingHistory(state, action: PayloadAction<UserFunding>) {
            state.fundingHistory = action.payload
            state.lastUpdated = Date.now()
        },

        updateOrderHistory(state, action: PayloadAction<HistoricalOrder[]>) {
            state.orderHistory = action.payload
            state.lastUpdated = Date.now()
        },

        updateActiveTWAPs(state, action: PayloadAction<TwapSliceFill[]>) {
            state.activeTWAPs = action.payload
            state.lastUpdated = Date.now()
        },

        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload
        },

        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload
        },

        resetHyperliquidState() {
            return initialState
        },
    },
})

export const {
    updateCompleteState,
    updateBalances,
    updatePositions,
    updateOpenOrders,
    updateTradeHistory,
    updateFundingHistory,
    updateOrderHistory,
    updateActiveTWAPs,
    setLoading,
    setError,
    resetHyperliquidState,
} = hyperliquidSlice.actions

export default hyperliquidSlice.reducer
