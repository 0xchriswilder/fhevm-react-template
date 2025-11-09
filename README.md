# 🔐 Universal FHEVM SDK

A framework-agnostic toolkit that helps developers build confidential dApps with ease. Built with a modular adapter architecture that works seamlessly across React, Next.js, Vue, and Node.js environments.

## 🎥 **Video Demo**

[![YouTube](https://img.shields.io/badge/YouTube-Demo%20Video-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=UJPTUMk47hE)

**Watch the Universal FHEVM SDK in action!** See live demos of all showcases and learn how to use the adapters in your projects.

👉 **[Watch on YouTube](https://www.youtube.com/watch?v=UJPTUMk47hE)**

## 🌐 **Live Examples**

All examples are running with **real FHEVM interactions** on Sepolia testnet:

- **![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) React Showcase:** [https://react-showcase-1738.up.railway.app/](https://react-showcase-1738.up.railway.app/)
- **![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) Next.js Showcase:** [https://nextjs-showcase-1661.up.railway.app/](https://nextjs-showcase-1661.up.railway.app/)
- **![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D) Vue Showcase:** [https://vue-showcase-2780.up.railway.app/](https://vue-showcase-2780.up.railway.app/)
- **![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) Node.js Showcase:** [packages/node-showcase/](packages/node-showcase/)

**Contract Details (FHEVM 0.9.0):**
- **FHE Counter Contract:** `0x1b45fa7b7766fb27A36fBB0cfb02ea904214Cc75`
- **Ratings Contract:** `0x0382053b0eae2A4A45C4A668505E2030913f559e`
- **Voting Contract:** `0x4D15cA56c8414CF1bEF42B63B0525aFc3751D2d1`
- **Network:** Sepolia testnet (Chain ID: 11155111)
- **FHEVM Version:** 0.9.0
- **Relayer SDK:** 0.3.0-5

## 🌍 **Languages / Langues / 语言**
[![English](https://img.shields.io/badge/English-🇺🇸-blue)](README.md)
[![Français](https://img.shields.io/badge/Français-🇫🇷-red)](README.fr.md)
[![中文](https://img.shields.io/badge/中文-🇨🇳-green)](README.zh.md)

## 📐 **Architecture Overview**

### **SDK Architecture**

```
┌──────────────────────────────────────────────────────────────────────┐
│                    Universal FHEVM SDK                               │
│                      packages/fhevm-sdk/                               │
└──────────────────────────────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
    ┌─────▼─────┐          ┌───────▼───────┐      ┌───────▼───────┐
    │   CORE    │          │   ADAPTERS    │      │   SHOWCASES   │
    │src/core/  │          │src/adapters/  │      │  packages/    │
    └─────┬─────┘          └───────┬───────┘      └───────┬───────┘
          │                        │                       │
    ┌─────┴─────────────────────────────────────────────────────┐
    │                                                             │
    │  ┌──────────┐     ┌──────────┐     ┌──────────┐           │
    │  │fhevm.ts  │     │contracts.│     │index.ts  │           │
    │  │          │     │ts        │     │(exports) │           │
    │  │-initialize│    │          │     └──────────┘           │
    │  │-createEnc│    │-FhevmCon │                              │
    │  │-decrypt  │    │tract     │                              │
    │  │-publicDec│    └──────────┘                              │
    │  │-test/    │                                               │
    │  └──────────┘                                               │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
                                                                  
          ┌───────────────────────────────────────┐
          │                                       │
    ┌─────▼─────┐      ┌─────▼─────┐    ┌─────▼─────┐
    │  react.ts │      │  vue.ts   │    │  node.ts  │
    │           │      │           │    │           │
    │useWallet  │      │useWalletVue│   │FhevmNode  │
    │useFhevm   │      │useFhevmVue │   │(class)    │
    │useContract│      │useContract │   └───────────┘
    │useEncrypt │      │useEncrypt  │
    │useDecrypt │      │useDecrypt  │
    │useFhevmOps│      │useFhevmOps │
    └───────────┘      └───────────┘
                                                                  
          ┌───────────────────────────────────────┐
          │                                       │
    ┌─────▼─────────┐  ┌─────▼─────────┐  ┌─────▼─────────┐
    │react-showcase │  │nextjs-showcase │  │ vue-showcase  │
    │               │  │                │  │               │
    │App.tsx        │  │page.tsx        │  │App.vue         │
    │FheCounter     │  │components/     │  │components/     │
    │FheRatings     │  │FHECounter      │  │FHECounter      │
    │FheVoting      │  │FHERatings      │  │FHERatings      │
    │               │  │SimpleVoting    │  │SimpleVoting    │
    │               │  │test/           │  │test/           │
    └───────────────┘  └────────────────┘  └───────────────┘
                                            
    ┌─────────────────────────────────────────┐
    │        node-showcase                    │
    │                                         │
    │  index.ts     server.ts    explorer.ts  │
    │  counter.ts   voting.ts    ratings.ts   │
    │                                         │
    └─────────────────────────────────────────┘
```

### **Data Flow Architecture**

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ react-showcase  │      │ vue-showcase    │      │ node-showcase   │
│                 │      │                 │      │                 │
│ App.tsx         │      │ App.vue         │      │ index.ts        │
│ FheCounter.tsx  │      │ FheCounter.vue  │      │ counter.ts      │
│ FheRatings.tsx  │      │ FheRatings.vue  │      │ voting.ts       │
│ FheVoting.tsx   │      │ FheVoting.vue   │      │ ratings.ts      │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │ import { useWallet,    │ import { useWalletVue,│ import { FhevmNode
         │         useFhevm,      │         useFhevmVue } │         } from
         │         useEncrypt,    │         } from         │         '@fhevm-sdk'
         │         useDecrypt }   │         '@fhevm-sdk'   │
         │ from '@fhevm-sdk'      │                        │
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   @fhevm-sdk/src/          │
                    │                           │
                    │   ┌─────────────────────┐ │
                    │   │  adapters/react.ts  │ │
                    │   │  adapters/vue.ts     │ │
                    │   │  adapters/node.ts   │ │
                    │   └──────────┬──────────┘ │
                    │              │            │
                    │   ┌──────────▼──────────┐ │
                    │   │   core/index.ts     │ │
                    │   │   core/fhevm.ts     │ │
                    │   │   core/contracts.ts │ │
                    │   └──────────┬──────────┘ │
                    └──────────────┼────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      Zama Relayer SDK       │
                    │   (@zama-fhe/relayer-sdk)   │
                    │                             │
                    │   ┌──────────────────────┐ │
                    │   │ createInstance()      │ │
                    │   │ createEncryptedInput │ │
                    │   │ decryptValue()       │ │
                    │   │ publicDecrypt()      │ │
                    │   └──────────────────────┘ │
                    └─────────────────────────────┘
```

## 🏗️ **Project Structure**

```
fhevm-react-template/
├── packages/
│   ├── fhevm-sdk/                    # Universal FHEVM SDK Core
│   │   ├── src/
│   │   │   ├── core/                 # Core FHEVM functionality
│   │   │   │   ├── fhevm.ts         # FHEVM client initialization
│   │   │   │   ├── encryption.ts    # Encryption operations
│   │   │   │   └── decryption.ts    # Decryption operations
│   │   │   └── adapters/             # Framework-specific adapters
│   │   │       ├── react.ts          # React hooks (re-exports)
│   │   │       ├── useWallet.ts      # Wallet connection hook
│   │   │       ├── useFhevm.ts       # FHEVM instance hook
│   │   │       ├── useContract.ts    # Contract interaction hook
│   │   │       ├── useEncrypt.ts     # Encryption hook
│   │   │       ├── useDecrypt.ts     # Decryption hook
│   │   │       ├── useFhevmOperations.ts  # Combined operations hook
│   │   │       ├── vue.ts            # Vue composables
│   │   │       └── node.ts           # Node.js class adapter
│   │   └── dist/                     # Built output
│   │
│   ├── react-showcase/               # React Example
│   │   ├── src/
│   │   │   ├── App.tsx               # Main app (uses adapters)
│   │   │   └── components/
│   │   │       ├── FheCounter.tsx    # Uses useEncrypt, useDecrypt
│   │   │       ├── FheRatings.tsx    # Uses useEncrypt, useDecrypt
│   │   │       └── FheVoting.tsx    # Uses useEncrypt
│   │
│   ├── nextjs-showcase/              # Next.js Example
│   │   ├── app/
│   │   │   └── page.tsx              # Main page (uses adapters)
│   │   └── components/                # Same as React showcase
│   │
│   ├── vue-showcase/                  # Vue Example
│   │   ├── src/
│   │   │   ├── App.vue               # Main app (uses composables)
│   │   │   └── components/
│   │   │       ├── FheCounter.vue   # Uses useEncryptVue, useDecryptVue
│   │   │       ├── FheRatings.vue   # Uses useEncryptVue, useDecryptVue
│   │   │       └── FheVoting.vue    # Uses useEncryptVue
│   │
│   ├── node-showcase/                 # Node.js Example
│   │   ├── src/
│   │   │   ├── index.ts              # Main entry (uses FhevmNode)
│   │   │   ├── counter.ts            # Counter demo
│   │   │   ├── voting.ts             # Voting demo
│   │   │   └── ratings.ts            # Ratings demo
│   │
│   └── hardhat/                       # Smart Contracts
│       ├── contracts/                 # Solidity contracts
│       └── deploy/                    # Deployment scripts
│
├── pnpm-workspace.yaml                 # Monorepo configuration
└── README.md                           # This file
```

## 🔧 **Adapter System**

### **How Adapters Work**

The Universal FHEVM SDK uses a **clean adapter architecture** where:

1. **Core** provides framework-agnostic FHEVM operations
2. **Adapters** wrap core functionality in framework-specific APIs
3. **Showcases** demonstrate real-world usage with adapters

### **React/Next.js Adapters**

**Hooks-based API** - Similar to Wagmi pattern:

```typescript
import { useWallet, useFhevm, useEncrypt, useDecrypt, useContract } from '@fhevm-sdk';

function MyComponent() {
  // Wallet connection
  const { address, isConnected, chainId, connect, disconnect } = useWallet();
  
  // FHEVM instance
  const { status, initialize, isInitialized } = useFhevm();
  
  // Contract interaction
  const { contract, isReady } = useContract(contractAddress, abi);
  
  // Encryption
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt();
  
  // Decryption (FHEVM 0.9.0)
  const { decrypt, publicDecrypt, decryptMultiple, isDecrypting, error: decryptError } = useDecrypt();
  
  // Usage example
  const handleIncrement = async () => {
    const encrypted = await encrypt(contractAddress, address, 1);
    await contract.increment(encrypted.encryptedData, encrypted.proof);
  };
  
  // Self-relaying decryption example (for voting)
  const handleTallyReveal = async (sessionId) => {
    const tx = await contract.requestTallyReveal(sessionId);
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === 'TallyRevealRequested';
    });
    const { yesVotesHandle, noVotesHandle } = contract.interface.parseLog(event).args;
    const { cleartexts, decryptionProof, values } = await decryptMultiple(
      contractAddress,
      signer,
      [yesVotesHandle, noVotesHandle]
    );
    await contract.resolveTallyCallback(sessionId, cleartexts, decryptionProof);
  };
  
  return (
    <div>
      {!isConnected && <button onClick={connect}>Connect Wallet</button>}
      {isConnected && <button onClick={handleIncrement}>Increment</button>}
    </div>
  );
}
```

### **Vue Adapters**

**Composables-based API** - Vue 3 Composition API:

```typescript
<script setup lang="ts">
import { useWalletVue, useFhevmVue, useEncryptVue, useDecryptVue } from '@fhevm-sdk';

// Wallet connection
const { address, isConnected, chainId, connect, disconnect } = useWalletVue();

// FHEVM instance
const { status, initialize, isInitialized } = useFhevmVue();

// Encryption
const { encrypt, isEncrypting, error: encryptError } = useEncryptVue();

// Decryption (FHEVM 0.9.0)
const { decrypt, publicDecrypt, decryptMultiple, isDecrypting, error: decryptError } = useDecryptVue();

// Usage example
const handleIncrement = async () => {
  const encrypted = await encrypt.value(contractAddress, address.value, 1);
  await contract.increment(encrypted.encryptedData, encrypted.proof);
};
</script>

<template>
  <div>
    <button v-if="!isConnected" @click="connect">Connect Wallet</button>
    <button v-if="isConnected" @click="handleIncrement">Increment</button>
  </div>
</template>
```

### **Node.js Adapter**

**Class-based API** - For server-side operations:

```typescript
import { FhevmNode } from '@fhevm-sdk';

const fhevm = new FhevmNode({
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  privateKey: 'YOUR_PRIVATE_KEY',
  chainId: 11155111
});

await fhevm.initialize();

// Encrypt
const encrypted = await fhevm.encrypt(contractAddress, walletAddress, 1);

// Decrypt
const decrypted = await fhevm.decrypt(handle, contractAddress);

// Public decrypt
const publicDecrypted = await fhevm.publicDecrypt(handle);

// Execute transaction
const contract = fhevm.createContract(contractAddress, abi);
await fhevm.executeEncryptedTransaction(contract, 'increment', encrypted);
```

## 🚀 **Quick Start**

### **Option 1: NPX Packages (Recommended)**

Create a new FHEVM project instantly:

```bash
# React
npx create-fhevm-react my-app
cd my-app
npm install && npm start

# Next.js
npx create-fhevm-nextjs my-app
cd my-app
npm install && npm run dev

# Vue 
npx create-fhevm-vue my-app
cd my-app
npm install && npm run dev
```

### **Option 2: Development Environment**

Clone and run the full development environment:

```bash
# 1. Clone repository
git clone https://github.com/your-username/fhevm-react-template.git
cd fhevm-react-template

# 2. Install dependencies
pnpm install

# 3. Build SDK
pnpm sdk:build

# 4. Run showcase
pnpm --filter react-showcase start      # React on :3000
pnpm --filter nextjs-showcase dev      # Next.js on :3001
pnpm --filter vue-showcase dev         # Vue on :3003
pnpm --filter node-showcase explorer   # Interactive CLI mode (recommended)
pnpm --filter node-showcase start      # HTTP server mode
pnpm --filter node-showcase cli        # Non-interactive CLI mode


```

### **HTTP Server Mode**

Run the following only in the  node-showcase dir  as an HTTP server with API endpoints:

```bash
# Start the HTTP server
pnpm start

# Server runs on http://localhost:3001
# Available endpoints:
# - GET  /          - List available endpoints
# - GET  /health    - Health check
# - GET  /config    - Get FHEVM configuration
# - POST /counter   - Run counter demo
# - POST /voting    - Run voting demo
# - POST /ratings   - Run ratings demo
# - POST /run-all   - Run all demos
```

**Test endpoints using PowerShell:**
```powershell
# Run counter demo
Invoke-RestMethod -Uri http://localhost:3001/counter -Method POST

# Run voting demo
Invoke-RestMethod -Uri http://localhost:3001/voting -Method POST

# Get configuration
Invoke-RestMethod -Uri http://localhost:3001/config -Method GET
```

### **Non-Interactive CLI Mode**

Run all demos sequentially without interaction:

```bash
# Run all demos at once
pnpm cli

# Output includes:
# - Counter demo: Increment → Decrement → Decrypt
# - Voting demo: Create session → Vote
# - Ratings demo: Submit rating → Public decrypt stats
```

## 🛠️ **Development**

```bash
# Interactive CLI mode (recommended for testing)
pnpm explorer

# HTTP server mode
pnpm start

# Non-interactive CLI mode
pnpm cli

# Development mode (watch HTTP server)
pnpm dev

# Build TypeScript
pnpm build
```

## 🎯 **FHEVM Explorer - Interactive Demo Experience**

The **FHEVM Explorer** is an interactive CLI wizard that provides a guided, user-friendly way to explore the Universal FHEVM SDK capabilities. It's the recommended way to experience FHEVM demos step-by-step.

### **What the Explorer Does**

The Explorer offers a beautiful, context-aware interface that guides you through FHEVM operations:

- **🌐 Interactive Menu** - Navigate through different demo options with arrow keys
- **🔢 Counter Demo** - Experience increment/decrement operations with encrypted values
  - Interactive prompts for increment/decrement amounts
  - Real-time transaction feedback
  - Decryption results display
- **🗳️ Voting Demo** - Explore encrypted voting systems
  - Create voting sessions or use existing ones
  - Choose votes (Yes/No) with encryption
  - View encrypted results after voting
- **⭐ Ratings Demo** - Submit encrypted ratings and reviews
  - Create review cards
  - Submit encrypted ratings with user input
  - View public decrypted statistics
- **🔍 Test Mode** - Verify your setup before running demos
  - Check environment variables configuration
  - Verify network connection
  - Test wallet setup
  - Validate FHEVM client initialization
  - Verify contract accessibility
- **🎯 Run All Demos** - Execute all demos sequentially in one session
- **📊 Session Summary** - Track all completed demos with timestamps and results

### **Key Features**

- **Beautiful UI** - Color-coded output with loading spinners and progress indicators
- **Guided Experience** - Step-by-step prompts that walk you through each operation
- **Real Transactions** - All demos use actual blockchain transactions on Sepolia testnet
- **Error Handling** - Helpful error messages and recovery suggestions
- **Session Tracking** - Keep track of all demos you've completed with detailed summaries

### **Example Session Flow**

```
🌐 Welcome to FHEVM Explorer!
Universal FHEVM SDK - Interactive Demo Experience

   Explore the world of confidential computing on blockchain
   Experience encrypted operations with guided demos

✅ FHEVM environment ready!
   Wallet: 0xb8c81a641A4A4C47d11e5464C77EdcB9737784CC
   Balance: 0.042681970725989092 ETH
   Network: Sepolia (11155111)

? Choose your FHEVM demo:
❯ 🔢 Counter Demo - Increment/Decrement Operations
  🗳️  Voting Demo - Encrypted Voting System
  ⭐ Ratings Demo - Review Cards with Encrypted Ratings
  🔍 Test Mode - Verify Setup Only
  🎯 Run All Demos
  ❌ Exit Explorer
```

### **How to Use**

```bash
# Navigate to node-showcase
cd packages/node-showcase

# Start the interactive explorer
pnpm explorer
```

The Explorer will:
1. Initialize your FHEVM environment and verify configuration
2. Display an interactive menu with all available demos
3. Guide you through each demo with prompts and feedback
4. Show real-time transaction status and results
5. Track your session and provide a summary at the end

This is the perfect tool for developers learning FHEVM or demonstrating the SDK's capabilities to others!
<<<<<<< Updated upstream


=======
>>>>>>> Stashed changes

## 📚 **Showcase Documentation**

Each showcase demonstrates real-world adapter usage:

- **[React Showcase](./packages/react-showcase/README.md)** - React hooks usage
- **[Next.js Showcase](./packages/nextjs-showcase/README.md)** - Next.js with React hooks
- **[Vue Showcase](./packages/vue-showcase/README.md)** - Vue composables usage
- **[Node.js Showcase](./packages/node-showcase/README.md)** - Server-side operations
  - 🌐 **Interactive CLI Mode** - Guided wizard with prompts (`pnpm explorer`)
  - 🌐 **HTTP Server Mode** - REST API with endpoints (`pnpm start`)
  - 🌐 **Non-Interactive CLI Mode** - Sequential execution (`pnpm cli`)

## 🧪 **Testing**

All showcases include comprehensive FHEVM contract tests in their respective `test/` directories:

- **`packages/react-showcase/test/`** - React showcase tests
- **`packages/nextjs-showcase/test/`** - Next.js showcase tests  
- **`packages/vue-showcase/test/`** - Vue showcase tests

Each test directory contains:
- **`FHECounter.test.js`** - Counter contract tests (increment, decrement, edge cases)
- **`FHERatings.test.js`** - Ratings contract tests (card creation, encrypted ratings, public decryption)
- **`SimpleVoting.test.js`** - Voting contract tests (session creation, encrypted voting, tally reveal)

### **Running Tests**

```bash
# Run all showcase tests
pnpm test:showcases

# Run tests for a specific showcase
pnpm test:react      # React showcase tests
pnpm test:nextjs     # Next.js showcase tests
pnpm test:vue        # Vue showcase tests

# Run from a specific showcase directory
cd packages/react-showcase && pnpm test
cd packages/nextjs-showcase && pnpm test
cd packages/vue-showcase && pnpm test

# Run Hardhat tests (includes all showcase tests)
pnpm hardhat:test
```

Tests run in Hardhat's FHEVM mock environment, allowing fast local testing without a live network.

## 🏆 **Key Features**

### **✅ Framework-Agnostic Core**
- Single core implementation used by all adapters
- No framework-specific dependencies in core
- Easy to extend with new adapters

### **✅ Wagmi-like API**
- Familiar patterns for web3 developers
- Hooks-based (React) and composables-based (Vue)
- Clean, intuitive interface

### **✅ TypeScript Support**
- Full type safety across all adapters
- Excellent IDE support
- Comprehensive type definitions

### **✅ Real FHEVM Operations (0.9.0)**
- EIP-712 signature-based decryption
- Public decryption support
- Self-relaying decryption pattern (event-driven)
- Multiple handle decryption (`decryptMultiple`)
- Encrypted transaction execution
- No mocks - all real blockchain interactions

### **✅ Multiple Demo Scenarios (FHEVM 0.9.0)**
- **Counter Demo:** Increment/decrement with EIP-712 user decryption
- **Ratings Demo:** Encrypted ratings with public decryption
- **Voting Demo:** Encrypted voting with self-relaying decryption (event-driven tally reveal)

## 🎯 **Usage Examples**

### **React Component**

```typescript
import { useWallet, useFhevm, useEncrypt, useDecrypt } from '@fhevm-sdk';

export default function FheCounter() {
  const { address, isConnected, connect } = useWallet();
  const { status, initialize } = useFhevm();
  const { encrypt } = useEncrypt();
  const { decrypt } = useDecrypt();
  
  useEffect(() => {
    if (isConnected && status === 'idle') {
      initialize();
    }
  }, [isConnected, status, initialize]);
  
  const handleIncrement = async () => {
    const encrypted = await encrypt(contractAddress, address, 1);
    // Execute transaction...
  };
  
  return <div>...</div>;
}
```

### **Vue Component**

```vue
<script setup lang="ts">
import { useWalletVue, useFhevmVue, useEncryptVue } from '@fhevm-sdk';

const { address, isConnected, connect } = useWalletVue();
const { status, initialize } = useFhevmVue();
const { encrypt } = useEncryptVue();

watch(() => isConnected.value, (newVal) => {
  if (newVal && status.value === 'idle') {
    initialize();
  }
});
</script>

<template>
  <div>...</div>
</template>
```

### **Node.js Script**

```typescript
import { FhevmNode } from '@fhevm-sdk';

async function main() {
  const fhevm = new FhevmNode({ rpcUrl, privateKey, chainId });
await fhevm.initialize();

  const encrypted = await fhevm.encrypt(contractAddress, walletAddress, 1);
  const contract = fhevm.createContract(contractAddress, abi);
  await fhevm.executeEncryptedTransaction(contract, 'increment', encrypted);
}
```

## 📋 **Requirements**

- **Node.js** 18+ 
- **pnpm** (recommended) or npm
- **MetaMask** (for frontend examples)
- **Sepolia ETH** (for transactions)

## 🔗 **Related Documentation**

- [SDK Documentation](./packages/fhevm-sdk/README.md)
- [React Showcase](./packages/react-showcase/README.md)
- [Next.js Showcase](./packages/nextjs-showcase/README.md)
- [Vue Showcase](./packages/vue-showcase/README.md)
- [Node.js Showcase](./packages/node-showcase/README.md)

## 📝 **License**

MIT License - see LICENSE file for details

## 🤝 **Contributing**

Contributions are welcome! Please see our contributing guidelines for more information.

---

**Built with Privacy for the Zama Universal FHEVM SDK Bounty**
