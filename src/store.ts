import { configureStore } from "@reduxjs/toolkit"
import walletReducer from "./features/wallet/walletSlice"
import userReducer from "./features/user/userSlice"
import hyperliquidReducer from "./features/hyperliquidSlice"

export const store = configureStore({
    reducer: {
        wallet: walletReducer,
        user: userReducer,
        hyperliquid: hyperliquidReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
