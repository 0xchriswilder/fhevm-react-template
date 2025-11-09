# ⚛️ React FHEVM Showcase

A React application demonstrating the **Universal FHEVM SDK** using React adapter hooks with real FHEVM interactions on Sepolia testnet.

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                   React Showcase                              │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  App.tsx     │  │ FheCounter   │  │ FheRatings   │      │
│  │              │  │              │  │              │      │
│  │ useWallet()  │  │ useEncrypt() │  │ useEncrypt() │      │
│  │ useFhevm()   │  │ useDecrypt() │  │ useDecrypt() │      │
│  └──────┬───────┘  │ useContract()│  │              │      │
│         │          └──────┬───────┘  └──────┬───────┘      │
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
# Navigate to React showcase
cd packages/react-showcase

# Install dependencies
pnpm install

# Start development server
pnpm start

# Open http://localhost:3000
```

## ✨ **Features**

- ✅ **React Hooks** - Uses `useWallet`, `useFhevm`, `useEncrypt`, `useDecrypt`
- ✅ **Real FHEVM interactions** - CDN-based FHEVM SDK
- ✅ **EIP-712 user decryption** - Proper authentication
- ✅ **Real contract interactions** - Sepolia testnet
- ✅ **Beautiful UI** - Zama theme (yellow & black)
- ✅ **TypeScript support** - Full type safety

## 🔧 **Tech Stack**

- **React 18** - Modern React with hooks
- **TypeScript** - Full type safety
- **Create React App** - Zero-config React setup
- **Ethers.js** - Ethereum interactions
- **@fhevm-sdk** - Universal FHEVM SDK with React hooks adapter

## 🎣 **Adapter Usage**

This showcase demonstrates how to use the React adapter hooks from `@fhevm-sdk`:

### **Main App (`App.tsx`)**

```typescript
import { useWallet, useFhevm } from '@fhevm-sdk';

function App() {
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

### **Counter Component (`FheCounter.tsx`)**

```typescript
import { useDecrypt, useEncrypt, useContract } from '@fhevm-sdk';

export default function FheCounter({ account, chainId, isConnected, fhevmStatus }) {
  // Encryption hook
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt();
  
  // Decryption hook
  const { decrypt, isDecrypting, error: decryptError } = useDecrypt();
  
  // Contract hook
  const { contract } = useContract(contractAddress, CONTRACT_ABI);
  
  // Use hooks for operations
  const handleIncrement = async () => {
    const encrypted = await encrypt(contractAddress, account, 1);
    await contract.increment(encrypted.handles[0], encrypted.inputProof);
  };
  
  const handleDecrypt = async () => {
    const decrypted = await decrypt(countHandle, contractAddress, signer);
    setDecryptedCount(decrypted);
  };
  
  // Rest of component...
}
```

### **Ratings Component (`FheRatings.tsx`)**

```typescript
import { useEncrypt, useDecrypt } from '@fhevm-sdk';

export default function FheRatings({ account, chainId, isConnected, fhevmStatus }) {
  // Encryption hook
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt();
  
  // Decryption hook (with publicDecrypt)
  const { publicDecrypt, isDecrypting, error: decryptError } = useDecrypt();
  
  // Submit rating
  const submitRating = async (cardId, rating) => {
    const encrypted = await encrypt(RATINGS_CONTRACT_ADDRESS, account, rating);
    await contract.submitEncryptedRating(cardId, encrypted.handles[0], encrypted.inputProof);
  };
  
  // Decrypt stats (public decryption)
  const decryptStats = async (cardId) => {
    const stats = await contract.getEncryptedStats(cardId);
    const sum = await publicDecrypt(stats.sum);
    const count = await publicDecrypt(stats.count);
    const average = sum / count;
  };
  
  // Rest of component...
}
```

### **Voting Component (`FheVoting.tsx`)** (FHEVM 0.9.0 - Self-Relaying Decryption)

```typescript
import { useEncrypt, useDecrypt } from '@fhevm-sdk';

export default function FheVoting({ account, chainId, isConnected, fhevmStatus }) {
  // Encryption hook
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt();
  
  // Decryption hook (with decryptMultiple for self-relaying pattern)
  const { decryptMultiple, isDecrypting, error: decryptError } = useDecrypt();
  
  // Cast vote
  const castVote = async (sessionId, vote) => {
    const encrypted = await encrypt(VOTING_CONTRACT_ADDRESS, account, vote === 'yes' ? 1 : 0);
    await contract.vote(sessionId, encrypted.encryptedData, encrypted.proof);
  };
  
  // Request tally reveal with self-relaying decryption
  const requestTallyReveal = async (sessionId) => {
    // Step 1: Request reveal (emits event with handles)
    const tx = await contract.requestTallyReveal(sessionId);
    const receipt = await tx.wait();
    
    // Step 2: Extract handles from event
    const event = receipt.logs.find(log => {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === 'TallyRevealRequested';
    });
    const { yesVotesHandle, noVotesHandle } = contract.interface.parseLog(event).args;
    
    // Step 3: Decrypt multiple handles
    const { cleartexts, decryptionProof, values } = await decryptMultiple(
      VOTING_CONTRACT_ADDRESS,
      signer,
      [yesVotesHandle, noVotesHandle]
    );
    
    // Step 4: Submit callback with proof
    await contract.resolveTallyCallback(sessionId, cleartexts, decryptionProof);
  };
  
  // Rest of component...
}
```

## 🎯 **Available Hooks**

### **`useWallet()`**
Manages wallet connection state:
- `address` - Connected wallet address
- `chainId` - Current chain ID
- `isConnected` - Connection status
- `connect()` - Connect wallet
- `disconnect()` - Disconnect wallet
- `error` - Connection errors

### **`useFhevm()`**
Manages FHEVM instance:
- `status` - Initialization status ('idle' | 'loading' | 'ready' | 'error')
- `initialize()` - Initialize FHEVM instance
- `isInitialized` - Ready state
- `error` - Initialization errors

### **`useContract(address, abi)`**
Manages contract instance:
- `contract` - Ethers.js contract instance
- `isReady` - Contract ready state
- `error` - Contract setup errors

### **`useEncrypt()`**
Encryption operations:
- `encrypt(contractAddress, userAddress, value)` - Create encrypted input
- `isEncrypting` - Encryption in progress
- `error` - Encryption errors

### **`useDecrypt()`** (FHEVM 0.9.0)
Decryption operations:
- `decrypt(handle, contractAddress, signer)` - User decryption (EIP-712)
- `publicDecrypt(handle)` - Public decryption (no signature)
- `decryptMultiple(contractAddress, signer, handles[])` - Decrypt multiple handles for self-relaying pattern (returns `{ cleartexts, decryptionProof, values }`)
- `isDecrypting` - Decryption in progress
- `error` - Decryption errors

## 🎯 **What It Demonstrates**

1. **Wallet Connection** - Using `useWallet()` hook
2. **FHEVM Initialization** - Using `useFhevm()` hook
3. **Contract Reading** - Using `useContract()` hook
4. **EIP-712 Decryption** - Using `decrypt()` from `useDecrypt()`
5. **Encrypted Input** - Using `encrypt()` from `useEncrypt()`
6. **Transaction Sending** - Encrypted transactions with hooks

## 🌐 **Live Demo**

- **URL:** http://localhost:3000
- **FHE Counter Contract:** `0x1b45fa7b7766fb27A36fBB0cfb02ea904214Cc75` (FHEVM 0.9.0)
- **Ratings Contract:** `0x0382053b0eae2A4A45C4A668505E2030913f559e` (FHEVM 0.9.0)
- **Voting Contract:** `0x4D15cA56c8414CF1bEF42B63B0525aFc3751D2d1` (FHEVM 0.9.0)
- **Network:** Sepolia testnet (Chain ID: 11155111)

## 📱 **Usage Flow**

```
1. User clicks "Connect Wallet"
   ↓
2. useWallet().connect() called
   ↓
3. Wallet connected, useFhevm().initialize() auto-triggered
   ↓
4. FHEVM ready, user can interact with contracts
   ↓
5. User clicks "Increment"
   ↓
6. useEncrypt().encrypt() creates encrypted input
   ↓
7. Contract.increment() called with encrypted data
   ↓
8. User clicks "Decrypt"
   ↓
9. useDecrypt().decrypt() decrypts value (EIP-712 signing)
   ↓
10. Decrypted value displayed
```

## 🛠️ **Development**

```bash
# Start development server
pnpm start

# Build for production
pnpm build

# Run tests
pnpm test
```

## 📦 **Dependencies**

- `react` - React framework
- `ethers` - Ethereum interactions
- `@fhevm-sdk` - Universal FHEVM SDK with React hooks
- `typescript` - Type safety
- `react-scripts` - Build tools

## 🎉 **Success Metrics**

- ✅ **Real FHEVM interactions** - No mocks
- ✅ **React hooks integration** - Clean adapter usage
- ✅ **EIP-712 authentication** - Proper user decryption
- ✅ **Live contract integration** - Sepolia testnet
- ✅ **Beautiful UI** - Zama theme
- ✅ **Complete workflow** - From reading to transactions

**Ready for production use!** 🚀
