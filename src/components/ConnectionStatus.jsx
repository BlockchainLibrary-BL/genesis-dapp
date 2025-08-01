import React from 'react';

const ConnectionStatus = ({ connectionError, status }) => {
  if (!connectionError && status === 'connected') {
    return null;
  }

  return (
    <div className="mb-4">
      {connectionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Connection Error:</strong> {connectionError}
        </div>
      )}
      
      {status === 'connecting' && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
            Connecting to wallet...
          </div>
        </div>
      )}
      
      {status === 'disconnected' && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Wallet Disconnected:</strong> Please reconnect your wallet to continue.
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus; 