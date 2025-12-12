import React, { useEffect, useState, useRef } from "react"
import { FiCheck, FiX } from "react-icons/fi"
import type { ProcessStep, ActionType, RebalancingType } from "../types"

interface ProcessingModalProps {
    isOpen: boolean
    onClose: () => void
    actionType: ActionType
    rebalancingType: RebalancingType
}

const UPSIDE_STEPS: Omit<ProcessStep, "status">[] = [
    { id: "1", label: "borrow from Sentiment" },
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
    { id: "1", label: "Close Hype Short" },
    { id: "2", label: "transfer usdc to spot" },
    { id: "3", label: "swap to usdt" },
    { id: "4", label: "transfer to evm" },
    { id: "5", label: "repay usdt" },
    { id: "6", label: "close strategy" },
]

export const ProcessingModal: React.FC<ProcessingModalProps> = ({ isOpen, onClose, actionType, rebalancingType }) => {
    const getStepTemplates = (): Omit<ProcessStep, "status">[] => {
        if (actionType === "close") return CLOSE_STEPS
        if (rebalancingType === "upside") return UPSIDE_STEPS
        return DOWNSIDE_STEPS
    }

    const [steps, setSteps] = useState<ProcessStep[]>([])
    const [isComplete, setIsComplete] = useState(false)
    const timeoutRefs = useRef<NodeJS.Timeout[]>([])
    const currentIndexRef = useRef<number>(0)

    useEffect(() => {
        if (!isOpen) {
            setSteps([])
            setIsComplete(false)
            currentIndexRef.current = 0
            timeoutRefs.current.forEach((timer) => clearTimeout(timer))
            timeoutRefs.current = []
            return
        }

        const stepTemplates = getStepTemplates()
        const initialSteps: ProcessStep[] = stepTemplates.map((step) => ({
            ...step,
            status: "pending",
        }))

        setSteps(initialSteps)
        setIsComplete(false)
        currentIndexRef.current = 0

        const processNextStep = () => {
            const stepIndex = currentIndexRef.current

            if (stepIndex >= initialSteps.length) {
                setIsComplete(true)
                return
            }

            setSteps((prev) => {
                const updated = [...prev]
                updated[stepIndex] = { ...updated[stepIndex], status: "processing" }
                return updated
            })

            const completeTimer = setTimeout(() => {
                setSteps((prev) => {
                    const updated = [...prev]
                    updated[stepIndex] = { ...updated[stepIndex], status: "completed" }
                    return updated
                })

                currentIndexRef.current++
                if (currentIndexRef.current < initialSteps.length) {
                    const nextTimer = setTimeout(processNextStep, 800)
                    timeoutRefs.current.push(nextTimer)
                } else {
                    setIsComplete(true)
                }
            }, 1500)

            timeoutRefs.current.push(completeTimer)
        }

        const startTimer = setTimeout(processNextStep, 500)
        timeoutRefs.current.push(startTimer)

        return () => {
            timeoutRefs.current.forEach((timer) => clearTimeout(timer))
            timeoutRefs.current = []
        }
    }, [isOpen, actionType, rebalancingType])

    if (!isOpen) return null

    const getTitle = () => {
        if (actionType === "close") return "Close Strategy"
        if (rebalancingType === "upside") return "Upside Rebalancing"
        return "Downside Rebalancing"
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-[#0B1212] rounded-3xl border border-white/10 p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">{getTitle()}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer hover:bg-white/10 rounded-full p-1"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3 mb-6">
                    {steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                {step.status === "completed" ? (
                                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <FiCheck className="w-4 h-4 text-white" />
                                    </div>
                                ) : step.status === "processing" ? (
                                    <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-gray-500" />
                                )}
                            </div>
                            <span
                                className={`text-sm ${
                                    step.status === "completed"
                                        ? "text-emerald-300"
                                        : step.status === "processing"
                                          ? "text-emerald-400"
                                          : "text-gray-400"
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>

                {isComplete && (
                    <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 text-emerald-400 font-medium">
                            <FiCheck className="w-5 h-5" />
                            <span>{actionType === "close" ? "Close Strategy Successful" : "Rebalance Successful"}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
