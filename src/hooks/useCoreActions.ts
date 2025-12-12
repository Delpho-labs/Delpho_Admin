import { useAccount, useWalletClient } from "wagmi"
import { encodeAbiParameters, parseAbiParameters } from "viem"
import { useCallback } from "react"
import { CORE_WRITER_ADDRESS, ENCODING_VERSION, ACTION_IDS, TOKEN_IDS, MARKET_IDS, EXECUTOR_ADDRESS } from "../config/constants"
import { CORE_WRITER_ABI, EXECUTOR_ABI } from "../config/Abi.ts"
import { waitForTransactionReceipt } from "viem/actions"

export function useCoreActions() {
    const { address } = useAccount()
    const { data: walletClient } = useWalletClient()

    const buildAction = useCallback((actionId: number, abiParams: string, values: unknown[]): `0x${string}` => {
        const versionByte = ENCODING_VERSION.toString(16).padStart(2, "0")
        const actionIdBytes = actionId.toString(16).padStart(6, "0")
        const actionData = encodeAbiParameters(parseAbiParameters(abiParams), values)

        return `0x${versionByte}${actionIdBytes}${actionData.slice(2)}`
    }, [])

    const transferUSDC = useCallback(
        async (amount: bigint, toPerp: boolean) => {
            if (!walletClient || !address) throw new Error("Wallet not connected")

            const tx = await walletClient.writeContract({
                address: EXECUTOR_ADDRESS,
                abi: EXECUTOR_ABI,
                functionName: "transferUSDCFromSpotToPerp",
                args: [amount, toPerp],
                account: address,
            })
            await waitForTransactionReceipt(walletClient, {
                hash: tx as `0x${string}`,
            })
            return tx
        },
        [walletClient, address]
    )
    const closeHypeShort = useCallback(
        async (limitPrice: bigint, size: bigint) => {
            if (!walletClient || !address) throw new Error("Wallet not connected")

            const tx = await walletClient.writeContract({
                address: EXECUTOR_ADDRESS,
                abi: EXECUTOR_ABI,
                functionName: "closeHypeShort",
                args: [limitPrice, size],
                account: address,
            })
            await waitForTransactionReceipt(walletClient, {
                hash: tx as `0x${string}`,
            })
            return tx
        },
        [walletClient, address]
    )

    const createOrder = useCallback(
        async (marketId: number, isBuy: boolean, limitPrice: bigint, size: bigint) => {
            if (!walletClient || !address) throw new Error("Wallet not connected")

            if (marketId === MARKET_IDS.HYPE_PERP) {
                const tx = await walletClient.writeContract({
                    address: EXECUTOR_ADDRESS,
                    abi: EXECUTOR_ABI,
                    functionName: "openHypeShort",
                    args: [isBuy, limitPrice, size],
                    account: address,
                })
                await waitForTransactionReceipt(walletClient, {
                    hash: tx as `0x${string}`,
                })
                return tx
            }

            if (marketId === MARKET_IDS.USDT_USDC_SPOT) {
                const tx = await walletClient.writeContract({
                    address: EXECUTOR_ADDRESS,
                    abi: EXECUTOR_ABI,
                    functionName: "swapUSDT2USDC",
                    args: [isBuy, limitPrice, size],
                    account: address,
                })
                await waitForTransactionReceipt(walletClient, {
                    hash: tx as `0x${string}`,
                })
                return tx
            }
        },
        [walletClient, address]
    )

    const transferToEVM = useCallback(
        async (recipient: `0x${string}`, tokenId: bigint, amount: bigint) => {
            if (!walletClient || !address) throw new Error("Wallet not connected")

            // For USDT transfers, use the executor's transfer function
            if (tokenId === TOKEN_IDS.USDT) {
                const tx = await walletClient.writeContract({
                    address: EXECUTOR_ADDRESS,
                    abi: EXECUTOR_ABI,
                    functionName: "transferUSDT2Core",
                    args: [amount],
                    account: address,
                })
                await waitForTransactionReceipt(walletClient, {
                    hash: tx as `0x${string}`,
                })
                return tx
            }

            // Fallback to direct CoreWriter call for other tokens
            const rawAction = buildAction(ACTION_IDS.SPOT_SEND, "address recipient, uint64 tokenId, uint64 weiAmount", [
                recipient,
                tokenId,
                amount,
            ])
            const tx = await walletClient.writeContract({
                address: CORE_WRITER_ADDRESS,
                abi: CORE_WRITER_ABI,
                functionName: "sendRawAction",
                args: [rawAction],
                account: address,
            })
            await waitForTransactionReceipt(walletClient, {
                hash: tx as `0x${string}`,
            })
            return tx
        },
        [walletClient, address, buildAction]
    )

    const transferUSDCToSpot = useCallback(
        async (amount: bigint) => {
            return transferUSDC(amount, false)
        },
        [transferUSDC]
    )

    const transferUSDCToPerp = useCallback(
        async (amount: bigint) => {
            return transferUSDC(amount, true)
        },
        [transferUSDC]
    )

    const swapUSDCToUSDT = useCallback(
        async (isBuy: boolean, limitPrice: bigint, size: bigint) => {
            return createOrder(MARKET_IDS.USDT_USDC_SPOT, isBuy, limitPrice, size)
        },
        [createOrder]
    )

    const openHypeShort = useCallback(
        async (limitPrice: bigint, size: bigint) => {
            return createOrder(MARKET_IDS.HYPE_PERP, false, limitPrice, size)
        },
        [createOrder]
    )

    const transferUSDTToEVM = useCallback(
        async (amount: bigint) => {
            return transferToEVM(address!, TOKEN_IDS.USDT, amount)
        },
        [transferToEVM, address]
    )

    const openHypePosition = useCallback(
        async (isLong: boolean, limitPrice: bigint, size: bigint) => {
            return createOrder(MARKET_IDS.HYPE_PERP, isLong, limitPrice, size)
        },
        [createOrder]
    )

    return {
        transferUSDC,
        createOrder,
        transferToEVM,
        transferUSDCToSpot,
        openHypePosition,
        transferUSDCToPerp,
        swapUSDCToUSDT,
        openHypeShort,
        transferUSDTToEVM,
        closeHypeShort,
        constants: {
            TOKEN_IDS,
            MARKET_IDS,
        },
    }
}
