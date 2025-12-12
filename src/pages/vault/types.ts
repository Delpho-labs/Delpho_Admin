import type React from "react"

export type CollateralRow = {
    label: string
    hype: string
    khype: string
}

export type StatCardProps = {
    icon: React.ReactNode
    label: string
    value: React.ReactNode
    hint?: string
    accent?: string
}

export type SectionProps = {
    title: string
    subtitle?: string
    children: React.ReactNode
}
