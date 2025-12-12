import { createSlice } from "@reduxjs/toolkit"

interface WalletState {
    connected: boolean
    address: string | null
}

const initialState: WalletState = {
    connected: false,
    address: null,
}

const walletSlice = createSlice({
    name: "wallet",
    initialState,
    reducers: {
        connect(state, action) {
            state.connected = true
            state.address = action.payload
        },
        disconnect(state) {
            state.connected = false
            state.address = null
        },
        setAddress(state, action) {
            state.address = action.payload
        },
    },
})

export const { connect, disconnect, setAddress } = walletSlice.actions
export default walletSlice.reducer
