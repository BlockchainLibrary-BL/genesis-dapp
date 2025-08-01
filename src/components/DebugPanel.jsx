import React from 'react';

const DebugPanel = ({ 
  contractAddress, 
  status, 
  currentChainId, 
  isMintingOpen, 
  devOverride, 
  refetchMintStatus, 
  verifyContractState, 
  setDevOverride 
}) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="bg-red-900 text-white p-4 mb-4 rounded-lg">
      <h3 className="font-bold mb-2">Developer Mode</h3>
      <div className="space-y-1 text-sm">
        <p>Contract: {contractAddress}</p>
        <p>Connection Status: {status}</p>
        <p>Chain ID: {currentChainId}</p>
        <p>Mint Status: {isMintingOpen?.toString()} {devOverride && '(OVERRIDE ACTIVE)'}</p>
      </div>
      
      <div className="flex gap-2 mt-3">
        <button 
          onClick={() => {
            refetchMintStatus();
            verifyContractState();
          }}
          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm transition-colors"
        >
          Refresh Status
        </button>
        <button
          onClick={() => setDevOverride(!devOverride)}
          className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm transition-colors"
        >
          {devOverride ? 'Disable Override' : 'Force Mint Open'}
        </button>
      </div>
    </div>
  );
};

export default DebugPanel; 