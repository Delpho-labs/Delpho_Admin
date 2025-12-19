import { createPublicClient, http, parseAbi } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})

export async function getERC20Balance(tokenAddress: string, address: string): Promise<string> {
  const balance = await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  })
  return balance.toString()
}

export async function getERC20BalanceParsed(tokenAddress: string, address: string): Promise<bigint> {
  const balance = await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  })
  return balance as bigint
}