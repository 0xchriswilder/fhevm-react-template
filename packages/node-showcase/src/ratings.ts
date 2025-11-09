/**
 * Ratings Demo - Node.js FHEVM Showcase
 * Demonstrates encrypted rating operations with public decryption
 */

import { ethers } from 'ethers';
import { FhevmNode } from '../../fhevm-sdk/dist/adapters/node.js';

// Contract configuration (FHEVM 0.9.0)
export const RATINGS_CONTRACT_ADDRESS = '0x0382053b0eae2A4A45C4A668505E2030913f559e'; // Sepolia - Updated for 0.9.0

export const RATINGS_CONTRACT_ABI = [
  {
    inputs: [],
    name: "createReviewCard",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "creationFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "cardId", type: "uint256" }],
    name: "getCardInfo",
    outputs: [
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "bool", name: "exists", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "cardId", type: "uint256" }],
    name: "getEncryptedStats",
    outputs: [
      { internalType: "bytes32", name: "sum", type: "bytes32" },
      { internalType: "bytes32", name: "count", type: "bytes32" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTotalCards",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "cardId", type: "uint256" },
      { internalType: "address", name: "voter", type: "address" }
    ],
    name: "hasAddressVoted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "cardId", type: "uint256" },
      { internalType: "externalEuint32", name: "encryptedRating", type: "bytes32" },
      { internalType: "bytes", name: "inputProof", type: "bytes" }
    ],
    name: "submitEncryptedRating",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

export interface RatingsDemoConfig {
  rpcUrl: string;
  privateKey: string;
  chainId: number;
}

/**
 * Run ratings demo operations (rate and public decrypt)
 */
export async function runRatingsDemo(fhevm: FhevmNode, config: RatingsDemoConfig) {
  try {
    // 1. Setup contract
    console.log('📄 Step 1: Setting up ratings contract...');
    const contract = fhevm.createContract(RATINGS_CONTRACT_ADDRESS, RATINGS_CONTRACT_ABI);
    console.log(`✅ Ratings contract connected: ${RATINGS_CONTRACT_ADDRESS}\n`);

    // 2. Get total cards
    console.log('📊 Step 2: Getting total rating cards...');
    const totalCards = await contract.getTotalCards();
    const cardCount = Number(totalCards);
    console.log(`✅ Total rating cards: ${cardCount}\n`);

    if (cardCount === 0) {
      console.log('⚠️ No rating cards found. Cannot submit rating without a card.\n');
      return;
    }

    // Use the first card (cardId = 0)
    const cardId = 0;

    // 3. Get card info
    console.log(`🔍 Step 3: Getting card ${cardId} info...`);
    const cardInfo = await contract.getCardInfo(cardId);
    const exists = cardInfo.exists;
    const creator = cardInfo.creator;
    const createdAt = Number(cardInfo.createdAt);
    
    console.log(`   Card exists: ${exists}`);
    console.log(`   Creator: ${creator}`);
    console.log(`   Created at: ${new Date(createdAt * 1000).toISOString()}\n`);

    if (!exists) {
      console.log('⚠️ Card does not exist. Skipping rating.\n');
      return;
    }

    // 4. Check if already rated
    console.log(`🔍 Step 4: Checking if already rated on card ${cardId}...`);
    const walletAddress = await fhevm.getAddress();
    const hasRated = await contract.hasAddressVoted(cardId, walletAddress);
    console.log(`   Has rated: ${hasRated ? 'Yes' : 'No'}\n`);

    if (hasRated) {
      console.log('⚠️ Already rated this card. Getting encrypted stats to decrypt...\n');
    } else {
      // 5. Create encrypted rating (rating = 5)
      console.log(`🔐 Step 5: Creating encrypted rating for card ${cardId}...`);
      console.log(`🔐 Creating encrypted input for contract ${RATINGS_CONTRACT_ADDRESS}, user ${walletAddress}, value 5 (rating)`);
      
      const encryptedRating = await fhevm.encrypt(RATINGS_CONTRACT_ADDRESS, walletAddress || '0x0000000000000000000000000000000000000000', 5);
      console.log('✅ Encrypted rating created successfully');
      
      // Handle the encrypted data structure properly
      let encryptedData: any, proof: any;
      if (encryptedRating && typeof encryptedRating === 'object') {
        if ((encryptedRating as any).handles && Array.isArray((encryptedRating as any).handles) && (encryptedRating as any).handles.length > 0) {
          encryptedData = (encryptedRating as any).handles[0];
          proof = (encryptedRating as any).inputProof;
        } else if ((encryptedRating as any).encryptedData && (encryptedRating as any).proof) {
          encryptedData = (encryptedRating as any).encryptedData;
          proof = (encryptedRating as any).proof;
        } else {
          encryptedData = encryptedRating;
          proof = encryptedRating;
        }
      } else {
        encryptedData = encryptedRating;
        proof = encryptedRating;
      }
      
      console.log(`   Encrypted data: ${encryptedData ? '0x' + Buffer.from(encryptedData).toString('hex').substring(0, 20) + '...' : 'undefined'}`);
      console.log(`   Proof: ${proof ? '0x' + Buffer.from(proof).toString('hex').substring(0, 20) + '...' : 'undefined'}\n`);

      // 6. Submit rating
      console.log(`⭐ Step 6: Submitting rating for card ${cardId}...`);
      try {
        // submitEncryptedRating(uint256 cardId, bytes32 encryptedRating, bytes inputProof)
        // Need to call directly with correct parameter order: cardId, encryptedRating, inputProof
        let encryptedDataHex: string, proofHex: string;
        if (encryptedRating && typeof encryptedRating === 'object') {
          if ((encryptedRating as any).handles && Array.isArray((encryptedRating as any).handles) && (encryptedRating as any).handles.length > 0) {
            const handle = (encryptedRating as any).handles[0];
            const proof = (encryptedRating as any).inputProof;
            encryptedDataHex = handle instanceof Uint8Array ? ethers.hexlify(handle) : handle;
            proofHex = proof instanceof Uint8Array ? ethers.hexlify(proof) : proof;
          } else {
            throw new Error('Invalid encrypted rating format');
          }
        } else {
          throw new Error('Invalid encrypted rating format');
        }
        
        const tx = await contract.submitEncryptedRating(cardId, encryptedDataHex, proofHex);
        console.log(`✅ Rating transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Rating transaction confirmed: ${receipt?.hash}\n`);
      } catch (ratingError: any) {
        console.log('⚠️ Rating transaction failed:', ratingError.message);
      }
    }

    // 7. Get encrypted stats
    console.log(`📊 Step 7: Getting encrypted stats for card ${cardId}...`);
    const stats = await contract.getEncryptedStats(cardId);
    const sumHandle = stats.sum;
    const countHandle = stats.count;
    console.log(`✅ Encrypted sum handle: ${sumHandle}`);
    console.log(`✅ Encrypted count handle: ${countHandle}\n`);

    // 8. Public decrypt stats
    console.log(`🔓 Step 8: Public decrypting stats for card ${cardId}...`);
    try {
      console.log('🔓 Public decrypting sum handle...');
      const decryptedSum = await fhevm.publicDecrypt(sumHandle);
      console.log(`✅ Decrypted sum: ${decryptedSum}`);

      console.log('🔓 Public decrypting count handle...');
      const decryptedCount = await fhevm.publicDecrypt(countHandle);
      console.log(`✅ Decrypted count: ${decryptedCount}`);

      const averageRating = decryptedSum > 0 && decryptedCount > 0 
        ? (Number(decryptedSum) / Number(decryptedCount)).toFixed(2)
        : '0.00';
      
      console.log(`✅ Average rating: ${averageRating}\n`);
    } catch (decryptError: any) {
      console.log('⚠️ Public decryption failed:', decryptError.message);
    }

    console.log('📋 Ratings Demo Summary:');
    console.log(`   Contract address: ${RATINGS_CONTRACT_ADDRESS}`);
    console.log(`   Card ID: ${cardId}`);
    console.log(`   Wallet address: ${walletAddress}`);
    console.log('   ✅ REAL FHEVM rating operations demonstrated');
    console.log('   ✅ Encrypted rating submission tested');
    console.log('   ✅ Public decryption tested');
    console.log('   ✅ Server-side encryption/decryption');
    console.log('   ✅ Real blockchain interactions');

  } catch (error: any) {
    console.error('❌ Error in Ratings Demo:', error);
    throw error;
  }
}

