import { configureStore } from "@reduxjs/toolkit"
import walletReducer from "./features/wallet/walletSlice"
import userReducer from "./features/user/userSlice"
import hyperliquidReducer from "./features/hyperliquidSlice"
import vaultReducer from "./features/vaultSlice"

export const store = configureStore({
    reducer: {
        wallet: walletReducer,
        user: userReducer,
        hyperliquid: hyperliquidReducer,
        vault: vaultReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
