import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDispatch } from "react-redux";
import { connect, disconnect } from "../../features/wallet/walletSlice";

export const ConnectWalletButton = () => {
  const dispatch = useDispatch();
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        // Sync Redux wallet state
        if (connected) {
          dispatch(connect(account.address));
        } else {
          dispatch(disconnect());
        }

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={openConnectModal}
                    className="px-6 py-2 rounded-full border border-[#E6FFF6] text-[#E6FFF6] hover:bg-[#1A2323] transition"
                  >
                    Connect Wallet
                  </motion.button>
                );
              }

              if (chain.unsupported) {
                return (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={openChainModal}
                    className="px-6 py-2 rounded-full border border-red-500 text-red-500 hover:bg-[#1A2323] transition"
                  >
                    Wrong network
                  </motion.button>
                );
              }

              return (
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={openChainModal}
                    className="px-4 py-2 rounded-full border border-[#E6FFF6] text-[#E6FFF6] hover:bg-[#1A2323] transition flex items-center gap-2"
                  >
                    {chain.hasIcon && (
                      <div
                        className="w-3 h-3 rounded-full overflow-hidden"
                        style={{
                          background: chain.iconBackground,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            className="w-full h-full"
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={openAccountModal}
                    className="px-4 py-2 rounded-full border border-[#E6FFF6] text-[#E6FFF6] hover:bg-[#1A2323] transition"
                  >
                    {account.displayName}
                  </motion.button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
