import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import "@rainbow-me/rainbowkit/styles.css"
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { QueryClientProvider } from "@tanstack/react-query"
import { config, queryClient } from "./config/Network.config.ts"
import { Provider } from "react-redux"
import { store } from "./store"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider
                        theme={darkTheme({
                            accentColor: "#E6FFF6",
                            accentColorForeground: "#1A2323",
                            borderRadius: "large",
                            fontStack: "system",
                        })}
                        coolMode
                    >
                        <App />
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </Provider>
    </StrictMode>
)
