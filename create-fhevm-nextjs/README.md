# create-fhevm-nextjs

Create a NextJS app with FHEVM SDK integration in seconds!

## 🚀 Quick Start

```bash
npx create-fhevm-nextjs my-fhevm-app
cd my-fhevm-app
npm install
npm run dev
```

## ✨ What You Get

- ✅ **Complete NextJS project** with FHEVM SDK integration
- ✅ **Bundled FHEVM SDK** - No workspace dependencies needed
- ✅ **CDN relayer setup** - Automatic script injection
- ✅ **TypeScript support** - Full type safety
- ✅ **Example components** - Ready-to-use FHEVM operations
- ✅ **Tailwind CSS** - Beautiful, responsive design
- ✅ **Production ready** - Optimized for deployment
- ✅ **Deployed FHE Counter Contract** - Live on Sepolia testnet
- ✅ **Universal FHEVM SDK** - Complete utilities for FHE operations
- ✅ **Complete Hardhat environment** - Smart contract development included

## 🎯 Features

### **FHEVM SDK Integration**
- Complete FHEVM SDK with all adapters
- React hooks for NextJS
- TypeScript support
- CDN relayer integration

### **Example Components**
- Wallet connection
- FHEVM operations (encrypt/decrypt)
- Smart contract interaction
- Public decryption testing
- Error handling

### **Developer Experience**
- Hot reloading
- TypeScript IntelliSense
- Tailwind CSS styling
- Responsive design

## 🏗️ Project Structure

```
my-fhevm-app/
├── app/
│   ├── layout.tsx          # CDN script + FhevmProvider
│   ├── page.tsx            # Main showcase component
│   └── providers/
│       └── FhevmProvider.tsx
├── fhevm-sdk/              # Bundled FHEVM SDK
│   ├── dist/               # Built SDK files
│   └── package.json        # SDK configuration
├── types/
│   ├── cdn.d.ts           # CDN type declarations
│   └── ethereum.d.ts      # Ethereum types
├── package.json           # Dependencies
├── next.config.js         # NextJS configuration
└── tailwind.config.js     # Tailwind configuration
```

## 🔧 Usage

### **1. Create Project**
```bash
npx create-fhevm-nextjs my-app
```

### **2. Install Dependencies**
```bash
cd my-app
npm install
```

### **3. Start Development**
```bash
npm run dev
```

### **4. Build for Production**
```bash
npm run build
npm start
```

## 📦 Dependencies

The generated project includes:

- **NextJS 15** - React framework
- **FHEVM SDK** - Bundled locally
- **Ethers.js** - Ethereum interactions
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## 🚀 Deployment

The generated project is ready for deployment on:

- **Vercel** - Recommended for NextJS
- **Railway** - Great for monorepos
- **Netlify** - Static site hosting
- **Any Node.js hosting** - Docker, AWS, etc.

## 🎯 FHEVM Operations

The generated app includes examples for:

- **Wallet Connection** - MetaMask integration
- **FHEVM Initialization** - SDK setup
- **Encryption/Decryption** - Data operations
- **Smart Contract Interaction** - Blockchain operations
- **Public Decryption** - Testing utilities

## 🏗️ Deployed FHE Counter Contract

The generated app includes a **pre-deployed FHE Counter Contract** on Sepolia testnet for testing:

- **Contract Address**: `0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e`
- **Network**: Sepolia testnet (Chain ID: 11155111)
- **Features**: 
  - Get encrypted count from contract
  - Increment/decrement with encrypted inputs
  - User decryption with EIP-712 signing
  - Public decryption demo

### **Universal FHEVM SDK Utilities**
- **FHEVM Initialization** - SDK setup and configuration
- **Encrypted Inputs Creation** - Generate encrypted data for contracts
- **User Decryption** - EIP-712 signed decryption flows
- **Public Decryption** - No signature required decryption

## 🔨 Smart Contract Development

The generated app includes a complete Hardhat development environment with all necessary files for FHEVM smart contract development:

### **📁 Hardhat Directory Structure:**
```
hardhat/
├── contracts/
│   └── FHECounter.sol          # FHE Counter smart contract
├── deploy/
│   └── deploy.ts              # Deployment script
├── hardhat.config.js          # Hardhat configuration (JavaScript)
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
npm run compile

# Start local hardhat node
npm run chain

# Deploy to hardhat network
npm run deploy:hardhat

# Deploy to Sepolia testnet (requires INFURA_API_KEY)
npm run deploy:sepolia
```

### **📋 What's Included:**
- ✅ **FHE Counter Contract** - Complete Solidity smart contract
- ✅ **Deployment Scripts** - Ready-to-use deployment scripts
- ✅ **TypeScript Support** - Full type safety for contracts
- ✅ **Network Configuration** - Pre-configured for hardhat and sepolia
- ✅ **FHEVM Integration** - Built-in FHEVM contract support
- ✅ **Simplified Scripts** - Clean, focused deployment commands
- ✅ **JavaScript Config** - No TypeScript compilation issues

## 📚 Learn More

- [FHEVM Documentation](https://docs.fhevm.io)
- [NextJS Documentation](https://nextjs.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details.
