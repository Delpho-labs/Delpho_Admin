import { useSelector, useDispatch } from "react-redux"
import { type RootState, type AppDispatch } from "../store"
import {
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
} from "../features/hyperliquidSlice"
import { createHyperliquidClient, type Position } from "../utils/hyperliquid"
import { EXECUTOR_ADDRESS } from "../config/constants"

export const useHyperliquid = (address?: string) => {
    const dispatch = useDispatch<AppDispatch>();
    const executorAddress = address || EXECUTOR_ADDRESS
    const hyperliquidState = useSelector((state: RootState) => state.hyperliquid)

    const hyperliquidClient = createHyperliquidClient({ testnet: false })

    const getSpotBalance = (assetName: string): number => {
        const usdcBalance = hyperliquidState.balances.balances.find((balance) => balance.coin === assetName)
        return usdcBalance ? parseFloat(usdcBalance.total) : 0
    }

    const getPerpWithdrawableBalance = () => {
        return hyperliquidState.positions.withdrawable
    }

    const getAssetPerpPosition = (asset: string): Position => {
        try {
            const positions = hyperliquidState.positions.assetPositions
            const assetPosition = positions.find((pos) => pos.position.coin.toUpperCase() === asset.toUpperCase())
            return assetPosition ? assetPosition.position : ({} as Position)
        } catch (err) {
            console.error(`Error getting ${asset} position:`, err)
            return {} as Position
        }
    }

    const fetchCompleteState = async (): Promise<void> => {
        try {
            dispatch(setLoading(true))
            const completeState = await hyperliquidClient.getCompleteUserState(executorAddress)
            dispatch(updateCompleteState(completeState))
        } catch (err) {
            console.error("Error fetching Hyperliquid data:", err)
            dispatch(setError("Failed to load data. Please try again later."))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const fetchBalances = async (): Promise<void> => {
        try {
            dispatch(setLoading(true))
            const balances = await hyperliquidClient.getSpotClearinghouseState(executorAddress)
            dispatch(updateBalances(balances))
        } catch (err) {
            console.error("Error fetching balances:", err)
            dispatch(setError("Failed to load balances. Please try again later."))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const fetchPositions = async (): Promise<void> => {
        try {
            dispatch(setLoading(true))
            const positions = await hyperliquidClient.getPerpPositions(executorAddress)
            dispatch(updatePositions(positions))
        } catch (err) {
            console.error("Error fetching positions:", err)
            dispatch(setError("Failed to load positions. Please try again later."))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const fetchOpenOrders = async (): Promise<void> => {
        try {
            dispatch(setLoading(true))
            const openOrders = await hyperliquidClient.getUserOpenOrders(executorAddress)
            dispatch(updateOpenOrders(openOrders))
        } catch (err) {
            console.error("Error fetching open orders:", err)
            dispatch(setError("Failed to load open orders. Please try again later."))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const fetchTradeHistory = async (): Promise<void> => {
        try {
            dispatch(setLoading(true))
            const tradeHistory = await hyperliquidClient.getTradeHistory(executorAddress)
            dispatch(updateTradeHistory(tradeHistory))
        } catch (err) {
            console.error("Error fetching trade history:", err)
            dispatch(setError("Failed to load trade history. Please try again later."))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const fetchFundingHistory = async (): Promise<void> => {
        try {
            dispatch(setLoading(true))
            const fundingHistory = await hyperliquidClient.getFundingHistory(executorAddress)
            dispatch(updateFundingHistory(fundingHistory))
        } catch (err) {
            console.error("Error fetching funding history:", err)
            dispatch(setError("Failed to load funding history. Please try again later."))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const fetchOrderHistory = async (): Promise<void> => {
        try {
            dispatch(setLoading(true))
            const orderHistory = await hyperliquidClient.getOrderHistory(executorAddress)
            dispatch(updateOrderHistory(orderHistory))
        } catch (err) {
            console.error("Error fetching order history:", err)
            dispatch(setError("Failed to load order history. Please try again later."))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const fetchActiveTWAPs = async (): Promise<void> => {
        try {
            dispatch(setLoading(true))
            const activeTWAPs = await hyperliquidClient.getActiveTWAPOrders(executorAddress)
            dispatch(updateActiveTWAPs(activeTWAPs))
        } catch (err) {
            console.error("Error fetching active TWAPs:", err)
            dispatch(setError("Failed to load active TWAPs. Please try again later."))
        } finally {
            dispatch(setLoading(false))
        }
    }
    const updateBalance = async (): Promise<boolean> => {
        try {
            dispatch(setLoading(true))

            const { balances, positions } = await hyperliquidClient.getUserState(executorAddress)

            dispatch(updateBalances(balances))
            dispatch(updatePositions(positions))

            return true
        } catch (err) {
            console.error("Error updating both spot and perp:", err)
            dispatch(setError("Failed to update both spot and perpetual data. Please try again later."))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    const getUserState = async (testnet: boolean = false) => {
        try {
            const hyperliquidClient = createHyperliquidClient({ testnet })
            const userState = await hyperliquidClient.getUserState(executorAddress)

            return {
                success: true,
                balances: userState.balances,
                positions: userState.positions,
            }
        } catch (err) {
            console.error("Error fetching user state:", err)
            return {
                success: false,
                error: "Failed to fetch user state",
            }
        }
    }

    return {
        ...hyperliquidState,
        getUserState,
        getSpotBalance,
        fetchCompleteState,
        fetchBalances,
        fetchPositions,
        updateBalance,
        fetchOpenOrders,
        fetchTradeHistory,
        fetchFundingHistory,
        fetchOrderHistory,
        fetchActiveTWAPs,
        getPerpWithdrawableBalance,
        getAssetPerpPosition,
    }
}
