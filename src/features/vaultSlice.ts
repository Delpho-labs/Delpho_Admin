import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { VaultMetrics } from "../hooks/useVaultData"

interface VaultState {
    data: VaultMetrics | null
    lastUpdated: number | null
}

const initialState: VaultState = {
    data: null,
    lastUpdated: null,
}

const vaultSlice = createSlice({
    name: "vault",
    initialState,
    reducers: {
        setVaultData: (state, action: PayloadAction<VaultMetrics>) => {
            state.data = action.payload
            state.lastUpdated = Date.now()
        },
        clearVaultData: (state) => {
            state.data = null
            state.lastUpdated = null
        },
        updatePartialVaultData: (state, action: PayloadAction<Partial<VaultMetrics>>) => {
            if (state.data) {
                state.data = { ...state.data, ...action.payload }
                state.lastUpdated = Date.now()
            }
        },
    },
})

export const { setVaultData, clearVaultData, updatePartialVaultData } = vaultSlice.actions
export default vaultSlice.reducer
