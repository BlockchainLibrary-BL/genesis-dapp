import React from 'react';

const Header = () => {
  return (
    <header className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <span className="text-4xl mr-3">🌱</span>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Genesis Badge
        </h1>
      </div>
      <p className="text-gray-600 text-lg">Mint your unique blockchain badge</p>
    </header>
  );
};

export default Header; 