import React from "react";
import HomeSidebar from "../components/HomeSidebar";
import TopNav from "../components/TopNav";
import { motion } from "framer-motion";
import { useVaultData } from "../hooks/useVaultData";

const VaultDashboard: React.FC = () => {
  const { data, isLoading, error } = useVaultData();


  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="min-h-screen flex bg-[#101616] text-[#E6FFF6]">
      <HomeSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <TopNav title="Delpho Vault Dashboard" />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E6FFF6]"></div>
          </div>
        ) : error ? (
          <div className="text-red-400 p-4 rounded bg-[#1A2323]">
            Error loading vault data
          </div>
        ) : data && (
          <div className="space-y-6">
            {/* Main Metrics Table */}
            <div className="bg-[#0B1212] rounded-xl p-0 overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-[#A3B8B0] border-b border-[#1A2323]">
                    <th className="py-2 px-4 font-normal">Total Collateral</th>
                    <th className="py-2 px-4 font-normal">Total Borrowed</th>
                    <th className="py-2 px-4 font-normal">dUSD Minted</th>
                  </tr>
                </thead>
                <tbody>
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.04 }}
                    className="border-b border-[#1A2323]"
                  >
                    <td className="py-2 px-4">{Number(data.totalCollateral).toFixed(3)} WHYPE</td>
                    <td className="py-2 px-4">{Number(data.totalBorrowed).toFixed(3)} DUSD</td>
                    <td className="py-2 px-4">{Number(data.dusdMinted).toFixed(3)} DUSD</td>
                  </motion.tr>
                </tbody>
              </table>
            </div>

            {/* Funds Allocation Table */}
            <div className="bg-[#0B1212] rounded-xl p-0 overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-[#A3B8B0] border-b border-[#1A2323]">
                    <th className="py-2 px-4 font-normal">Buffer Funds</th>
                    <th className="py-2 px-4 font-normal">Executor Funds</th>
                    <th className="py-2 px-4 font-normal">Current Round</th>
                  </tr>
                </thead>
                <tbody>
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.08 }}
                    className="border-b border-[#1A2323]"
                  >
                    <td className="py-2 px-4">{Number(data.bufferFunds).toFixed(3)} WHYPE</td>
                    <td className="py-2 px-4">{Number(data.fundsForExecutor).toFixed(3)} WHYPE</td>
                    <td className="py-2 px-4">#{data.currentRound}</td>
                  </motion.tr>
                </tbody>
              </table>
            </div>

            {/* Round Data Table */}
            <div className="bg-[#0B1212] rounded-xl p-0 overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-[#A3B8B0] border-b border-[#1A2323]">
                    <th className="py-2 px-4 font-normal">Withdrawal Requests</th>
                    <th className="py-2 px-4 font-normal">Available Collateral</th>
                    <th className="py-2 px-4 font-normal">Round Start</th>
                    <th className="py-2 px-4 font-normal">Round End</th>
                  </tr>
                </thead>
                <tbody>
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.12 }}
                    className="border-b border-[#1A2323]"
                  >
                    <td className="py-2 px-4">{Number(data.roundData.totalWithdrawalRequests).toFixed(3)} WHYPE</td>
                    <td className="py-2 px-4">{Number(data.roundData.availableCollateral).toFixed(3)} WHYPE</td>
                    <td className="py-2 px-4">{formatDate(data.roundData.startTime)}</td>
                    <td className="py-2 px-4">{formatDate(data.roundData.endTime)}</td>
                  </motion.tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VaultDashboard;