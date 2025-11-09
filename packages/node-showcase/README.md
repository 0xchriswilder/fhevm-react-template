# 🖥️ Node.js FHEVM Showcase

A Node.js CLI application demonstrating the **Universal FHEVM SDK** using the Node.js class adapter (`FhevmNode`) with real server-side blockchain interactions on Sepolia testnet.

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                  Node.js Showcase                            │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  index.ts    │  │ counter.ts    │  │ voting.ts    │      │
│  │              │  │              │  │              │      │
│  │              │  │              │  │              │      │
│  │              │  │              │  │              │      │
│  │              │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         │                 │                  │               │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘              │
│                           │                                   │
│                   ┌───────▼────────┐                        │
│                   │   FhevmNode    │                        │
│                   │   Class Adapter│                        │
│                   │                 │                        │
│                   │ ┌────────────┐ │                        │
│                   │ │initialize()│ │                        │
│                   │ │encrypt()   │ │                        │
│                   │ │decrypt()   │ │                        │
│                   │ │publicDecrypt││                        │
│                   │ │createContract│                        │
│                   │ │executeTx() │ │                        │
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
# Navigate to Node.js showcase
cd packages/node-showcase

# Install dependencies
pnpm install

# Run the showcase
pnpm start

# This runs:
# - Counter demo (increment/decrement/decrypt)
# - Voting demo (create session/vote)
# - Ratings demo (submit rating/public decrypt)
```

## ✨ **Features**

- ✅ **Node.js Adapter** - Uses `FhevmNode` class adapter
- ✅ **Real FHEVM operations** - Server-side blockchain interactions
- ✅ **Multiple demos** - Counter, Voting, Ratings
- ✅ **EIP-712 decryption** - Proper authentication
- ✅ **Public decryption** - No signature required
- ✅ **Self-relaying decryption** - Event-driven pattern with `decryptMultiple` (FHEVM 0.9.0)
- ✅ **Real contract interactions** - Sepolia testnet
- ✅ **CLI interface** - Command-line operations
- ✅ **TypeScript support** - Full type safety

## 🔧 **Tech Stack**

- **Node.js** - Server-side JavaScript runtime
- **TypeScript** - Full type safety
- **Ethers.js** - Ethereum interactions
- **@fhevm-sdk** - Universal FHEVM SDK with Node.js adapter
- **tsx** - TypeScript execution

## 🎣 **Adapter Usage**

This showcase demonstrates how to use the Node.js class adapter (`FhevmNode`) from `@fhevm-sdk`:

### **Main Entry (`src/index.ts`)**

```typescript
import { FhevmNode } from '../../fhevm-sdk/dist/adapters/node.js';
import { runCounterDemo } from './counter.js';
import { runVotingDemo } from './voting.js';
import { runRatingsDemo } from './ratings.js';

async function main() {
  // Initialize FHEVM Node.js instance
  const fhevm = new FhevmNode({
    rpcUrl: RPC_URL,
    privateKey: PRIVATE_KEY,
    chainId: CHAIN_ID
  });
  
  await fhevm.initialize();
  
  // Run demos
  await runCounterDemo(fhevm, config);
  await runVotingDemo(fhevm, config);
  await runRatingsDemo(fhevm, config);
}
```

### **Counter Demo (`src/counter.ts`)**

```typescript
import { FhevmNode } from '../../fhevm-sdk/dist/adapters/node.js';

export async function runCounterDemo(fhevm: FhevmNode, config: CounterDemoConfig) {
  // Create contract
  const contract = fhevm.createContract(contractAddress, CONTRACT_ABI);
  
  // Encrypt increment value (FHEVM 0.9.0)
  const encrypted = await fhevm.encrypt(contractAddress, walletAddress, 1);
  
  // Execute increment transaction (uses encryptedData and proof)
  await fhevm.executeEncryptedTransaction(contract, 'increment', encrypted);
  
  // Read encrypted count
  const countHandle = await contract.getCount();
  
  // Decrypt count (EIP-712)
  const decrypted = await fhevm.decrypt(countHandle, contractAddress);
  
  console.log(`Decrypted count: ${decrypted}`);
}
```

### **Voting Demo (`src/voting.ts`)** (FHEVM 0.9.0 - Self-Relaying Decryption)

```typescript
import { FhevmNode } from '../../fhevm-sdk/dist/adapters/node.js';

export async function runVotingDemo(fhevm: FhevmNode, config: VotingDemoConfig) {
  const contract = fhevm.createContract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI);
  
  // Create session if needed
  if (sessionCount === 0) {
    await contract.createSession(86400); // 24 hours
  }
  
  // Encrypt vote (YES = 1) - FHEVM 0.9.0 format
  const encryptedVote = await fhevm.encrypt(VOTING_CONTRACT_ADDRESS, walletAddress, 1);
  
  // Extract encrypted data and proof (new format)
  const encryptedData = encryptedVote.encryptedData;
  const proof = encryptedVote.proof;
  
  // Vote directly
  await contract.vote(sessionId, encryptedData, proof);
  
  // Request tally reveal with self-relaying decryption
  if (canRequestTally) {
    // Step 1: Request reveal (emits event)
    const tx = await contract.requestTallyReveal(sessionId);
    const receipt = await tx.wait();
    
    // Step 2: Extract handles from TallyRevealRequested event
    const event = receipt.logs.find(log => {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === 'TallyRevealRequested';
    });
    const { yesVotesHandle, noVotesHandle } = contract.interface.parseLog(event).args;
    
    // Step 3: Decrypt multiple handles
    const { cleartexts, decryptionProof, values } = await fhevm.decryptMultiple(
      VOTING_CONTRACT_ADDRESS,
      [yesVotesHandle, noVotesHandle]
    );
    
    // Step 4: Submit callback with proof
    await contract.resolveTallyCallback(sessionId, cleartexts, decryptionProof);
  }
}
```

### **Ratings Demo (`src/ratings.ts`)**

```typescript
import { FhevmNode } from '../../fhevm-sdk/dist/adapters/node.js';

export async function runRatingsDemo(fhevm: FhevmNode, config: RatingsDemoConfig) {
  const contract = fhevm.createContract(RATINGS_CONTRACT_ADDRESS, RATINGS_CONTRACT_ABI);
  
  // Encrypt rating (5 stars) - FHEVM 0.9.0 format
  const encryptedRating = await fhevm.encrypt(RATINGS_CONTRACT_ADDRESS, walletAddress, 5);
  
  // Submit rating (uses encryptedData and proof)
  await fhevm.executeEncryptedTransaction(contract, 'submitEncryptedRating', encryptedRating, cardId);
  
  // Get encrypted stats
  const stats = await contract.getEncryptedStats(cardId);
  
  // Public decrypt stats (no signature required)
  const sum = await fhevm.publicDecrypt(stats.sum);
  const count = await fhevm.publicDecrypt(stats.count);
  const average = sum / count;
  
  console.log(`Average rating: ${average}`);
}
```

## 🎯 **Available Methods**

### **`FhevmNode` Class** (FHEVM 0.9.0)

```typescript
class FhevmNode {
  // Initialization
  async initialize(): Promise<void>
  
  // Encryption (returns { encryptedData, proof })
  async encrypt(contractAddress: string, userAddress: string, value: number): Promise<{
    encryptedData: string;
    proof: string;
  }>
  
  // Decryption
  async decrypt(handle: string, contractAddress: string): Promise<number>
  async publicDecrypt(handle: string): Promise<number>
  async decryptMultiple(
    contractAddress: string,
    handles: string[]
  ): Promise<{ cleartexts: string; decryptionProof: string; values: number[] }>
  
  // Contract operations
  createContract(address: string, abi: any[]): ethers.Contract
  async executeEncryptedTransaction(
    contract: ethers.Contract,
    methodName: string,
    encryptedData: any,
    ...additionalParams: any[]
  ): Promise<any>
  
  // Utility
  async getAddress(): Promise<string | null>
  getConfig(): object
  getStatus(): 'ready' | 'idle'
}
```

## 🎯 **What It Demonstrates**

### **Counter Demo**
1. **Encrypt increment value** - Create encrypted input
2. **Execute increment transaction** - Send encrypted transaction
3. **Read encrypted count** - Get encrypted value from contract
4. **Decrypt count** - EIP-712 user decryption
5. **Decrement workflow** - Complete decrement with decryption

### **Voting Demo** (FHEVM 0.9.0 - Self-Relaying Decryption)
1. **Create voting session** - Initialize new session if needed
2. **Check session status** - Validate session is active
3. **Check vote status** - Verify user hasn't voted
4. **Encrypt vote** - Create encrypted YES vote (value 1)
5. **Submit vote** - Send encrypted vote to contract
6. **Request tally reveal** - Trigger event with encrypted handles
7. **Extract handles from event** - Get handles from `TallyRevealRequested` event
8. **Decrypt multiple handles** - Use `decryptMultiple` for self-relaying pattern
9. **Submit callback** - Call `resolveTallyCallback` with proof

### **Ratings Demo**
1. **Get rating cards** - Read available cards from contract
2. **Check card exists** - Validate card is available
3. **Check rating status** - Verify user hasn't rated
4. **Encrypt rating** - Create encrypted 5-star rating
5. **Submit rating** - Send encrypted rating to contract
6. **Get encrypted stats** - Read sum and count handles
7. **Public decrypt stats** - Decrypt without signature
8. **Calculate average** - Compute average rating

## 🌐 **Configuration (FHEVM 0.9.0)**

- **FHE Counter Contract:** `0x1b45fa7b7766fb27A36fBB0cfb02ea904214Cc75`
- **Ratings Contract:** `0x0382053b0eae2A4A45C4A668505E2030913f559e`
- **Voting Contract:** `0x4D15cA56c8414CF1bEF42B63B0525aFc3751D2d1`
- **Network:** Sepolia testnet (Chain ID: 11155111)
- **FHEVM Version:** 0.9.0
- **Relayer SDK:** 0.3.0-5
- **RPC:** Configurable via environment variables

## 📱 **Usage**

### **Interactive CLI Mode (Recommended)**

The easiest way to explore FHEVM demos is through the interactive CLI wizard:

```bash
# Start the interactive explorer
pnpm explorer
```

**Features:**
- 🌐 **Beautiful interactive menu** - Choose which demo to run
- 🔢 **Counter Demo** - Increment/decrement operations with prompts
- 🗳️ **Voting Demo** - Encrypted voting with interactive choices
- ⭐ **Ratings Demo** - Submit ratings with user input
- 🔍 **Test Mode** - Verify your setup before running demos
- 🎯 **Run All** - Execute all demos in sequence
- 📊 **Session Summary** - Track all demos you've completed

**Interactive Experience:**
- Guided step-by-step demos
- User prompts for values (increment amounts, ratings, votes)
- Real-time transaction feedback
- Loading spinners and progress indicators
- Session tracking and summary at the end

**Example Session:**
```
🌐 Welcome to FHEVM Explorer!
Universal FHEVM SDK - Interactive Demo Experience

Choose your FHEVM demo:
❯ 🔢 Counter Demo - Increment/Decrement Operations
  🗳️  Voting Demo - Encrypted Voting System
  ⭐ Ratings Demo - Review Cards with Encrypted Ratings
  🔍 Test Mode - Verify Setup Only
  🎯 Run All Demos
  ❌ Exit Explorer
```

### **HTTP Server Mode**

Run the showcase as an HTTP server with API endpoints:

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

## 📦 **Dependencies**

- `node` - Node.js runtime
- `ethers` - Ethereum interactions
- `@fhevm-sdk` - Universal FHEVM SDK with Node.js adapter
- `typescript` - Type safety
- `tsx` - TypeScript execution
- `dotenv` - Environment variables
- `express` - HTTP server (for server mode)
- `inquirer` - Interactive prompts (for explorer mode)
- `chalk` - Terminal colors (for explorer mode)
- `ora` - Loading spinners (for explorer mode)

## 🎉 **Success Metrics**

- ✅ **Real blockchain interactions** - Live Sepolia testnet
- ✅ **Node.js adapter working** - Server-side operations
- ✅ **Multiple demos** - Counter, Voting, Ratings
- ✅ **EIP-712 authentication** - Proper user decryption
- ✅ **Public decryption** - No signature required
- ✅ **CLI interface** - Server-side FHEVM usage
- ✅ **Complete workflows** - End-to-end operations

**Perfect for server-side FHEVM operations!** 🚀
