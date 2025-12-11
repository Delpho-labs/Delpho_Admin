import React from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

interface AssetRow {
  asset: string;
  apy: string;
  collateral: boolean;
}



interface AssetTableSectionProps {
  rows: AssetRow[];
  activeTab: "Spot" | "Perps";
  onTabChange?: (tab: "Spot" | "Perps") => void;
}

const AssetTableSection: React.FC<AssetTableSectionProps> = ({
  rows,
  activeTab,
  onTabChange,
}) => {
  const walletConnected = useSelector(
    (state: RootState) => state.wallet.connected
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#101616] rounded-xl p-6 mb-8"
    >
      <h3 className="text-xl font-bold mb-4">
        Borrow against your HyperCore assets
      </h3>
      <div className="text-[#A3B8B0] mb-4">
        Buy assets on{" "}
        <a href="#" className="underline">
          HyperCore
        </a>{" "}
        to enable borrowing here.
      </div>
      {/* Spot/Perps Tabs */}
      <div className="flex gap-4 mb-4">
        <button
          className={`px-6 py-2 rounded-full bg-[#0B1212] font-semibold border-b-2 cursor-pointer transition-colors ${
            activeTab === "Spot"
              ? "text-[#E6FFF6] border-[#E6FFF6]"
              : "text-[#A3B8B0] border-transparent hover:text-[#E6FFF6]"
          }`}
          onClick={() => onTabChange && onTabChange("Spot")}
        >
          Spot
        </button>
        <button
          className={`px-6 py-2 rounded-full bg-[#0B1212] font-semibold border-b-2 cursor-pointer transition-colors ${
            activeTab === "Perps"
              ? "text-[#E6FFF6] border-[#E6FFF6]"
              : "text-[#A3B8B0] border-transparent hover:text-[#E6FFF6]"
          }`}
          onClick={() => onTabChange && onTabChange("Perps")}
        >
          Perps
        </button>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-[#A3B8B0] border-b border-[#1A2323]">
              <th className="py-2 px-4">Asset</th>
              <th className="py-2 px-4">Your Balance</th>
              <th className="py-2 px-4">Supply APY</th>
              <th className="py-2 px-4">Can be Collateral</th>
              <th className="py-2 px-4">Pool</th>
              <th className="py-2 px-4"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <motion.tr
                key={row.asset}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border-b border-[#1A2323]"
              >
                <td className="py-2 px-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#1A2323] rounded-full" />
                  {row.asset}
                </td>
                <td className="py-2 px-4">
                  0<br />
                  <span className="text-xs text-[#A3B8B0]">$0</span>
                </td>
                <td className="py-2 px-4">{row.apy}</td>
                <td className="py-2 px-4">{row.collateral ? "✔" : "-"}</td>
                <td className="py-2 px-4">Core</td>
                <td className="py-2 px-4">
                  {!walletConnected && (
                    <button className="px-4 py-1 rounded-full bg-[#E6FFF6] text-[#101616] font-semibold cursor-pointer hover:bg-[#D0F0E6] transition-colors">
                      Connect Wallet
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AssetTableSection;
