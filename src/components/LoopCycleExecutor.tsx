import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEvmActions } from "../hooks/useEvmActions";
import { parseUnits } from "viem";
import { useCoreActions } from "../hooks/useCoreActions";
import { useHyperliquid } from "../hooks/useHyperliquidData";
import { createHyperliquidClient } from "../utils/hyperliquid";
import { calculatePriceWithSlippage, getUserPerpWithdrawableBalance,getUserSpotBalance } from "../utils/helper";

const LoopCycleExecutor = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const { executeEvmFlow } = useEvmActions();
  const {
    swapUSDCToUSDT,
    transferUSDCToPerp,
    openHypePosition,
    
  } = useCoreActions();
  const { getSpotBalance,fetchCompleteState ,getUserState } = useHyperliquid();


  const executionSteps = [
    // EVM Flow Steps
    "Pulls HYPE from the vault",
    "Supplies 20% of HYPE to HyperLend",
    "Borrows 50% of supplied value in USDT",
    "Transfers borrowed USDT to core",
    "Remaining HYPE + flashloan to open a leveraged loop position",
    
    // Core Flow Steps
    "Swap USDT to USDC on Spot",
    "Transfer USDC to Perp Account",
    "Open Short Position on HYPE"
  ];

  const hyperliquid = createHyperliquidClient({ testnet: false });

  const executeCoreFlow = async () => {
    try {
      // Step 6: Swap USDT to USDC
      setCurrentStep(5);
      const usdtBalance = Number(getSpotBalance("USDT0")).toFixed(2);
      let tokenDetails = await hyperliquid.getTokenDetailsByName("USDC");
      if (!tokenDetails) throw new Error("Could not fetch USDT token details");

      let decimals = tokenDetails.szDecimals;
      let parsedSize = parseUnits(usdtBalance.toString(), decimals);
      const usdtPrice = await hyperliquid.getAssetPrice("USDT0", false);
      let price = calculatePriceWithSlippage(usdtPrice as number, 0.01, false); //1% slippage
    
      let parsedPrice = parseUnits(price.toString(), decimals);

      await swapUSDCToUSDT(false, parsedPrice, parsedSize);
      const { balances: postSwapBalances } = await getUserState();
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 7: Transfer USDC to Perp
      setCurrentStep(6);

      const usdcBalance = Number(getUserSpotBalance(postSwapBalances!,"USDC"));

      
      const truncatedAmount = Math.floor(Number(usdcBalance) * 100) / 100;
      const transferAmount = parseUnits(truncatedAmount.toFixed(2).toString(), 6); 
      await transferUSDCToPerp(transferAmount);
      const { positions: postTransferBalances } = await getUserState();

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 8: Open Short Position
      setCurrentStep(7);
      const perpBalance = Number(getUserPerpWithdrawableBalance(postTransferBalances!));


      const leverage = 4; // 4x leverage
      const positionSize = perpBalance * leverage;
   
      const hypePrice = await hyperliquid.getAssetPrice("HYPE", true);
      price = calculatePriceWithSlippage(hypePrice as number, 0.01, false); //1% slippage
      
      tokenDetails = await hyperliquid.getTokenDetailsByName("USDC");
      if (!price) throw new Error("Could not fetch HYPE price");
      if (!tokenDetails)
        throw new Error("Could not fetch HYPE token details");
      decimals = tokenDetails.szDecimals;
      parsedPrice = parseUnits(price.toFixed(2).toString(), decimals);
     
      const convertedSize = (positionSize/price).toFixed(2)
    
      parsedSize = parseUnits(
        convertedSize.toString(),
        decimals
      );

      await openHypePosition(
        false,
        parsedPrice,
        parsedSize
      );
      await fetchCompleteState();

      await new Promise(resolve => setTimeout(resolve, 1000));

      alert("Full loop cycle executed successfully!");
    } catch (error) {
      console.error("Core flow failed:", error);
      alert(
        `Core flow failed: ${error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      setCurrentStep(0);
    }
  };

  const executeFullLoopCycle = async () => {
    setIsLoading(true);
    setCurrentStep(0);
    setIsModalOpen(true);

    try {
      // Execute EVM Flow (steps 1-5)
      await executeEvmFlow();
      
      // Execute Core Flow (steps 6-8)
      await executeCoreFlow();
    } catch (error) {
      console.error("Full loop cycle failed:", error);
      alert(
        `Full loop cycle failed: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const ExecutionModal = () => {
    return (
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
            onClick={() => !isLoading && setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0B1212]/95 backdrop-blur-md border border-[#1A2323]/50 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-[#E6FFF6] mb-2">
                    Executing Full Loop Cycle
                  </h3>
                  <p className="text-[#A3B8B0] text-sm">
                    Please wait while the transaction is being processed...
                  </p>
                </div>

                {/* Animated Spinner */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#1A2323] rounded-full"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#00FFB2] rounded-full animate-spin border-t-transparent"></div>
                  </div>
                </div>

                {/* Execution Steps */}
                <div className="space-y-3">
                  {executionSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: index <= currentStep ? 1 : 0.3,
                        x: 0,
                      }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${index <= currentStep
                        ? "bg-[#1A2323] border border-[#00FFB2]/20"
                        : "bg-[#0B1212]"
                        }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < currentStep
                          ? "bg-[#00FFB2] text-[#0B1212]"
                          : index === currentStep
                            ? "bg-[#00FFB2] text-[#0B1212] animate-pulse"
                            : "bg-[#1A2323] text-[#A3B8B0]"
                          }`}
                      >
                        {index < currentStep ? "✓" : index + 1}
                      </div>
                      <span
                        className={`text-sm ${index <= currentStep
                          ? "text-[#E6FFF6]"
                          : "text-[#A3B8B0]"
                          }`}
                      >
                        {step}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {!isLoading && (
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="mt-6 px-6 py-3 bg-[#1A2323] text-[#E6FFF6] rounded-lg hover:bg-[#2A3333] transition-colors cursor-pointer font-medium"
                  >
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="bg-[#0B1212] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#E6FFF6]">
            Loop Cycle Executor
          </h2>
          <p className="text-[#A3B8B0] text-sm mt-1">
            Execute a full leveraged loop cycle with flashloan and position
            management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#00FFB2] rounded-full animate-pulse"></div>
          <span className="text-sm text-[#A3B8B0]">Ready</span>
        </div>
      </div>

      <div className="bg-[#0B1212] rounded-xl p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#E6FFF6]">
            Full Strategy Flow
          </h3>
          <p className="text-[#A3B8B0] text-sm">
            Automated execution of the complete leveraged loop cycle
          </p>
        </div>

        <div className="space-y-3">
          {executionSteps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-[#1A2323] flex items-center justify-center text-xs font-bold text-[#A3B8B0]">
                {index + 1}
              </div>
              <span className="text-sm text-[#E6FFF6]">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <motion.button
          onClick={executeFullLoopCycle}
          disabled={isLoading}
          className="px-6 py-3 bg-[#00FFB2] text-[#0B1212] rounded-lg font-semibold hover:bg-[#00E6A3] transition-colors disabled:opacity-50 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? "Executing..." : "Start Full Loop Cycle"}
        </motion.button>
      </div>

      <ExecutionModal />
    </div>
  );
};

export default LoopCycleExecutor;