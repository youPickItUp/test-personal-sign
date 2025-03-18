import './App.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAccount, useConnect, useDisconnect, useEnsAvatar, useEnsName, useSignMessage, useSignTypedData, WagmiProvider } from 'wagmi'
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

function PersonalSignMessage() {
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
      <br />
      {data ? (
        data === "0x9cbafe1f0186ac8e08aa95f0b380d667ce02ab3fac22afb0464737f8a55ce1643e428e57ce4a92858059c640711ee3ab65a0b2fbe4728df94ac2f7a64f503d5c1c" ||
        data === "0x6d2efdfdf4f7c6406ac8bec66669b72122f6bdc7a50e5e444124aeda2d0cb6b769ef63bbd47eeaa817bd617ba545405b6573791308c7cb7912150364662ac5db1b"
       ) ? 'Matches MetaMask' : "Doesn't match MetaMask" : null}
    </div>
  )
}

function EthSignTypedDataV4() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { signTypedData, data, error } = useSignTypedData();

  error && console.error(error);

  const onClick = () => {
    if (!textareaRef.current) {
      throw new Error('No textarea ref!');
    }

    signTypedData({
      types: {
        EIP712Domain: [
          {
            name: "name",
            type: "string"
          },
          {
            name: "version",
            type: "string"
          },
          {
            name: "chainId",
            type: "uint256"
          },
          {
            name: "verifyingContract",
            type: "address"
          }
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      domain: {
        name: "Ether Mail",
        version: "1",
        chainId: 1n,
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"
      },
      message: {
        from: {
          name: 'Cow',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: textareaRef.current.value,
      },
    })
  };

  return (
    <div>
      <textarea ref={textareaRef}></textarea>
      <br />
      <button onClick={onClick}>
        Eth sign typed data v4
      </button>
      <br />
      {data && `Signature: ${data}`}
      <br />
      {data ? (
        data === "0xfb7d1935ac491e9466c9692b09d1271e1a3096889b7829c3af9f8bc11466f9db09778a143e303cf7d5e04561a311c1553470f99175f296f4d812f0fb690e601c1c" ||
        data === "0xd83a987ddfbd46a7524296955b4743da8960181a8b042dcec1f6d9717f2013431cf341392c462d77ade5b5e78f799e516a86ed823b3626bb14d939115ec47f131c" ||
        data === "0x9ca9b4a6c243935714a406e5b9975a46e66e613334ed3b9daca5c3e8f63ab554209f936af1b1b780f7a191dd8012f47157caddf305ea20d9dca32dd0b5080b501b"
       ) ? 'Matches MetaMask' : "Doesn't match MetaMask" : null}
      </div>
  )
}

function App() {
  return (
    <>
      <WalletOptions />
      <Account />
      <PersonalSignMessage />
      <EthSignTypedDataV4 />
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
