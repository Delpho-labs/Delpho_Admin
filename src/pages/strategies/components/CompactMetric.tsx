import React from "react";

interface CompactMetricProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export const CompactMetric: React.FC<CompactMetricProps> = ({
  label,
  value,
  highlight,
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] uppercase tracking-wide text-[#7E8F89]">
      {label}
    </span>
    <span
      className={`text-sm font-semibold ${
        highlight ? "text-[#00FFB2]" : "text-[#E6FFF6]"
      }`}
    >
      {value}
    </span>
  </div>
);

