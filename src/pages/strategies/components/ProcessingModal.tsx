import React, { useEffect, useState, useRef } from "react"
import { FiCheck, FiX } from "react-icons/fi"
import { useCoreActions } from "../../../hooks/useCoreActions"

type ProcessStatus = "pending" | "processing" | "completed" | "failed"

interface ProcessStep {
    id: string
    label: string
    status: ProcessStatus
    txHash?: string
    error?: string
}

type ActionType = "rebalance" | "close"
type RebalancingType = "upside" | "downside" | null

interface ProcessingModalProps {
    isOpen: boolean
    onClose: () => void
    actionType: ActionType
    rebalancingType: RebalancingType
    strategyId: string
    strategyAddress: string
}

const UPSIDE_STEPS: Omit<ProcessStep, "status">[] = [
    { id: "1", label: "borrow from sentiment" },
    { id: "2", label: "transfer to core" },
    { id: "3", label: "swap to usdc" },
    { id: "4", label: "transfer to perps" },
]

const DOWNSIDE_STEPS: Omit<ProcessStep, "status">[] = [
    { id: "1", label: "transfer usdc to spot" },
    { id: "2", label: "swap to usdt" },
    { id: "3", label: "transfer to evm" },
    { id: "4", label: "repay usdt" },
]

const CLOSE_STEPS: Omit<ProcessStep, "status">[] = [
    { id: "1", label: "close hype short" },
    { id: "2", label: "transfer usdc to spot" },
    { id: "3", label: "swap to usdt" },
    { id: "4", label: "transfer to evm" },
    { id: "5", label: "repay usdt" },
    { id: "6", label: "close strategy" },
]

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
    isOpen,
    onClose,
    actionType,
    rebalancingType,
    strategyId,
    strategyAddress,
}) => {
    const coreActions = useCoreActions()
    const [steps, setSteps] = useState<ProcessStep[]>([])
    const [isComplete, setIsComplete] = useState(false)
    const [hasFailed, setHasFailed] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const abortRef = useRef(false)

    const getStepTemplates = (): Omit<ProcessStep, "status">[] => {
        if (actionType === "close") return CLOSE_STEPS
        if (rebalancingType === "upside") return UPSIDE_STEPS
        return DOWNSIDE_STEPS
    }

    const executeStepFunction = async (stepLabel: string): Promise<{ success: boolean; txHash?: string; error?: string }> => {
        const executorAddress = strategyAddress

        try {
            console.log(`Executing: ${stepLabel}`)
            let txHash: string | undefined

            switch (stepLabel.toLowerCase()) {
                // Close Strategy Steps
                case "close hype short":
                    console.log("Closing HYPE short position...")
                    await coreActions.closeHypeShort(0, executorAddress)
                    break

                case "transfer usdc to spot":
                    console.log("Transferring USDC to spot...")
                    await coreActions.transferUSDCToSpot(0, executorAddress)
                    break

                case "swap to usdt":
                    console.log("Swapping USDC to USDT...")
                    await coreActions.swapUSDCToUSDT(0, executorAddress)
                    break

                case "transfer to evm":
                    console.log("Transferring USDT to EVM...")
                    await coreActions.transferUSDTToEVM(0, executorAddress)
                    break

                case "repay usdt":
                    console.log("Repaying USDT debt...")
                    if (strategyId?.includes("hyperlend")) {
                        await coreActions.closeLeveragePositionHyperlend("0xCOLLATERAL_ASSET", executorAddress)
                    } else if (strategyId?.includes("sentiment")) {
                        await coreActions.closeLeveragePositionSentiment(
                            "0xK_HYPE",
                            "0xPOSITION_ADDRESS",
                            "0xSENTIMENT_LENS_ADDRESS",
                            executorAddress
                        )
                    }
                    break

                case "close strategy":
                    console.log("Strategy closed successfully")
                    break

                case "borrow from sentiment":
                    console.log("Borrowing from Sentiment/Hyperlend...")
                    if (strategyId?.includes("hyperlend")) {
                        await coreActions.executeFullEvmFlowHyperlend("0xCOLLATERAL_ASSET", executorAddress)
                    } else if (strategyId?.includes("sentiment")) {
                        await coreActions.executeFullEvmFlowSentiment("0xVAULT_ADDRESS", "0xPOSITION_ADDRESS", executorAddress)
                    }
                    break

                case "transfer to core":
                    console.log("Transfer to core completed in previous step")
                    break

                case "swap to usdc":
                    console.log("Swapping USDT to USDC...")
                    await coreActions.handleUsdtToUsdcSwap(0, executorAddress)
                    break

                case "transfer to perps":
                    console.log("Transferring USDC to perps...")
                    await coreActions.transferUSDCToPerp(0, executorAddress)
                    break

                default:
                    console.warn(`Unknown step: ${stepLabel}`)
                    await new Promise((resolve) => setTimeout(resolve, 1500))
            }

            return { success: true, txHash }
        } catch (error: any) {
            console.error(`Error executing ${stepLabel}:`, error)
            return {
                success: false,
                error: error?.message || "Transaction failed",
            }
        }
    }

    const processSteps = async () => {
        const stepTemplates = getStepTemplates()
        const initialSteps: ProcessStep[] = stepTemplates.map((step) => ({
            ...step,
            status: "pending",
        }))

        setSteps(initialSteps)
        setIsComplete(false)
        setHasFailed(false)
        setIsProcessing(true)

        for (let i = 0; i < initialSteps.length; i++) {
            if (abortRef.current) break

            // Set step to processing
            setSteps((prev) => {
                const updated = [...prev]
                updated[i] = { ...updated[i], status: "processing" }
                return updated
            })

            // Execute the actual transaction
            const result = await executeStepFunction(initialSteps[i].label)

            if (abortRef.current) break

            if (result.success) {
                // Mark as completed
                setSteps((prev) => {
                    const updated = [...prev]
                    updated[i] = {
                        ...updated[i],
                        status: "completed",
                        txHash: result.txHash,
                    }
                    return updated
                })

                // Wait a bit before next step
                await new Promise((resolve) => setTimeout(resolve, 800))
            } else {
                // Mark as failed
                setSteps((prev) => {
                    const updated = [...prev]
                    updated[i] = {
                        ...updated[i],
                        status: "failed",
                        error: result.error,
                    }
                    return updated
                })
                setHasFailed(true)
                setIsProcessing(false)
                return
            }
        }

        if (!abortRef.current) {
            setIsComplete(true)
        }
        setIsProcessing(false)
    }

    useEffect(() => {
        if (!isOpen) {
            setSteps([])
            setIsComplete(false)
            setHasFailed(false)
            setIsProcessing(false)
            abortRef.current = false
            return
        }

        abortRef.current = false
        processSteps()

        return () => {
            abortRef.current = true
        }
    }, [isOpen, actionType, rebalancingType])

    if (!isOpen) return null

    const getTitle = () => {
        if (actionType === "close") return "Close Strategy"
        if (rebalancingType === "upside") return "Upside Rebalancing"
        return "Downside Rebalancing"
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isProcessing) {
            onClose()
        }
    }

    const handleClose = () => {
        if (!isProcessing) {
            onClose()
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="relative bg-[#0D1515] border border-[#1A2323] rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
                <button
                    onClick={handleClose}
                    className={`absolute top-4 right-4 z-10 transition-all ${
                        isProcessing
                            ? "text-[#3A4A4A] cursor-not-allowed opacity-50"
                            : "text-[#7E8F89] hover:text-[#E6FFF6] cursor-pointer"
                    }`}
                >
                    <FiX size={24} />
                </button>

                <h2 className="text-xl font-semibold text-center pr-8">{getTitle()}</h2>

                <div className="space-y-3">
                    {steps.map((step) => (
                        <div key={step.id} className="flex items-start gap-3 p-3 rounded-xl border border-[#1A2323] bg-[#0B1212]">
                            <div className="flex-shrink-0 mt-0.5">
                                {step.status === "completed" ? (
                                    <div className="w-5 h-5 rounded-full bg-[#00FFB2] flex items-center justify-center">
                                        <FiCheck className="text-[#0D1515]" size={14} />
                                    </div>
                                ) : step.status === "failed" ? (
                                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                        <FiX className="text-white" size={14} />
                                    </div>
                                ) : step.status === "processing" ? (
                                    <div className="w-5 h-5 rounded-full border-2 border-[#00FFB2] border-t-transparent animate-spin" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-[#2A3A3A]" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm capitalize">{step.label}</p>
                                {step.txHash && <p className="text-xs text-[#7E8F89] mt-1 truncate">Tx: {step.txHash}</p>}
                                {step.error && <p className="text-xs text-red-400 mt-1">{step.error}</p>}
                            </div>
                        </div>
                    ))}
                </div>

                {isComplete && (
                    <div className="pt-2 space-y-3">
                        <div className="text-center py-3 rounded-xl bg-[#00FFB2]/10 border border-[#00FFB2]/30">
                            <p className="text-[#00FFB2] font-medium">
                                {actionType === "close" ? "Close Strategy Successful" : "Rebalance Successful"}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl bg-[#00FFB2] text-[#0D1515] font-semibold hover:bg-[#00E6A0] transition-colors"
                        >
                            Done
                        </button>
                    </div>
                )}

                {hasFailed && !isComplete && (
                    <div className="pt-2 space-y-3">
                        <div className="text-center py-3 rounded-xl bg-red-500/10 border border-red-500/30">
                            <p className="text-red-400 font-medium">Transaction Failed</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl bg-[#2A3A3A] text-white font-semibold hover:bg-[#3A4A4A] transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}

                {!isComplete && !hasFailed && isProcessing && (
                    <p className="text-center text-sm text-[#7E8F89]">Processing transactions... Please wait</p>
                )}
            </div>
        </div>
    )
}
