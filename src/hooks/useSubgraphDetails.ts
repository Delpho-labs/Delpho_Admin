import { useQuery } from "@tanstack/react-query"
import { gql, request } from "graphql-request"
import type { Address } from "viem"

const SUBGRAPH_URL = "https://delpho.squids.live/delpho@q94b7v/api/graphql"

export interface UserPositionFromSubgraph {
    id: Address
    address: Address
}

export function useUsersFromSubgraph() {
    return useQuery({
        queryKey: ["subgraphUsers"],
        queryFn: async (): Promise<UserPositionFromSubgraph[]> => {
            const query = gql`
                query GetUserPositions {
                    userPositions(limit: 10) {
                        id
                    }
                }
            `

            try {
                const response = await request<{ userPositions: UserPositionFromSubgraph[] }>(SUBGRAPH_URL, query)

                // Transform the response to match our interface
                return response.userPositions.map((user) => ({
                    ...user,
                    address: user.id as Address,
                }))
            } catch (error) {
                console.error("Error fetching users from subgraph:", error)
                throw error
            }
        },
    })
}
