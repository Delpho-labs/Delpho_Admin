import React from "react";
import type { CollateralRow } from "../types";

type Props = {
  rows: CollateralRow[];
};

const CollateralTable: React.FC<Props> = ({ rows }) => (
  <div className="overflow-hidden rounded-2xl border border-white/5">
    <div className="grid grid-cols-3 bg-white/5 px-4 py-3 text-xs uppercase tracking-wide text-[#8CA29A]">
      <span>Metric</span>
      <span className="text-center">Hype</span>
      <span className="text-center">KHype</span>
    </div>
    <div className="divide-y divide-white/5">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-3 items-center bg-white/[0.02] px-4 py-3 text-sm text-white"
        >
          <span className="text-[#C7D7D2]">{row.label}</span>
          <span className="text-center font-medium text-emerald-200">
            {row.hype}
          </span>
          <span className="text-center font-medium text-blue-200">
            {row.khype}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default CollateralTable;

