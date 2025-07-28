import React from 'react';
import { useSwitchChain } from 'wagmi';
import { polygon } from 'wagmi/chains';

const MintForm = ({ 
  message, 
  setMessage, 
  handleMint, 
  isMintingOpen, 
  devOverride, 
  isMintLoading, 
  isTxLoading, 
  mintPrice, 
  currentChainId, 
  totalMinted 
}) => {
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();

  return (
    <div>
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🎨</div>
        <h2 className="text-3xl font-bold mb-2">Mint Your Genesis Badge</h2>
        <p className="text-gray-600">Create your unique blockchain badge</p>
      </div>

      {currentChainId !== polygon.id ? (
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="mb-6 text-gray-600 text-lg">Please switch to Polygon network to continue</p>
          <button
            onClick={() => switchChain({ chainId: polygon.id })}
            disabled={isSwitchPending}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold disabled:bg-gray-400 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isSwitchPending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Switching...
              </div>
            ) : 'Switch to Polygon'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block mb-3 font-semibold text-lg">Optional Message (max 100 chars)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={100}
              className="w-full p-4 border-2 border-gray-200 rounded-xl min-h-[100px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="Leave a permanent message on-chain..."
            />
            <p className="text-sm text-gray-500 mt-2">{message.length}/100 characters</p>
          </div>

          <button
            onClick={handleMint}
            disabled={(!isMintingOpen && !devOverride) || isMintLoading || isTxLoading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-200 shadow-lg hover:shadow-xl ${
              (!isMintingOpen && !devOverride) 
                ? 'bg-gray-400 cursor-not-allowed' 
                : isMintLoading || isTxLoading 
                  ? 'bg-gray-600' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            }`}
          >
            {(!isMintingOpen && !devOverride) ? 'Minting Closed' :
             isMintLoading || isTxLoading ? (
               <div className="flex items-center justify-center">
                 <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3"></div>
                 Processing...
               </div>
             ) : 
             `Mint for ${mintPrice ? (Number(mintPrice) / 1e18).toFixed(2) + ' MATIC' : '...'}`
            }
          </button>

          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <p className="text-gray-700">
              Total Minted: <span className="font-bold text-indigo-600">{totalMinted?.toString() || '...'}</span> / 250,000
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MintForm; 