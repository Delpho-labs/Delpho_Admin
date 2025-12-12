import { useAccount, useWalletClient } from "wagmi"
import { EXECUTOR_ADDRESS } from "../config/constants"
import { EXECUTOR_ABI } from "../config/Abi.ts"
import { useCallback } from "react"
import { waitForTransactionReceipt } from "viem/actions"
export function useEvmActions() {
    const { address } = useAccount()
    const { data: walletClient } = useWalletClient()

    /** 
    function executeFullEvmFlow(uint256 minAmountOut, uint256 minInitialAmountOut, uint256 targetLoopValue) */

    const executeEvmFlow = useCallback(async () => {
        if (!walletClient || !address) throw new Error("Wallet not connected")

        //const slippageBps = 100; // 1% slippage

        // const minAmountOut = getSlippageAdjustedAmount(
        //   expectedUsdtOut,
        //   slippageBps
        // );
        // const minInitialAmountOut = getSlippageAdjustedAmount(
        //   expectedHypeOut,
        //   slippageBps
        // );

        // targetLoopValue could be user input (e.g., 150 USDT)

        const tx = await walletClient.writeContract({
            address: EXECUTOR_ADDRESS,
            abi: EXECUTOR_ABI,
            functionName: "executeFullEvmFlowNew",
            args: [],
            account: address,
        })

        await waitForTransactionReceipt(walletClient, {
            hash: tx as `0x${string}`,
        })
        return tx
    }, [walletClient, address])

    return {
        executeEvmFlow,
    }
}

// function getSlippageAdjustedAmount(
//   amount: bigint,
//   slippageBps: number
// ): bigint {
//   const maxBps = 10_000n;
//   return (amount * BigInt(10_000 - slippageBps)) / maxBps;
// }
