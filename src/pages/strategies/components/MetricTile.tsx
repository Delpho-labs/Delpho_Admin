import React from "react";

interface MetricTileProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  highlight,
}) => (
  <div className="rounded-2xl border border-[#1A2323] p-4">
    <p className="text-sm text-[#A3B8B0]">{label}</p>
    <p
      className={`text-2xl font-semibold mt-2 ${
        highlight ? "text-[#00FFB2]" : "text-[#E6FFF6]"
      }`}
    >
      {value}
    </p>
  </div>
);

