import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSwitchChain, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
// Move to: pages/components/ClientOnly.jsx
import ClientOnly from './components/ClientOnly'
// Using environment variables
const GENESIS_BADGE_CONTRACT = {
  address: process.env.NEXT_PUBLIC_GENESIS_BADGE_CONTRACT || '0x18cd3974357ffC524E4EE2D3e08B06eD3E0B7E1C',
  abi: [
    {
      "inputs": [{"internalType": "string", "name": "message", "type": "string"}],
      "name": "mint",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "wallet", "type": "address"}],
      "name": "getSupporterData",
      "outputs": [
        {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
        {"internalType": "string", "name": "message", "type": "string"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "mintingOpen",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MINT_PRICE",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalMinted",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }
  ]
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();
  const [message, setMessage] = useState('');
  const [supporterData, setSupporterData] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Contract reads
  const { data: badgeBalance, refetch: refetchBalance } = useReadContract({
    ...GENESIS_BADGE_CONTRACT,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: isConnected && mounted }
  });

  const { data: isMintingOpen } = useReadContract({
    ...GENESIS_BADGE_CONTRACT,
    functionName: 'mintingOpen'
  });

  const { data: mintPrice } = useReadContract({
    ...GENESIS_BADGE_CONTRACT,
    functionName: 'MINT_PRICE'
  });

  const { data: totalMinted } = useReadContract({
    ...GENESIS_BADGE_CONTRACT,
    functionName: 'totalMinted'
  });

  // Contract writes
  const { 
    data: hash,
    writeContract: mint,
    isPending: isMintLoading,
    error: mintError,
    reset: resetMint
  } = useWriteContract();

  // Transaction status
  const { isLoading: isTxLoading } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle mint
  const handleMint = useCallback(async () => {
    if (!isConnected) {
      toast.error('Wallet not connected');
      return;
    }

    if (chain?.id !== polygon.id) {
      try {
        await switchChain({ chainId: polygon.id });
        await new Promise(resolve => setTimeout(resolve, 2000));
        resetMint();
      } catch (error) {
        toast.error('Please switch to Polygon manually');
        return;
      }
    }

    try {
      mint({
        ...GENESIS_BADGE_CONTRACT,
        functionName: 'mint',
        args: [message],
        value: mintPrice
      });
      toast.success('Transaction submitted...');
    } catch (error) {
      toast.error(`Mint failed: ${error.shortMessage || error.message}`);
    }
  }, [isConnected, chain, switchChain, mint, message, mintPrice]);

  // Handle transaction success
  useEffect(() => {
    if (hash && !isTxLoading) {
      toast.success(
        `🎉 Badge minted successfully!`,
        { duration: 10000 }
      );
      refetchBalance();
    }
  }, [hash, isTxLoading]);

  if (!mounted) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <ClientOnly>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          🌱 Genesis Badge
        </h1>

        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl shadow-md">
          {!isConnected ? (
            <div className="text-center">
              <h2 className="text-2xl mb-2">Connect Your Wallet</h2>
              <p className="mb-6">
                To mint your Genesis Badge, please connect your wallet
              </p>
              <ConnectButton />
            </div>
          ) : badgeBalance && badgeBalance > 0 ? (
            <div className="text-center">
              <h2 className="text-2xl mb-2">🎖️ You Own a Genesis Badge!</h2>
              {supporterData && (
                <div className="mt-4 text-left">
                  <p><strong>Token ID:</strong> #{supporterData.tokenId}</p>
                  {supporterData.message && (
                    <p><strong>Your Message:</strong> "{supporterData.message}"</p>
                  )}
                </div>
              )}
              <p className="mt-4">
                Total Minted: {totalMinted?.toString() || '...'} / 250,000
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl text-center mb-4">Mint Your Genesis Badge</h2>
              
              {currentChainId !== polygon.id ? (
                <button
                  onClick={() => switchChain({ chainId: polygon.id })}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold"
                >
                  Switch to Polygon
                </button>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block mb-2">
                      Optional Message (max 100 chars)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={100}
                      className="w-full p-3 border border-gray-300 rounded-lg min-h-[80px]"
                      placeholder="Leave a permanent message on-chain"
                    />
                  </div>

                  <button
                    onClick={handleMint}
                    disabled={!isMintingOpen || isMintLoading || isTxLoading}
                    className={`w-full py-3 rounded-lg font-bold text-white ${
                      !isMintingOpen ? 'bg-gray-400 cursor-not-allowed' : 
                      isMintLoading || isTxLoading ? 'bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {!isMintingOpen ? 'Minting Closed' :
                     isMintLoading || isTxLoading ? 'Processing...' : 
                     `Mint for ${mintPrice ? (Number(mintPrice) / 1e18).toString() + ' MATIC' : '...'}`
                    }
                  </button>

                  <p className="mt-4 text-center">
                    Total Minted: {totalMinted?.toString() || '...'} / 250,000
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </ClientOnly>
  );
}