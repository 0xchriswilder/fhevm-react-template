# create-fhevm-vue

A CLI to create a Vue app with FHEVM SDK integration.

## Usage

To create a new FHEVM Vue app, run:

```bash
npx create-fhevm-vue my-app
cd my-app
npm install
npm run dev
```

## What you get

- Complete Vue application with FHEVM SDK integration
- Bundled FHEVM SDK (no external dependencies)
- Beautiful Zama-branded UI
- TypeScript support
- Tailwind CSS styling
- Working FHEVM operations (encryption, decryption, contract interactions)
- **Deployed FHE Counter Contract** for testing on Sepolia testnet
- Public decryption demo with hardcoded ciphertexts
- Ready-to-use Vue composables
- **Complete Hardhat development environment** with:
  - FHE Counter smart contract
  - Deployment scripts for Sepolia testnet
  - Contract testing utilities
  - TypeScript support for contracts
- **Universal FHEVM SDK** with utilities for:
  - FHEVM initialization
  - Encrypted inputs creation
  - User decryption with EIP-712 signing
  - Public decryption flows

## Deployed FHE Counter Contract

The generated app includes a **pre-deployed FHE Counter Contract** on Sepolia testnet for testing:

- **Contract Address**: `0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e`
- **Network**: Sepolia testnet (Chain ID: 11155111)
- **Features**:
  - Get encrypted count from contract
  - Increment/decrement with encrypted inputs
  - User decryption with EIP-712 signing
  - Public decryption demo

## Features

- ✅ **Self-contained**: No need to install FHEVM SDK separately
- ✅ **Cross-platform**: Works on Windows, Mac, Linux
- ✅ **Zero configuration**: Works out of the box
- ✅ **Production ready**: Includes all necessary files and configurations
- ✅ **Beautiful UI**: Zama design system with Tailwind CSS
- ✅ **Real FHEVM operations**: Actual encryption/decryption functionality
- ✅ **Live contract**: Pre-deployed FHE counter for immediate testing
- ✅ **Complete development environment**: Includes Hardhat for smart contract development

## Smart Contract Development

The generated app includes a complete Hardhat development environment with all necessary files for FHEVM smart contract development:

### **📁 Hardhat Directory Structure:**
```
hardhat/
├── contracts/
│   └── FHECounter.sol          # FHE Counter smart contract
├── deploy/
│   └── deploy.ts              # Deployment script for Sepolia
├── test/
│   ├── FHECounter.ts          # Contract tests
│   └── FHECounterSepolia.ts   # Sepolia-specific tests
├── tasks/
│   ├── accounts.ts            # Account management tasks
│   └── FHECounter.ts          # FHE Counter specific tasks
├── hardhat.config.ts          # Hardhat configuration
├── package.json               # Hardhat dependencies
└── tsconfig.json             # TypeScript configuration
```

### **🔧 Available Commands:**
```bash
# Navigate to the hardhat directory
cd hardhat

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Sepolia testnet
npm run deploy

# Run tests
npm test

# Run tests on Sepolia
npx hardhat test --network sepolia

# Get account balances
npx hardhat accounts

# Run FHE Counter specific tasks
npx hardhat fhe-counter
```

### **📋 What's Included:**
- ✅ **FHE Counter Contract** - Complete Solidity smart contract
- ✅ **Deployment Scripts** - Ready-to-use Sepolia deployment
- ✅ **Test Suite** - Comprehensive contract testing
- ✅ **TypeScript Support** - Full type safety for contracts
- ✅ **Hardhat Tasks** - Custom CLI commands for FHE operations
- ✅ **Network Configuration** - Pre-configured for Sepolia testnet
- ✅ **FHEVM Integration** - Built-in FHEVM contract support

## Requirements

- Node.js 16 or higher
- npm or yarn
