import React, { useEffect, useState, useCallback } from 'react';
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt
} from 'wagmi';
import { polygon } from 'wagmi/chains';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';

// React Components
import Header from './Header';
import WalletConnect from './WalletConnect';
import BadgeDisplay from './BadgeDisplay';
import MintForm from './MintForm';
import DebugPanel from './DebugPanel';
import ConnectionStatus from './ConnectionStatus';

const GENESIS_BADGE_CONTRACT = {
  address: process.env.NEXT_PUBLIC_GENESIS_BADGE_CONTRACT || '0x18cd3974357ffc524e4ee2d3e08b06ed3e0b7e1c',
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

const App = () => {
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState('');
  const [supporterData, setSupporterData] = useState(null);
  const [devOverride, setDevOverride] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const { address, isConnected, chain, status } = useAccount();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();
  const currentChainId = useChainId();

  // Enhanced contract reads with better error handling
  const { data: badgeBalance, refetch: refetchBalance, error: balanceError } = useReadContract({
    address: GENESIS_BADGE_CONTRACT.address,
    abi: GENESIS_BADGE_CONTRACT.abi,
    functionName: 'balanceOf',
    args: [address],
    chainId: polygon.id,
    query: { 
      enabled: !!address && isConnected,
      refetchInterval: 10000,
      retry: 3
    }
  });

  const { data: isMintingOpen, refetch: refetchMintStatus, error: mintStatusError } = useReadContract({
    address: GENESIS_BADGE_CONTRACT.address,
    abi: GENESIS_BADGE_CONTRACT.abi,
    functionName: 'mintingOpen',
    chainId: polygon.id,
    query: {
      enabled: true,
      refetchInterval: 15000,
      staleTime: 0,
      retry: 3
    }
  });

  const { data: mintPrice, error: priceError } = useReadContract({
    address: GENESIS_BADGE_CONTRACT.address,
    abi: GENESIS_BADGE_CONTRACT.abi,
    functionName: 'MINT_PRICE',
    chainId: polygon.id,
    query: { retry: 3 }
  });

  const { data: totalMinted, error: totalMintedError } = useReadContract({
    address: GENESIS_BADGE_CONTRACT.address,
    abi: GENESIS_BADGE_CONTRACT.abi,
    functionName: 'totalMinted',
    chainId: polygon.id,
    query: { refetchInterval: 10000, retry: 3 }
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
      toast.error('Please connect your wallet first');
      return;
    }

    if (chain?.id !== polygon.id) {
      try {
        await switchChain({ chainId: polygon.id });
        toast.success('Switching to Polygon...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        resetMint();
      } catch (error) {
        toast.error('Please switch to Polygon manually in your wallet');
        return;
      }
    }

    if (!mintPrice) {
      toast.error('Unable to get mint price. Please try again.');
      return;
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
      console.error('Mint error:', error);
      toast.error(`Mint failed: ${error.shortMessage || error.message}`);
    }
  }, [isConnected, chain, switchChain, mint, message, mintPrice, resetMint]);

  useEffect(() => {
    setMounted(true);
    verifyContractState();
  }, []);

  useEffect(() => {
    if (hash && !isTxLoading) {
      toast.success('🎉 Badge minted successfully!', { duration: 8000 });
      refetchBalance();
      refetchMintStatus();
    }
  }, [hash, isTxLoading, refetchBalance, refetchMintStatus]);

  useEffect(() => {
    if (mintError) {
      console.error('Mint error:', mintError);
      toast.error(`Mint error: ${mintError.shortMessage || mintError.message}`);
    }
  }, [mintError]);

  // Handle connection errors
  useEffect(() => {
    if (status === 'disconnected') {
      setConnectionError('Wallet disconnected');
    } else if (status === 'connecting') {
      setConnectionError(null);
    } else if (status === 'connected') {
      setConnectionError(null);
    }
  }, [status]);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6">
        <Header />
        
        <ConnectionStatus connectionError={connectionError} status={status} />
        
        <DebugPanel 
          contractAddress={GENESIS_BADGE_CONTRACT.address}
          status={status}
          currentChainId={currentChainId}
          isMintingOpen={isMintingOpen}
          devOverride={devOverride}
          refetchMintStatus={refetchMintStatus}
          verifyContractState={verifyContractState}
          setDevOverride={setDevOverride}
        />

        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl shadow-xl">
          {!isConnected ? (
            <WalletConnect status={status} />
          ) : badgeBalance && badgeBalance > 0 ? (
            <BadgeDisplay supporterData={supporterData} totalMinted={totalMinted} />
          ) : (
            <MintForm 
              message={message}
              setMessage={setMessage}
              handleMint={handleMint}
              isMintingOpen={isMintingOpen}
              devOverride={devOverride}
              isMintLoading={isMintLoading}
              isTxLoading={isTxLoading}
              mintPrice={mintPrice}
              currentChainId={currentChainId}
              totalMinted={totalMinted}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App; 