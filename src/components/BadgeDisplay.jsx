import React from 'react';

const BadgeDisplay = ({ supporterData, totalMinted }) => {
  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="text-7xl mb-6">🎖️</div>
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          You Own a Genesis Badge!
        </h2>
        <p className="text-green-600 font-semibold text-xl">🎉 Congratulations! 🎉</p>
      </div>
      
      {supporterData && (
        <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-lg">
          <h3 className="font-bold text-2xl mb-4 text-indigo-800">Your Badge Details</h3>
          <div className="text-left space-y-3">
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 mr-2">Token ID:</span>
              <span className="text-indigo-600 font-bold text-lg">#{supporterData.tokenId}</span>
            </div>
            {supporterData.message && (
              <div>
                <span className="font-semibold text-gray-700">Your Message:</span>
                <p className="italic text-gray-800 mt-1 p-3 bg-white rounded-lg border">"{supporterData.message}"</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
        <p className="text-gray-700 text-lg">
          Total Minted: <span className="font-bold text-indigo-600 text-xl">{totalMinted?.toString() || '...'}</span> / 250,000
        </p>
      </div>
    </div>
  );
};

export default BadgeDisplay; 