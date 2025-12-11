import React from "react";

interface ActionButtonsProps {
  onRebalance: () => void;
  onCloseStrategy: () => void;
  rebalanceDisabled: boolean;
  closeDisabled: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onRebalance,
  onCloseStrategy,
  rebalanceDisabled,
  closeDisabled,
}) => {
  return (
    <div className="flex gap-4">
      <button
        onClick={onRebalance}
        disabled={rebalanceDisabled}
        className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
          rebalanceDisabled
            ? "bg-[#1A2323] text-[#7E8F89] cursor-not-allowed border border-[#1A2323]"
            : "bg-[#00FFB2] text-[#101616] hover:bg-[#00E6A0] shadow-[0_0_20px_rgba(0,255,178,0.3)] hover:shadow-[0_0_25px_rgba(0,255,178,0.4)] cursor-pointer"
        }`}
      >
        Rebalance
      </button>
      <button
        onClick={onCloseStrategy}
        disabled={closeDisabled}
        className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
          closeDisabled
            ? "bg-[#1A2323] text-[#7E8F89] cursor-not-allowed border border-[#1A2323]"
            : "bg-[#1A2323] text-[#E6FFF6] hover:bg-[#252D2D] border border-[#1A2323] hover:border-[#00FFB2]/40 cursor-pointer"
        }`}
      >
        Close Strategy
      </button>
    </div>
  );
};
