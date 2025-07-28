import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const WalletConnect = ({ status }) => {
  const { isConnected } = useAccount();

  if (isConnected) {
    return null; // Don't show connect button if already connected
  }

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="text-6xl mb-4">🔗</div>
        <h2 className="text-3xl font-bold mb-3">Connect Your Wallet</h2>
        <p className="text-gray-600 text-lg">To mint your Genesis Badge, please connect your wallet</p>
      </div>
      
      <div className="flex justify-center">
        <ConnectButton />
      </div>
      
      {status === 'connecting' && (
        <div className="mt-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Connecting to wallet...</p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 