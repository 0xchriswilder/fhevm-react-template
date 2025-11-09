# 🌟 Vue FHEVM Showcase

A Vue 3 application demonstrating the **Universal FHEVM SDK** using Vue composables adapter with real FHEVM interactions on Sepolia testnet.

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                   Vue Showcase                                │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  App.vue     │  │ FheCounter  │  │ FheRatings   │      │
│  │              │  │    .vue     │  │    .vue      │      │
│  │              │  │              │  │              │      │
│  │useWalletVue()│  │useEncryptVue()│ │useEncryptVue()│      │
│  │useFhevmVue() │  │useDecryptVue()│ │useDecryptVue()│      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘              │
│                           │                                   │
│                   ┌───────▼────────┐                        │
│                   │  @fhevm-sdk    │                        │
│                   │  Vue Adapter   │                        │
│                   │                 │                        │
│                   │ ┌────────────┐ │                        │
│                   │ │useWalletVue│ │                        │
│                   │ │useFhevmVue │ │                        │
│                   │ │useEncryptVue││                        │
│                   │ │useDecryptVue││                        │
│                   │ │useContractVue││                        │
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
# Navigate to Vue showcase
cd packages/vue-showcase

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3003
```

## ✨ **Features**

- ✅ **Vue 3 Composables** - Uses `useWalletVue`, `useFhevmVue`, `useEncryptVue`, `useDecryptVue`
- ✅ **Composition API** - Modern Vue 3 with `<script setup>`
- ✅ **Real FHEVM interactions** - CDN-based FHEVM SDK
- ✅ **EIP-712 user decryption** - Proper authentication
- ✅ **Real contract interactions** - Sepolia testnet
- ✅ **Beautiful UI** - Zama theme (yellow & black)
- ✅ **TypeScript support** - Full type safety

## 🔧 **Tech Stack**

- **Vue 3** - Modern Vue with Composition API
- **TypeScript** - Full type safety
- **Vite** - Fast build tool
- **Ethers.js** - Ethereum interactions
- **@fhevm-sdk** - Universal FHEVM SDK with Vue composables adapter
- **Tailwind CSS** - Utility-first CSS

## 🎣 **Adapter Usage**

This showcase demonstrates how to use the Vue composables adapter from `@fhevm-sdk`:

### **Main App (`App.vue`)**

```vue
<script setup lang="ts">
import { useWalletVue, useFhevmVue } from '@fhevm-sdk';

// Wallet connection composable
const {
  address: account,
  chainId,
  isConnected,
  connect: connectWallet,
  disconnect: disconnectWallet,
  error: walletError
} = useWalletVue();

// FHEVM instance composable
const {
  status: fhevmStatus,
  initialize: initializeFhevm,
  error: fhevmError
} = useFhevmVue();

// Auto-initialize FHEVM when wallet connects
watch(() => isConnected.value, (newValue) => {
  if (newValue && fhevmStatus.value === 'idle') {
    initializeFhevm();
  }
});
</script>

<template>
  <div>
    <button v-if="!isConnected" @click="connectWallet">
      Connect Wallet
    </button>
    <div v-else>
      Connected: {{ account }}
      Chain ID: {{ chainId }}
    </div>
  </div>
</template>
```

### **Counter Component (`FheCounter.vue`)**

```vue
<script setup lang="ts">
import { useDecryptVue, useEncryptVue } from '@fhevm-sdk';

// Encryption composable
const { encrypt, isEncrypting, error: encryptError } = useEncryptVue();

// Decryption composable
const { decrypt, isDecrypting, error: decryptError } = useDecryptVue();

// Increment counter
const incrementCounter = async () => {
  const encrypted = await encrypt.value(contractAddress, account.value, 1);
  await contract.increment(encrypted.handles[0], encrypted.inputProof);
};

// Decrypt count
const handleDecrypt = async () => {
  const decrypted = await decrypt.value(countHandle.value, contractAddress);
  setDecryptedCount(decrypted);
};
</script>

<template>
  <div>
    <button 
      @click="incrementCounter" 
      :disabled="isEncrypting.value"
    >
      {{ isEncrypting ? 'Encrypting...' : 'Increment' }}
    </button>
    <button 
      @click="handleDecrypt" 
      :disabled="isDecrypting.value"
    >
      {{ isDecrypting ? 'Decrypting...' : 'Decrypt' }}
    </button>
  </div>
</template>
```

### **Ratings Component (`FheRatings.vue`)**

```vue
<script setup lang="ts">
import { useEncryptVue, useDecryptVue } from '@fhevm-sdk';

// Encryption composable
const { encrypt, isEncrypting, error: encryptError } = useEncryptVue();

// Decryption composable (with publicDecrypt)
const { publicDecrypt, isDecrypting, error: decryptError } = useDecryptVue();

// Submit rating
const submitRating = async (cardId: number, rating: number) => {
  const encrypted = await encrypt.value(RATINGS_CONTRACT_ADDRESS, account.value, rating);
  await contract.submitEncryptedRating(cardId, encrypted.handles[0], encrypted.inputProof);
};

// Decrypt stats (public decryption)
const decryptStats = async (cardId: number) => {
  const stats = await contract.getEncryptedStats(cardId);
  const sum = await publicDecrypt.value(stats.sum);
  const count = await publicDecrypt.value(stats.count);
  const average = sum / count;
};
</script>

<template>
  <div>
    <button @click="submitRating(cardId, 5)" :disabled="isEncrypting.value">
      Submit Rating
    </button>
    <button @click="decryptStats(cardId)" :disabled="isDecrypting.value">
      Decrypt Stats
    </button>
  </div>
</template>
```

## 🎯 **Available Composables**

### **`useWalletVue()`**
Manages wallet connection state:
- `address` (computed) - Connected wallet address
- `chainId` (computed) - Current chain ID
- `isConnected` (computed) - Connection status
- `connect()` - Connect wallet
- `disconnect()` - Disconnect wallet
- `error` (computed) - Connection errors

### **`useFhevmVue()`**
Manages FHEVM instance:
- `status` (computed) - Initialization status
- `initialize()` - Initialize FHEVM instance
- `isInitialized` (computed) - Ready state
- `error` (computed) - Initialization errors

### **`useContractVue(address, abi)`**
Manages contract instance:
- `contract` (computed) - Ethers.js contract instance
- `isReady` (computed) - Contract ready state
- `error` (computed) - Contract setup errors

### **`useEncryptVue()`**
Encryption operations:
- `encrypt` (computed function) - Create encrypted input
- `isEncrypting` (computed) - Encryption in progress
- `error` (computed) - Encryption errors

### **`useDecryptVue()`** (FHEVM 0.9.0)
Decryption operations:
- `decrypt` (computed function) - User decryption (EIP-712)
- `publicDecrypt` (computed function) - Public decryption
- `decryptMultiple` (computed function) - Decrypt multiple handles for self-relaying pattern (returns `{ cleartexts, decryptionProof, values }`)
- `isDecrypting` (computed) - Decryption in progress
- `error` (computed) - Decryption errors

## 🎯 **What It Demonstrates**

1. **Vue 3 Integration** - Using FHEVM SDK in Vue 3 with Composition API
2. **Composables Usage** - Framework-specific Vue composables
3. **Reactive State** - Vue reactivity system with computed properties
4. **Real FHEVM interactions** - CDN-based FHEVM SDK
5. **EIP-712 authentication** - Proper user decryption
6. **Real contract interactions** - Sepolia testnet

## 🌐 **Live Demo**

- **URL:** http://localhost:3003
- **FHE Counter Contract:** `0x1b45fa7b7766fb27A36fBB0cfb02ea904214Cc75` (FHEVM 0.9.0)
- **Ratings Contract:** `0x0382053b0eae2A4A45C4A668505E2030913f559e` (FHEVM 0.9.0)
- **Voting Contract:** `0x4D15cA56c8414CF1bEF42B63B0525aFc3751D2d1` (FHEVM 0.9.0)
- **Network:** Sepolia testnet (Chain ID: 11155111)

## 📱 **Usage Flow**

```
1. User clicks "Connect Wallet"
   ↓
2. useWalletVue().connect() called
   ↓
3. Wallet connected, useFhevmVue().initialize() auto-triggered
   ↓
4. FHEVM ready, user can interact with contracts
   ↓
5. User clicks "Increment"
   ↓
6. useEncryptVue().encrypt() creates encrypted input
   ↓
7. Contract.increment() called with encrypted data
   ↓
8. User clicks "Decrypt"
   ↓
9. useDecryptVue().decrypt() decrypts value (EIP-712 signing)
   ↓
10. Decrypted value displayed
```

## 🛠️ **Development**

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📦 **Dependencies**

- `vue` - Vue 3 framework
- `ethers` - Ethereum interactions
- `@fhevm-sdk` - Universal FHEVM SDK with Vue composables
- `typescript` - Type safety
- `vite` - Build tool
- `tailwindcss` - CSS framework

## 🎉 **Success Metrics**

- ✅ **Real FHEVM interactions** - No mocks
- ✅ **Vue composables integration** - Clean adapter usage
- ✅ **EIP-712 authentication** - Proper user decryption
- ✅ **Live contract integration** - Sepolia testnet
- ✅ **Beautiful UI** - Zama theme
- ✅ **Complete workflow** - From reading to transactions

**Ready for production use!** 🚀
