import { http, createConfig, injected } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = "6cbe43529fea5190dd3118eb769d7d49";
export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
})