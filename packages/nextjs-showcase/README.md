# ⚡ Next.js FHEVM Showcase

A Next.js application demonstrating the **Universal FHEVM SDK** using React adapter hooks with real FHEVM interactions on Sepolia testnet.

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Showcase                             │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  page.tsx    │  │ FheCounter   │  │ FheRatings   │      │
│  │  (App Router)│  │              │  │              │      │
│  │              │  │ useEncrypt() │  │ useEncrypt() │      │
│  │ useWallet()  │  │ useDecrypt() │  │ useDecrypt() │      │
│  │ useFhevm()   │  │ useContract()│  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘              │
│                           │                                   │
│                   ┌───────▼────────┐                        │
│                   │  @fhevm-sdk    │                        │
│                   │  React Adapter │                        │
│                   │                 │                        │
│                   │ ┌────────────┐ │                        │
│                   │ │ useWallet  │ │                        │
│                   │ │ useFhevm   │ │                        │
│                   │ │ useEncrypt │ │                        │
│                   │ │ useDecrypt │ │                        │
│                   │ │ useContract│ │                        │
│                   │ └─────┬───────┘ │                        │
│                   └───────┼─────────┘                        │
│                           │                                   │
│                   ┌───────▼────────┐                        │
│                   │   Core SDK     │                        │
│                   │  (fhevm-sdk)   │                        │
│                   └─────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 **Quick Start**

```bash
# Navigate to Next.js showcase
cd packages/nextjs-showcase

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3001
```

## ✨ **Features**

- ✅ **Next.js App Router** - Modern Next.js 15 with App Router
- ✅ **React Hooks** - Same hooks as React showcase
- ✅ **Real FHEVM interactions** - CDN-based FHEVM SDK
- ✅ **EIP-712 user decryption** - Proper authentication
- ✅ **Real contract interactions** - Sepolia testnet
- ✅ **Beautiful UI** - Zama theme (yellow & black)
- ✅ **TypeScript support** - Full type safety
- ✅ **Server-side ready** - Production optimized

## 🔧 **Tech Stack**

- **Next.js 15** - Modern Next.js with App Router
- **TypeScript** - Full type safety
- **React 18** - Modern React with hooks
- **Ethers.js** - Ethereum interactions
- **@fhevm-sdk** - Universal FHEVM SDK with React hooks adapter
- **Tailwind CSS** - Utility-first CSS

## 🎣 **Adapter Usage**

This showcase uses the same React hooks as the React showcase, but in a Next.js environment:

### **Main Page (`app/page.tsx`)**

```typescript
'use client';

import { useWallet, useFhevm } from '@fhevm-sdk';

export default function HomePage() {
  // Wallet connection hook
  const {
    address,
    chainId,
    isConnected,
    connect: connectWallet,
    disconnect: disconnectWallet,
    error: walletError
  } = useWallet();
  
  // FHEVM instance hook
  const {
    status: fhevmStatus,
    initialize: initializeFhevm,
    error: fhevmError
  } = useFhevm();
  
  // Auto-initialize FHEVM when wallet connects
  useEffect(() => {
    if (isConnected && fhevmStatus === 'idle') {
      initializeFhevm();
    }
  }, [isConnected, fhevmStatus, initializeFhevm]);
  
  // Rest of component...
}
```

### **Component Usage (FHEVM 0.9.0)**

Components use the same hooks as React showcase:
- `FheCounter.tsx` - Uses `useEncrypt`, `useDecrypt`, `useContract` (EIP-712 user decryption)
- `FheRatings.tsx` - Uses `useEncrypt`, `useDecrypt` (public decryption)
- `FheVoting.tsx` - Uses `useEncrypt`, `useDecrypt` (self-relaying decryption with `decryptMultiple`)

## 🎯 **Available Hooks**

Same as React showcase (FHEVM 0.9.0):
- **`useWallet()`** - Wallet connection management
- **`useFhevm()`** - FHEVM instance management
- **`useContract(address, abi)`** - Contract instance management
- **`useEncrypt()`** - Encryption operations
- **`useDecrypt()`** - Decryption operations (includes `decryptMultiple` for self-relaying pattern)

## 🎯 **What It Demonstrates**

1. **Next.js Integration** - Using FHEVM SDK in Next.js App Router
2. **Client Components** - Using `'use client'` directive
3. **React Hooks** - Same adapter hooks as React showcase
4. **Real FHEVM interactions** - CDN-based FHEVM SDK
5. **EIP-712 authentication** - Proper user decryption
6. **Real contract interactions** - Sepolia testnet

## 🌐 **Live Demo**

- **URL:** http://localhost:3001
- **FHE Counter Contract:** `0x1b45fa7b7766fb27A36fBB0cfb02ea904214Cc75` (FHEVM 0.9.0)
- **Ratings Contract:** `0x0382053b0eae2A4A45C4A668505E2030913f559e` (FHEVM 0.9.0)
- **Voting Contract:** `0x4D15cA56c8414CF1bEF42B63B0525aFc3751D2d1` (FHEVM 0.9.0)
- **Network:** Sepolia testnet (Chain ID: 11155111)

## 📱 **Usage Flow**

Same as React showcase:
1. Connect wallet → Auto-initialize FHEVM → Use hooks for operations

## 🛠️ **Development**

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📦 **Dependencies**

- `next` - Next.js framework
- `react` - React framework
- `ethers` - Ethereum interactions
- `@fhevm-sdk` - Universal FHEVM SDK with React hooks
- `typescript` - Type safety
- `tailwindcss` - CSS framework

## 🎉 **Success Metrics**

- ✅ **Real FHEVM interactions** - No mocks
- ✅ **Next.js integration** - Works with App Router
- ✅ **React hooks integration** - Same adapter as React showcase
- ✅ **EIP-712 authentication** - Proper user decryption
- ✅ **Live contract integration** - Sepolia testnet
- ✅ **Beautiful UI** - Zama theme
- ✅ **Production ready** - Optimized build

**Ready for production use!** 🚀
