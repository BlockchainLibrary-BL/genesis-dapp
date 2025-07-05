import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt
} from 'wagmi';
import { polygon } from 'wagmi/chains';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import ClientOnly from './components/ClientOnly';
import { ethers } from 'ethers';

const GENESIS_BADGE_CONTRACT = {
  address: process.env.NEXT_PUBLIC_GENESIS_BADGE_CONTRACT || '0x18Cd3974357FfC524E4Ee2D3e08b06eD3E0B7E1C',
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
  const [message, setMessage] = useState('');
  const [supporterData, setSupporterData] = useState(null);
  const [devOverride, setDevOverride] = useState(false); // Temporary debug override

  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();

  // Enhanced contract reads with auto-refresh
  const { data: badgeBalance, refetch: refetchBalance } = useReadContract({
    address: GENESIS_BADGE_CONTRACT.address,
    abi: GENESIS_BADGE_CONTRACT.abi,
    functionName: 'balanceOf',
    args: [address],
    chainId: polygon.id,
    query: { 
      enabled: !!address,
      refetchInterval: 10000 
    }
  });

  const { data: isMintingOpen, refetch: refetchMintStatus } = useReadContract({
    address: GENESIS_BADGE_CONTRACT.address,
    abi: GENESIS_BADGE_CONTRACT.abi,
    functionName: 'mintingOpen',
    chainId: polygon.id,
    query: {
      enabled: true,
      refetchInterval: 15000,
      staleTime: 0
    }
  });

  const { data: mintPrice } = useReadContract({
    address: GENESIS_BADGE_CONTRACT.address,
    abi: GENESIS_BADGE_CONTRACT.abi,
    functionName: 'MINT_PRICE',
    chainId: polygon.id
  });

  const { data: totalMinted } = useReadContract({
    address: GENESIS_BADGE_CONTRACT.address,
    abi: GENESIS_BADGE_CONTRACT.abi,
    functionName: 'totalMinted',
    chainId: polygon.id,
    query: { refetchInterval: 10000 }
  });

  const {
    data: hash,
    writeContract: mint,
    isPending: isMintLoading,
    error: mintError,
    reset: resetMint
  } = useWriteContract();

  const { isLoading: isTxLoading } = useWaitForTransactionReceipt({ hash });

  // Verify contract state directly
  const verifyContractState = async () => {
    try {
      const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
      const contract = new ethers.Contract(
        GENESIS_BADGE_CONTRACT.address,
        GENESIS_BADGE_CONTRACT.abi,
        provider
      );
      const status = await contract.mintingOpen();
      console.log('Direct contract read - mintingOpen:', status);
      return status;
    } catch (error) {
      console.error('Contract verification failed:', error);
      return false;
    }
  };

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
        address: GENESIS_BADGE_CONTRACT.address,
        abi: GENESIS_BADGE_CONTRACT.abi,
        functionName: 'mint',
        args: [message],
        value: mintPrice,
        chainId: polygon.id
      });
      toast.success('Transaction submitted...');
    } catch (error) {
      toast.error(`Mint failed: ${error.shortMessage || error.message}`);
    }
  }, [isConnected, chain, switchChain, mint, message, mintPrice]);

  useEffect(() => {
    setMounted(true);
    verifyContractState(); // Initial verification
  }, []);

  useEffect(() => {
    if (hash && !isTxLoading) {
      toast.success('🎉 Badge minted successfully!', { duration: 8000 });
      refetchBalance();
      refetchMintStatus();
    }
  }, [hash, isTxLoading]);

  useEffect(() => {
    if (mintError) {
      toast.error(`Mint error: ${mintError.shortMessage || mintError.message}`);
    }
  }, [mintError]);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-8">🌱 Genesis Badge</h1>

        {/* Debug Panel (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-900 text-white p-4 mb-4 rounded-lg">
            <h3 className="font-bold">Developer Mode</h3>
            <p>Contract: {GENESIS_BADGE_CONTRACT.address}</p>
            <p>Mint Status: {isMintingOpen?.toString()} {devOverride && '(OVERRIDE ACTIVE)'}</p>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => {
                  refetchMintStatus();
                  verifyContractState();
                }}
                className="bg-blue-500 px-3 py-1 rounded"
              >
                Refresh Status
              </button>
              <button
                onClick={() => setDevOverride(!devOverride)}
                className="bg-yellow-500 px-3 py-1 rounded"
              >
                {devOverride ? 'Disable Override' : 'Force Mint Open'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl shadow-md">
          {!isConnected ? (
            <div className="text-center">
              <h2 className="text-2xl mb-2">Connect Your Wallet</h2>
              <p className="mb-6">To mint your Genesis Badge, please connect your wallet</p>
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
              <p className="mt-4">Total Minted: {totalMinted?.toString() || '...'} / 250,000</p>
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
                    <label className="block mb-2">Optional Message (max 100 chars)</label>
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
                    disabled={(!isMintingOpen && !devOverride) || isMintLoading || isTxLoading}
                    className={`w-full py-3 rounded-lg font-bold text-white ${
                      (!isMintingOpen && !devOverride) ? 'bg-gray-400 cursor-not-allowed' :
                      isMintLoading || isTxLoading ? 'bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {(!isMintingOpen && !devOverride) ? 'Minting Closed' :
                     isMintLoading || isTxLoading ? 'Processing...' : 
                     `Mint for ${mintPrice ? (Number(mintPrice) / 1e18).toFixed(2) + ' MATIC' : '...'}`
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