import { useAccount, useWalletClient } from "wagmi"
import { waitForTransactionReceipt } from "viem/actions"
import { useCallback } from "react"
import {  
  EXECUTOR_ADDRESS,
  K_HYPE,
  USDT,
  W_HYPE
} from "../config/constants"
import { 
  DELPHO_SENTIMENT_EXECUTOR_ABI,
  DELPHO_HYPER_LEND_EXECUTOR_ABI,
  SENTIMENT_LENS_ABI,
  HYPERLEND_ABI,
  DELPHO_VAULT_ABI
} from "../config/Abi.ts"
import { 
  truncate,
  calculatePriceWithSlippage,
  wait,
  calculateBorrowAmountRaw,
} from "../utils/helper.ts"
import { createHyperliquidClient, type ClearinghouseState, type TokenDetails } from "../utils/hyperliquid.ts"
import { publicClient, getERC20Balance, getERC20BalanceParsed } from "../utils/balance.ts"
import { getGlueXQuote , getTokenPrice} from "../utils/GlueX.ts"

export function useCoreActions() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const hyperliquid = createHyperliquidClient({ testnet: false })

  // Basic Hyperliquid functions
  const transferToEVM = useCallback(
    async (amount?: bigint, executorAddress: string = EXECUTOR_ADDRESS) => {
      if (!walletClient || !address) throw new Error("Wallet not connected")

      const args = amount ? [amount] : []
      const tx = await walletClient.writeContract({
        address: executorAddress as `0x${string}`,
        abi: DELPHO_SENTIMENT_EXECUTOR_ABI,
        functionName: "transferUSDT2Core",
        args,
        account: address,
      })
      
      await waitForTransactionReceipt(walletClient, { hash: tx })
      return tx
    },
    [address, walletClient]
  )

  const handleUsdtToUsdcSwap = useCallback(async (swapAmount: number, executorAddress: string = EXECUTOR_ADDRESS): Promise<boolean> => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    
    const usdtBalance = truncate(Number(swapAmount))

    if (Number.isNaN(usdtBalance) || usdtBalance <= 0) {
      console.log("No USDT balance found, skipping swap")
      return false
    }

    const usdcDetails = await hyperliquid.getTokenDetailsByName("USDC") as TokenDetails
    const usdtPrice = truncate((await hyperliquid.getAssetPrice("USDT0", false)) as number)
    if (!usdtPrice) throw new Error("Could not fetch USDT price")

    const priceWithSlippage = truncate(calculatePriceWithSlippage(usdtPrice, 0.01, false))
    const parsedPrice = BigInt(Math.floor(priceWithSlippage * 10 ** usdcDetails.szDecimals))
    const parsedSize = BigInt(Math.floor(usdtBalance * 10 ** usdcDetails.szDecimals))

    const tx = await walletClient.writeContract({
      address: executorAddress as `0x${string}`,
      abi: DELPHO_SENTIMENT_EXECUTOR_ABI,
      functionName: "swapUSDT2USDC",
      args: [false, parsedPrice, parsedSize],
      account: address,
    })
    
    await waitForTransactionReceipt(walletClient, { hash: tx })
    return true
  }, [walletClient, address, hyperliquid])

  const transferUSDCToPerp = useCallback(async (amount: number, executorAddress: string = EXECUTOR_ADDRESS): Promise<boolean> => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    
    const usdcBalance = truncate(Number(amount))
    const decimals = 6
    const parsedAmount = BigInt(Math.floor(usdcBalance * 10 ** decimals))

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0n) {
      console.log("No USDC balance found, skipping transfer")
      return false
    }

    const tx = await walletClient.writeContract({
      address: executorAddress as `0x${string}`,
      abi: DELPHO_SENTIMENT_EXECUTOR_ABI,
      functionName: "transferUSDCFromSpotToPerp",
      args: [parsedAmount, true],
      account: address,
    })
    
    await waitForTransactionReceipt(walletClient, { hash: tx })
    return true
  }, [walletClient, address])

  const openHypeShort = useCallback(async (amount: number, leverage: number = 4, executorAddress: string = EXECUTOR_ADDRESS): Promise<boolean> => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    
    const hypePrice = await hyperliquid.getAssetPrice("HYPE", true)
    if (!hypePrice) throw new Error("Could not fetch HYPE price")

    const hypePriceWithSlippage = truncate(calculatePriceWithSlippage(hypePrice, 0.01, false))
    const perpBalance = Number(amount)

    if (Number.isNaN(perpBalance) || perpBalance <= 0) {
      throw new Error("Perp withdrawable balance is zero or invalid")
    }

    const positionSize = perpBalance * leverage
    const usdcDetails = await hyperliquid.getTokenDetailsByName("USDC") as TokenDetails

    const limitPx = BigInt(Math.floor(hypePriceWithSlippage * 10 ** usdcDetails.szDecimals))
    const sizeUnits = truncate(positionSize / hypePrice)
    const sz = BigInt(Math.floor(sizeUnits * 10 ** usdcDetails.szDecimals))

    const tx = await walletClient.writeContract({
      address: executorAddress as `0x${string}`,
      abi: DELPHO_SENTIMENT_EXECUTOR_ABI,
      functionName: "openHypeShort",
      args: [false, limitPx, sz],
      account: address,
    })
    
    await waitForTransactionReceipt(walletClient, { hash: tx })
    return true
  }, [walletClient, address, hyperliquid])

  const closeHypeShort = useCallback(async (size: number, executorAddress: string = EXECUTOR_ADDRESS): Promise<boolean> => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    
    try {
      const hypePrice = await hyperliquid.getAssetPrice("HYPE", true)
      if (hypePrice === null || hypePrice === undefined) throw new Error("Could not fetch HYPE price")

      const hypePriceWithSlippage = truncate(calculatePriceWithSlippage(hypePrice, 0.01, true))
      const usdcDetails = await hyperliquid.getTokenDetailsByName("USDC") as TokenDetails
      
      if (!usdcDetails?.szDecimals && usdcDetails?.szDecimals !== 0) {
        throw new Error("Missing USDC decimals in asset info")
      }

      const limitPx = BigInt(Math.floor(hypePriceWithSlippage * 10 ** usdcDetails.szDecimals))
      const positionSize = Math.abs(size)
      const sz = BigInt(Math.floor(positionSize * 10 ** usdcDetails.szDecimals))

      const tx = await walletClient.writeContract({
        address: executorAddress as `0x${string}`,
        abi: DELPHO_SENTIMENT_EXECUTOR_ABI,
        functionName: "closeHypeShort",
        args: [limitPx, sz],
        account: address,
      })
      
      await waitForTransactionReceipt(walletClient, { hash: tx })
      return true
    } catch (err) {
      console.error("Error in closeHypeShortPosition:", err)
      throw err
    }
  }, [walletClient, address, hyperliquid])

  const transferUSDCToSpot = useCallback(async (amount: number, executorAddress: string = EXECUTOR_ADDRESS): Promise<boolean> => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    
    try {
      amount = truncate(amount)
      const decimals = 6
      const parsedAmount = BigInt(Math.floor(amount * 10 ** decimals))

      if (parsedAmount <= 0n) {
        console.log("No USDC balance in perp, skipping transfer")
        return false
      }

      const tx = await walletClient.writeContract({
        address: executorAddress as `0x${string}`,
        abi: DELPHO_SENTIMENT_EXECUTOR_ABI,
        functionName: "transferUSDCFromSpotToPerp",
        args: [parsedAmount, false],
        account: address,
      })
      
      await waitForTransactionReceipt(walletClient, { hash: tx })
      return true
    } catch (err) {
      console.error("Error in transferUsdcToSpot:", err)
      throw err
    }
  }, [walletClient, address])

  const swapUSDCToUSDT = useCallback(async (amount: number, executorAddress: string = EXECUTOR_ADDRESS): Promise<boolean> => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    
    try {
      const usdcBalance = truncate(amount)
      
      if (isNaN(usdcBalance) || usdcBalance <= 0) {
        console.log("No USDC balance found, skipping swap")
        return false
      }

      const usdcDetails = await hyperliquid.getTokenDetailsByName("USDC") as TokenDetails
      if (!usdcDetails?.szDecimals && usdcDetails?.szDecimals !== 0) {
        throw new Error("Missing USDC decimals in asset info")
      }

      const usdcPrice = await hyperliquid.getAssetPrice("USDC", false)
      if (usdcPrice === null || usdcPrice === undefined) throw new Error("Could not fetch USDC price")

      const priceWithSlippage = truncate(calculatePriceWithSlippage(usdcPrice, 0.01, true))
      const parsedPrice = BigInt(Math.floor(priceWithSlippage * 10 ** usdcDetails.szDecimals))
      const parsedSize = BigInt(Math.floor(usdcBalance * 10 ** usdcDetails.szDecimals))

      const tx = await walletClient.writeContract({
        address: executorAddress as `0x${string}`,
        abi: DELPHO_SENTIMENT_EXECUTOR_ABI,
        functionName: "swapUSDT2USDC",
        args: [true, parsedPrice, parsedSize],
        account: address,
      })
      
      await waitForTransactionReceipt(walletClient, { hash: tx })
      return true
    } catch (err) {
      console.error("Error in swapUsdcToUsdt:", err)
      throw err
    }
  }, [walletClient, address, hyperliquid])

  const transferUSDTToEVM = useCallback(async (amount: number, executorAddress: string = EXECUTOR_ADDRESS): Promise<boolean> => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    
    try {
      const usdtBalance = truncate(amount)
      
      if (isNaN(usdtBalance) || usdtBalance <= 0) {
        console.log("No USDT balance found, skipping transfer")
        return false
      }

      const usdtDetails = await hyperliquid.getTokenDetailsByName("USDT0") as TokenDetails
      if (!usdtDetails?.weiDecimals && usdtDetails?.weiDecimals !== 0) {
        throw new Error("Missing USDT weiDecimals in asset info")
      }

      const weiAmount = BigInt(Math.floor(usdtBalance * 10 ** usdtDetails.weiDecimals))

      const tx = await walletClient.writeContract({
        address: executorAddress as `0x${string}`,
        abi: DELPHO_SENTIMENT_EXECUTOR_ABI,
        functionName: "transferUSDT2Core",
        args: [weiAmount],
        account: address,
      })
      
      await waitForTransactionReceipt(walletClient, { hash: tx })
      return true
    } catch (err) {
      console.error("Error in transferUsdtToEvm:", err)
      throw err
    }
  }, [walletClient, address, hyperliquid])

  // Hyperlend Functions
  const executeFullEvmFlowHyperlend = useCallback(async (
    collateralAsset: string,
    executorAddress: string
  ): Promise<boolean> => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    
    const tx = await walletClient.writeContract({
      address: executorAddress as `0x${string}`,
      abi: DELPHO_HYPER_LEND_EXECUTOR_ABI,
      functionName: "executeFullEvmFlow",
      args: [collateralAsset, 0, 0],
      account: address,
    })
    
    const receipt = await waitForTransactionReceipt(walletClient, { hash: tx })
    console.log("executeFullEvmFlow tx:", receipt.blockHash)
    return true
  }, [walletClient, address])

  const closeLeveragePositionHyperlend = useCallback(async (
    asset: string,
    executorAddress: string
  ): Promise<boolean> => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    
    try {
      console.log("Step 6: Closing leverage position...")

      const tx = await walletClient.writeContract({
        address: executorAddress as `0x${string}`,
        abi: DELPHO_HYPER_LEND_EXECUTOR_ABI,
        functionName: "closeLeveragePosition",
        args: [asset, 0, 0, "0x"],
        account: address,
      })
      
      const receipt = await waitForTransactionReceipt(walletClient, { hash: tx })
      console.log("closeLeveragePosition tx:", receipt.blockHash)
      console.log("Unwind flow executed successfully!")
      return true
    } catch (err) {
      console.error("Error in closeLeveragePosition:", (err))
      throw err
    }
  }, [walletClient, address])

  const partialClosePositionHyperlend = useCallback(async (
    asset: string,
    khypeWithdrawAmount: bigint,
    executorAddress: string
  ): Promise<boolean> => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    
    try {
      console.log("Starting Partial Close Position...")

      const tx = await walletClient.writeContract({
        address: executorAddress as `0x${string}`,
        abi: DELPHO_HYPER_LEND_EXECUTOR_ABI,
        functionName: "partialClosePosition",
        args: [asset, khypeWithdrawAmount],
        account: address,
      })
      
      console.log("partial Close tx:", tx)
      await waitForTransactionReceipt(walletClient, { hash: tx })
      console.log("Partial Close Executed successfully!")
      return true
    } catch (err) {
      console.error("Error in partialClosePosition:", (err))
      throw err
    }
  }, [walletClient, address])

  // Helper function for Hyperlend
  const calculatePartialCloseAmountsHyperlend = useCallback(async (
    asset: string,
    executorAddress: string,
    hyperLendAddress: string,
    khypeWithdrawAmount: bigint
  ): Promise<{ coreSizeToRemove: number; hyperlendPositionToRemove: bigint }> => {
    try {
      const executorKHypeBalance = await getERC20BalanceParsed(asset, executorAddress)
      console.log("Executor asset Balance Before Partial Close: ", executorKHypeBalance)

      const collateralAmount = await publicClient.readContract({
        address: hyperLendAddress as `0x${string}`,
        abi: HYPERLEND_ABI,
        functionName: "getUserAccountData",
        args: [executorAddress],
      }).then((data: any) => data.totalCollateralBase)

      console.log("Current Hyperlend Collateral:", collateralAmount.toString())

      let hyperlendPositionToRemove = (khypeWithdrawAmount * 15000n) / 10000n
      console.log("Hyperlend Position to Remove: ", hyperlendPositionToRemove.toString())

      if (hyperlendPositionToRemove > collateralAmount) {
        hyperlendPositionToRemove = collateralAmount
      }
      console.log("Final Hyperlend Position to Remove: ", hyperlendPositionToRemove.toString())

      const corePositions = await hyperliquid.getPerpPositions(executorAddress) as ClearinghouseState
      const corePosition = corePositions.assetPositions[0].position
      console.log(`Core Position: ${JSON.stringify(corePosition)}`)

      const corePositionSize = Math.abs(Number(corePosition.szi))
      console.log("Core Position Size: ", corePositionSize.toString())

      let coreSizeToRemove = truncate(Number(hyperlendPositionToRemove) / (10 ** 18) / 3)
      console.log("Core Size to Remove: ", coreSizeToRemove.toString())

      if (coreSizeToRemove > corePositionSize) {
        coreSizeToRemove = Number(corePositionSize)
      }

      console.log("Final Core Size to Remove: ", coreSizeToRemove.toString())

      return {
        coreSizeToRemove: coreSizeToRemove,
        hyperlendPositionToRemove: hyperlendPositionToRemove,
      }
    } catch (err) {
      console.error("Failed to calculate Amounts:", (err))
      throw err
    }
  }, [hyperliquid])

  // Sentiment Functions
  const executeFullEvmFlowSentiment = useCallback(async (
    vaultAddress: string,
    positionAddress: string,
    executorAddress: string
  ): Promise<boolean> => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    
    const collateralAsset = K_HYPE

    const KHypeBalance = await publicClient.readContract({
      address: vaultAddress as `0x${string}`,
      abi: DELPHO_VAULT_ABI,
      functionName: "fundsForExecutor",
      args: [collateralAsset],
    })

    console.log("K-HYPE Started", KHypeBalance)

    const extraExposureUSD = await calculateBorrowAmountRaw(KHypeBalance as bigint)
    console.log("USDT to be Borrowed For Leverage:", extraExposureUSD)

    const finalKhype = ((KHypeBalance as bigint) * 15000n) / 10000n
    console.log("K-HYPE Needed For Leverage:", finalKhype.toString())

    const kHypeNeed = finalKhype - (KHypeBalance as bigint)

    const quoteResult = await getGlueXQuote({
      inputToken: USDT,
      outputToken: collateralAsset,
      outputAmount: kHypeNeed.toString(),
      userAddress: positionAddress,
      orderType: "BUY",
    })

    console.log("effectiveInputAmount", quoteResult.effectiveInputAmount)
    console.log("effectiveOutputAmount", quoteResult.effectiveOutputAmount)
    console.log("SwapData", quoteResult.calldata)

    const effectiveInputAmount = BigInt(quoteResult.effectiveInputAmount || "0")

    const tx = await walletClient.writeContract({
      address: executorAddress as `0x${string}`,
      abi: DELPHO_SENTIMENT_EXECUTOR_ABI,
      functionName: "executeFullEvmFlow",
      args: [effectiveInputAmount, quoteResult.calldata],
      account: address,
    })
    
    const receipt = await waitForTransactionReceipt(walletClient, { hash: tx })
    console.log("executeFullEvmFlow tx:", receipt.blockHash)

    console.log("executeFullEvmFlow confirmed")
    const positionAddressKHypeBalance = await getERC20Balance(collateralAsset, positionAddress)
    console.log("Long Position Opened: ", positionAddressKHypeBalance)
    console.log("KHype Borrowed", (BigInt(positionAddressKHypeBalance) * 10n ** 18n) - (KHypeBalance as bigint))

    return true
  }, [walletClient, address])

  const closeLeveragePositionSentiment = useCallback(async (
    asset: string,
    positionAddress: string,
    sentimentLensAddress: string,
    executorAddress: string
  ): Promise<boolean> => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    
    try {
      console.log("Step 6: Closing leverage position...")

      const hypePrice = await getTokenPrice(W_HYPE)
      const kHypePrice = await getTokenPrice(asset)

      console.log("HYPE/USD", hypePrice)
      const k_hypePriceUsd = BigInt(Math.floor(kHypePrice * 10 ** 6))
      console.log("K-HYPE/USD", kHypePrice)

      const debts = await publicClient.readContract({
        address: sentimentLensAddress as `0x${string}`,
        abi: SENTIMENT_LENS_ABI,
        functionName: "getDebtData",
        args: [positionAddress],
      })
      
      const debtAmount = (debts as any[])[0]?.amount || 0n
      console.log("USDT To Repay:", debtAmount.toString())

      const usdt6Decimals = debtAmount
      const usdtExecutorBalance = await getERC20Balance(USDT, executorAddress)
      const usdtExecutorBalanceParsed = BigInt(usdtExecutorBalance) * 10n ** 18n

      console.log("USDT from Core", usdtExecutorBalanceParsed)

      let amountUsdtToRepay = usdt6Decimals + 100n
      const usdt18 = amountUsdtToRepay * 10n ** 18n
      const hypeAmountToRepay = usdt18 / k_hypePriceUsd

      console.log("Hype amount To Repay:", hypeAmountToRepay.toString())

      let quoteResult = await getGlueXQuote({
        inputToken: asset,
        outputToken: USDT,
        outputAmount: amountUsdtToRepay.toString(),
        userAddress: positionAddress,
        orderType: "BUY",
      })

      let attempts = 0
      const maxAttempts = 5

      while (Number(quoteResult.effectiveInputAmount) < Number(debtAmount) && attempts < maxAttempts) {
        await wait(5000)
        attempts++
        console.log(`Attempt ${attempts}: effectiveInputAmount (${quoteResult.effectiveInputAmount}) < debtAmount (${debtAmount})`)
        console.log("Fetching fresh debt and getting new quote...")

        // Update the amount to repay based on fresh debt with buffer
        const freshDebts = await publicClient.readContract({
          address: sentimentLensAddress as `0x${string}`,
          abi: SENTIMENT_LENS_ABI,
          functionName: "getDebtData",
          args: [positionAddress],
        })
        
        const freshDebtAmount = (freshDebts as any[])[0]?.amount || 0n
        amountUsdtToRepay = freshDebtAmount + 100n
        console.log("Updated USDT To Repay:", amountUsdtToRepay.toString())

        quoteResult = await getGlueXQuote({
          inputToken: asset,
          outputToken: USDT,
          outputAmount: amountUsdtToRepay.toString(),
          userAddress: positionAddress,
          orderType: "BUY",
        })

        console.log("New effectiveInputAmount:", quoteResult.effectiveInputAmount)
      }

      if (attempts >= maxAttempts) {
        throw new Error(`Failed to get sufficient quote after ${maxAttempts} attempts`)
      }

      const K_hypeBalanceExecutorBalance = await getERC20Balance(asset, positionAddress)
      console.log("asset Position:", K_hypeBalanceExecutorBalance)

      const tx = await walletClient.writeContract({
        address: executorAddress as `0x${string}`,
        abi: DELPHO_SENTIMENT_EXECUTOR_ABI,
        functionName: "closeLeveragePosition",
        args: [asset, 0, 0, quoteResult.calldata],
        account: address,
      })
      
      const receipt = await waitForTransactionReceipt(walletClient, { hash: tx })
      console.log("closeLeveragePosition tx:", receipt.blockHash)
      console.log("Unwind flow executed successfully!")

      return true
    } catch (err) {
      console.error("Error in closeLeveragePosition:", (err))
      throw err
    }
  }, [walletClient, address])

  const calculatePartialCloseAmountsSentiment = useCallback(async (
    asset: string,
    executorAddress: string,
    positionAddress: string,
    sentimentLensAddress: string,
    khypeWithdrawAmount: bigint
  ): Promise<{ coreSizeToRemove: number; sentimentPositionToRemove: bigint; debtToRepay: bigint }> => {
    try {
      const executorKHypeBalance = await getERC20BalanceParsed(asset, executorAddress)
      console.log("Executor K-HYPE Balance Before Partial Close: ", executorKHypeBalance)

      const assetData = await publicClient.readContract({
        address: sentimentLensAddress as `0x${string}`,
        abi: SENTIMENT_LENS_ABI,
        functionName: "getAssetData",
        args: [positionAddress],
      })
      
      const collateralAmount = (assetData as any[])[0]?.amount || 0n

      const debtData = await publicClient.readContract({
        address: sentimentLensAddress as `0x${string}`,
        abi: SENTIMENT_LENS_ABI,
        functionName: "getDebtData",
        args: [positionAddress],
      })
      
      const debtAmount = (debtData as any[])[0]?.amount || 0n

      console.log("Current Sentiment Collateral:", collateralAmount.toString())
      console.log("Current Sentiment Debt:", debtAmount.toString())

      let sentimentPositionToRemove = (khypeWithdrawAmount * 15000n) / 10000n
      console.log("Sentiment Position to Remove: ", sentimentPositionToRemove.toString())

      if (sentimentPositionToRemove > collateralAmount) {
        sentimentPositionToRemove = collateralAmount
      }
      console.log("Final Sentiment Position to Remove: ", sentimentPositionToRemove.toString())

      const debtToRepay = (sentimentPositionToRemove * debtAmount) / collateralAmount
      console.log("Debt to Repay: ", debtToRepay.toString())

      const corePositions = await hyperliquid.getPerpPositions(executorAddress) as ClearinghouseState
      const corePosition = corePositions.assetPositions[0]
      console.log(`Core Position: ${JSON.stringify(corePosition)}`)

      const corePositionSize = Math.abs(Number(corePosition.position.szi))
      console.log("Core Position Size: ", corePositionSize.toString())

      let coreSizeToRemove = truncate(Number(sentimentPositionToRemove) / (10 ** 18) / 3)
      console.log("Core Size to Remove: ", coreSizeToRemove.toString())

      if (coreSizeToRemove > corePositionSize) {
        coreSizeToRemove = Number(corePositionSize)
      }

      console.log("Final Core Size to Remove: ", coreSizeToRemove.toString())

      return {
        coreSizeToRemove: coreSizeToRemove,
        sentimentPositionToRemove: sentimentPositionToRemove,
        debtToRepay: debtToRepay,
      }
    } catch (err) {
      console.error("Failed to calculate Amounts:", (err))
      throw err
    }
  }, [])

  const repayUSDTSentiment = useCallback(async (
    amount: bigint = 0n,
    executorAddress: string
  ): Promise<boolean> => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    
    try {
      if (amount === 0n) {
        amount = await getERC20BalanceParsed(USDT, executorAddress)
      }

      console.log("Executor USDT Balance: ", amount)

      const tx = await walletClient.writeContract({
        address: executorAddress as `0x${string}`,
        abi: DELPHO_SENTIMENT_EXECUTOR_ABI,
        functionName: "partialClosePosition",
        args: [amount, 0, "0x"],
        account: address,
      })
      
      await waitForTransactionReceipt(walletClient, { hash: tx })
      return true
    } catch (err) {
      console.error("Error in partialClosePosition:", (err))
      throw err
    }
  }, [walletClient, address])

  const partialClosePositionSentiment = useCallback(async (
    positionAddress: string,
    debtAmount: bigint,
    khypeWithdrawAmount: bigint,
    executorAddress: string
  ): Promise<boolean> => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    
    try {
      console.log("Starting Partial Close Position...")

      const collateralAsset = K_HYPE

      const hypePrice = await getTokenPrice(W_HYPE)
      const kHypePrice = await getTokenPrice(collateralAsset)

      console.log("HYPE/USD", hypePrice)
      console.log("K-HYPE/USD", kHypePrice)

      console.log("USDT To Repay:", debtAmount.toString())

      const usdt6Decimals = debtAmount
      const usdtExecutorBalance = await getERC20Balance(USDT, executorAddress)
      const usdtExecutorBalanceParsed = BigInt(usdtExecutorBalance) * 10n ** 18n

      console.log("USDT from Core", usdtExecutorBalanceParsed)

      const extra = 100n
      const amountUsdtToRepay = usdt6Decimals - usdtExecutorBalanceParsed + extra

      const quoteResult = await getGlueXQuote({
        inputToken: collateralAsset,
        outputToken: USDT,
        outputAmount: amountUsdtToRepay.toString(),
        userAddress: positionAddress,
        orderType: "BUY",
      })

      const K_hypeBalanceExecutorBalance = await getERC20Balance(collateralAsset, positionAddress)
      console.log("K_HYPE Position:", K_hypeBalanceExecutorBalance)

      const tx = await walletClient.writeContract({
        address: executorAddress as `0x${string}`,
        abi: DELPHO_SENTIMENT_EXECUTOR_ABI,
        functionName: "partialClosePosition",
        args: [debtAmount, khypeWithdrawAmount, quoteResult.calldata],
        account: address,
      })
      
      console.log("partial Close tx:", tx)
      await waitForTransactionReceipt(walletClient, { hash: tx })
      console.log("Partial Close Executed successfully!")

      return true
    } catch (err) {
      console.error("Error in partialClosePosition:", (err))
      throw err
    }
  }, [walletClient, address])

  return {
    transferToEVM,
    transferUSDCToSpot,
    transferUSDCToPerp,
    swapUSDCToUSDT,
    openHypeShort,
    transferUSDTToEVM,
    closeHypeShort,
    handleUsdtToUsdcSwap,

    // Hyperlend functions
    executeFullEvmFlowHyperlend,
    closeLeveragePositionHyperlend,
    partialClosePositionHyperlend,
    calculatePartialCloseAmountsHyperlend,

    // Sentiment functions
    executeFullEvmFlowSentiment,
    closeLeveragePositionSentiment,
    calculatePartialCloseAmountsSentiment,
    repayUSDTSentiment,
    partialClosePositionSentiment,
  }
}