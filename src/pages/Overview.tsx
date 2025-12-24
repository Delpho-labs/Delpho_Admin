import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../store"
import { setVaultData } from "../features/vaultSlice"
import HomeSidebar from "../components/HomeSidebar"
import TopNav from "../components/TopNav"
import { useVaultData } from "../hooks/useVaultData"

import { useUserData } from "../hooks/useUserData"
import { getTokenPrice } from "../utils/helper"
import type { Address } from "viem"
import { useUsersFromSubgraph } from "../hooks/useSubgraphDetails"

interface UserPositionRow {
    address: string
    totalCollateralValueUsd: number
    mintedUSDV: number
    stakedUSDV: number
    ltv: number
}

type UserPositionKey = "address" | "totalCollateralValueUsd" | "mintedUSDV" | "stakedUSDV" | "ltv"

const Overview: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const vaultState = useSelector((state: RootState) => state.vault)
    const { data: vaultData, isLoading, error } = useVaultData()

    useEffect(() => {
        if (vaultData) {
            dispatch(setVaultData(vaultData))
        }
    }, [vaultData, dispatch])

    const [tokenPrices, setTokenPrices] = React.useState<{ [address: string]: number }>({})

    useEffect(() => {
        const fetchTokenPrices = async () => {
            if (!vaultState.data) return

            const prices: { [address: string]: number } = {}
            for (const token of vaultState.data.tokensData) {
                try {
                    const price = await getTokenPrice(token.address)
                    prices[token.address] = price
                } catch (error) {
                    console.error(`Failed to fetch price for token ${token.address}:`, error)
                    prices[token.address] = 0
                }
            }
            setTokenPrices(prices)
        }

        fetchTokenPrices()
    }, [vaultState.data])

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return "$0.00"
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    const calculateTotalCollateralValue = () => {
        if (!vaultState.data || Object.keys(tokenPrices).length === 0) return 0

        return vaultState.data.tokensData.reduce((sum, token) => {
            const price = tokenPrices[token.address] || 0
            return sum + token.totalCollateral * price
        }, 0)
    }

    const calculateTotalAvailableForWithdrawal = () => {
        if (!vaultState.data || Object.keys(tokenPrices).length === 0) return 0

        return vaultState.data.tokensData.reduce((sum, token) => {
            const price = tokenPrices[token.address] || 0
            return sum + token.availableForWithdrawRequest * price
        }, 0)
    }

    const totalStrategies = 4
    const totalCollateralValue = calculateTotalCollateralValue()
    const totalAvailableForWithdrawal = calculateTotalAvailableForWithdrawal()

    return (
        <div className="min-h-screen flex bg-[#101616] text-[#E6FFF6]">
            <HomeSidebar />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-8">
                <TopNav title="Overview" />

                <section className="grid gap-4 md:grid-cols-4">
                    <OverviewCard
                        label="Total USDV Supply"
                        value={vaultState.data ? `${vaultState.data.dusdMinted.toFixed(2)} USDV` : "0.00 USDV"}
                    />
                    <OverviewCard
                        label="Total USDV Staked"
                        value={vaultState.data ? `${vaultState.data.totalStaked.toFixed(2)} USDV` : "0.00 USDV"}
                    />
                    <OverviewCard
                        label="Current Round"
                        value={vaultState.data ? `#${vaultState.data.currentRound}` : "#0"}
                        highlight
                    />
                    <OverviewCard label="Active Strategies" value={totalStrategies.toString()} />
                </section>

                <section>
                    <div className="bg-[#0B1212] rounded-3xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Collateral Overview</h2>
                                <p className="text-sm text-[#A3B8B0]">High-level view across supported collateral tokens.</p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E6FFF6]" />
                            </div>
                        ) : error ? (
                            <div className="rounded-xl bg-red-900/40 p-4 text-sm text-red-200">Error loading vault data</div>
                        ) : vaultState.data ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                <OverviewMetric
                                    label="Supported Tokens"
                                    value={vaultState.data.supportedTokens.length.toString()}
                                />
                                <OverviewMetric
                                    label="Staking Ratio"
                                    value={
                                        vaultState.data.dusdMinted > 0
                                            ? `${((vaultState.data.totalStaked / vaultState.data.dusdMinted) * 100).toFixed(2)}%`
                                            : "0.00%"
                                    }
                                />
                                <OverviewMetric label="Total Collateral Value" value={formatCurrency(totalCollateralValue)} />
                                <OverviewMetric
                                    label="Available for Withdrawal"
                                    value={formatCurrency(totalAvailableForWithdrawal)}
                                />
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                <OverviewMetric label="Supported Tokens" value="0" />
                                <OverviewMetric label="Staking Ratio" value="0.00%" />
                                <OverviewMetric label="Total Collateral Value" value="$0.00" />
                                <OverviewMetric label="Available for Withdrawal" value="$0.00" />
                            </div>
                        )}
                    </div>
                </section>

                <VaultUsersSection />

                <section>
                    <div className="bg-[#0B1212] rounded-3xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Strategy Overview</h2>
                            <span className="text-xs text-[#A3B8B0]">See details on the Strategies page</span>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <OverviewMetric label="Hype Programs" value="2 live" />
                            <OverviewMetric label="KHype Programs" value="2 live" />
                            <OverviewMetric label="Net Exposure" value="Balanced / Hedged" />
                            <OverviewMetric label="Execution Venue" value="HyperLiquid" />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

const OverviewCard: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
    <div className="rounded-3xl bg-[#0B1212] border border-[#1A2323] p-5 flex flex-col justify-between">
        <p className="text-xs uppercase tracking-wide text-[#A3B8B0] mb-2">{label}</p>
        <p className={`text-2xl font-semibold ${highlight ? "text-[#00FFB2]" : "text-[#E6FFF6]"}`}>{value}</p>
    </div>
)

const OverviewMetric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="rounded-2xl border border-[#1A2323] p-4">
        <p className="text-sm text-[#A3B8B0]">{label}</p>
        <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
)

const UserRow: React.FC<{ address: Address; onUserDataLoaded: (data: UserPositionRow | null) => void }> = ({
    address,
    onUserDataLoaded,
}) => {
    console.log(address, "address")

    const userData = useUserData(address)
    console.log(userData, "userData")

    React.useEffect(() => {
        if (!userData.isLoading && userData.userPosition) {
            const position = userData.userPosition
            onUserDataLoaded({
                address: address,
                totalCollateralValueUsd: Number(position.totalCollateralValueUsd),
                mintedUSDV: Number(position.borrowedAmount),
                stakedUSDV: Number(position.stakedBalance),
                ltv: Number(position.currentLtv),
            })
        } else if (!userData.isLoading && !userData.userPosition) {
            onUserDataLoaded(null)
        }
    }, [userData, address, onUserDataLoaded])

    return null
}

const VaultUsersSection: React.FC = () => {
    const [userSearch, setUserSearch] = React.useState("")
    const [sortConfig, setSortConfig] = React.useState<{
        key: UserPositionKey
        direction: "asc" | "desc"
    }>({
        key: "ltv",
        direction: "desc",
    })

    const { data: userAddresses, isLoading: isLoadingAddresses, error: addressesError } = useUsersFromSubgraph()
    const [usersData, setUsersData] = React.useState<UserPositionRow[]>([])
    const [loadedCount, setLoadedCount] = React.useState(0)

    React.useEffect(() => {
        if (userAddresses) {
            setUsersData([])
            setLoadedCount(0)
        }
    }, [userAddresses])

    const handleUserDataLoaded = React.useCallback(
        (address: Address) => (data: UserPositionRow | null) => {
            if (data) {
                setUsersData((prev) => {
                    const exists = prev.some((u) => u.address === address)
                    if (!exists) {
                        return [...prev, data]
                    }
                    return prev
                })
            }
            setLoadedCount((prev) => prev + 1)
        },
        []
    )

    const filteredAndSorted = React.useMemo(() => {
        const filtered = usersData.filter((user) => user.address.toLowerCase().includes(userSearch.toLowerCase()))
        return [...filtered].sort((a, b) => {
            const { key, direction } = sortConfig
            const dir = direction === "asc" ? 1 : -1
            if (typeof a[key] === "string" && typeof b[key] === "string") {
                return (a[key] as string).localeCompare(b[key] as string) * dir
            }
            return ((a[key] as number) - (b[key] as number)) * dir
        })
    }, [usersData, userSearch, sortConfig])

    const handleSort = (key: UserPositionKey) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }))
    }

    const formatCurrencyLocal = (value: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)

    const isStillLoading = userAddresses && loadedCount < userAddresses.length

    return (
        <section className="bg-[#0B1212] rounded-3xl p-6 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-xl font-semibold">Vault Users & Collateral</h3>
                    <p className="text-sm text-[#A3B8B0]">Supplied collateral, minted USDV, and LTV ratio.</p>
                </div>
                <input
                    type="text"
                    placeholder="Search address"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="bg-[#111818] border border-[#1A2323] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#00FFB2]"
                />
            </div>

            {userAddresses?.map((data) => (
                <UserRow key={data.address} address={data.address} onUserDataLoaded={handleUserDataLoaded(data.address)} />
            ))}

            <div className="rounded-2xl border border-[#1A2323] overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#111818] text-[#A3B8B0]">
                        <tr>
                            {(
                                [
                                    ["address", "User"],
                                    ["totalCollateralValueUsd", "Total Collateral"],
                                    ["mintedUSDV", "Minted USDV"],
                                    ["stakedUSDV", "Staked USDV"],
                                    ["ltv", "LTV %"],
                                ] as [UserPositionKey, string][]
                            ).map(([key, label]) => (
                                <th
                                    key={key}
                                    className="px-4 py-3 cursor-pointer select-none hover:text-[#E6FFF6] transition-colors"
                                    onClick={() => handleSort(key)}
                                >
                                    {label}
                                    {sortConfig.key === key && (
                                        <span className="ml-1 text-xs">{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoadingAddresses ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center">
                                    <div className="flex justify-center items-center gap-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#E6FFF6]" />
                                        <span className="text-[#A3B8B0]">Loading users...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : addressesError ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-red-400">
                                    Error loading users
                                </td>
                            </tr>
                        ) : isStillLoading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center">
                                    <div className="flex justify-center items-center gap-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#E6FFF6]" />
                                        <span className="text-[#A3B8B0]">
                                            Loading user data ({loadedCount}/{userAddresses?.length})...
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredAndSorted.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-[#A3B8B0]">
                                    {userSearch ? "No matching users" : "No users found"}
                                </td>
                            </tr>
                        ) : (
                            filteredAndSorted.map((user) => (
                                <tr key={user.address} className="border-t border-[#1A2323] hover:bg-[#111818]">
                                    <td className="px-4 py-3 font-mono text-sm">{user.address}</td>
                                    <td className="px-4 py-3">{formatCurrencyLocal(user.totalCollateralValueUsd)}</td>
                                    <td className="px-4 py-3">{formatCurrencyLocal(user.mintedUSDV)}</td>
                                    <td className="px-4 py-3">{formatCurrencyLocal(user.stakedUSDV)}</td>
                                    <td className="px-4 py-3">{user.ltv.toFixed(1)}%</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default Overview
