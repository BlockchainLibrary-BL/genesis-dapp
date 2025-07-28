# Wallet Connection Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# WalletConnect Project ID - Get this from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Genesis Badge Contract Address
NEXT_PUBLIC_GENESIS_BADGE_CONTRACT=0x18Cd3974357FfC524E4Ee2D3e08b06eD3E0B7E1C

# Optional: Alchemy API Key for better RPC performance
NEXT_PUBLIC_ALCHEMY_POLYGON_API_KEY=your_alchemy_api_key_here

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

## Getting a WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Create a new project
4. Copy the Project ID
5. Add it to your `.env.local` file

## Troubleshooting Wallet Connection Issues

### Common Issues:

1. **"Wallet not connecting"**
   - Make sure you have a valid WalletConnect Project ID
   - Check that your wallet supports WalletConnect v2
   - Try refreshing the page

2. **"Chain not supported"**
   - The app requires Polygon network
   - Make sure your wallet has Polygon network configured
   - The app will prompt you to switch networks automatically

3. **"Transaction failed"**
   - Ensure you have enough MATIC for gas fees
   - Check that minting is currently open
   - Verify you're on the correct network (Polygon)

### Development Mode

In development mode, you'll see a debug panel that shows:
- Connection status
- Current chain ID
- Contract address
- Minting status

Use the "Refresh Status" button to manually refresh contract data.

## Supported Wallets

The app supports all wallets that work with WalletConnect v2, including:
- MetaMask
- Rainbow
- Trust Wallet
- WalletConnect
- Coinbase Wallet
- And many more... 