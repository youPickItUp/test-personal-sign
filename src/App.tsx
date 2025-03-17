import './App.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAccount, useConnect, useDisconnect, useEnsAvatar, useEnsName, useSignMessage, WagmiProvider } from 'wagmi'
import { config } from './config'
import { useRef } from 'react'

function WalletOptions() {
  const { connectors, connect } = useConnect()

  return connectors.map((connector) => (
    <button key={connector.uid} onClick={() => connect({ connector })}>
      {connector.name}
    </button>
  ))
}

function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

  return (
    <div>
      Connected account:
      {!address && "No account connected"}
      {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
      {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
      {address && <button onClick={() => disconnect()}>Disconnect</button>}
    </div>
  )
}

function SignMessage() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { signMessage, data } = useSignMessage();

  return (
    <div>
      <textarea ref={textareaRef}></textarea>
      <br />
      <button onClick={() => {
        if (!textareaRef.current) {
          throw new Error('No textarea ref!');
        }

        signMessage({ message: textareaRef.current?.value });
      }}>
        Personal sign
      </button>
      <br />
      {data && `Signature: ${data}`}
    </div>
  )
}

function App() {
  return (
    <>
      <WalletOptions />
      <Account />
      <SignMessage />
    </>
  )
}

const queryClient = new QueryClient()

const AppWithWagmi = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </WagmiProvider>
);

export default AppWithWagmi
