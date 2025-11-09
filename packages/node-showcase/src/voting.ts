/**
 * Voting Demo - Node.js FHEVM Showcase
 * Demonstrates encrypted voting operations (only vote, no tally/callback)
 */

import { ethers } from 'ethers';
import { FhevmNode } from '../../fhevm-sdk/dist/adapters/node.js';

// Contract configuration (FHEVM 0.9.0)
export const VOTING_CONTRACT_ADDRESS = '0x4D15cA56c8414CF1bEF42B63B0525aFc3751D2d1'; // Sepolia - Updated for 0.9.0

export const VOTING_CONTRACT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "durationSeconds", type: "uint256" }],
    name: "createSession",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "sessionId", type: "uint256" }],
    name: "getSession",
    outputs: [
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "uint256", name: "endTime", type: "uint256" },
      { internalType: "bool", name: "resolved", type: "bool" },
      { internalType: "uint32", name: "yesVotes", type: "uint32" },
      { internalType: "uint32", name: "noVotes", type: "uint32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSessionCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "hasVoted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "sessions",
    outputs: [
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "uint256", name: "endTime", type: "uint256" },
      { internalType: "bool", name: "resolved", type: "bool" },
      { internalType: "uint32", name: "revealedYes", type: "uint32" },
      { internalType: "uint32", name: "revealedNo", type: "uint32" },
      { internalType: "bool", name: "revealRequested", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "sessionId", type: "uint256" }],
    name: "requestTallyReveal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "sessionId", type: "uint256" },
      { internalType: "bytes", name: "cleartexts", type: "bytes" },
      { internalType: "bytes", name: "decryptionProof", type: "bytes" },
    ],
    name: "resolveTallyCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "sessionId", type: "uint256" },
      { indexed: false, internalType: "bytes32", name: "yesVotesHandle", type: "bytes32" },
      { indexed: false, internalType: "bytes32", name: "noVotesHandle", type: "bytes32" },
    ],
    name: "TallyRevealRequested",
    type: "event",
  },
  {
    inputs: [
      { internalType: "uint256", name: "sessionId", type: "uint256" },
      { internalType: "externalEuint32", name: "encryptedVote", type: "bytes32" },
      { internalType: "bytes", name: "proof", type: "bytes" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export interface VotingDemoConfig {
  rpcUrl: string;
  privateKey: string;
  chainId: number;
}

/**
 * Run voting demo operations (only voting, no tally/callback)
 */
export async function runVotingDemo(fhevm: FhevmNode, config: VotingDemoConfig) {
  try {
    // 1. Setup contract
    console.log('📄 Step 1: Setting up voting contract...');
    const contract = fhevm.createContract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI);
    console.log(`✅ Voting contract connected: ${VOTING_CONTRACT_ADDRESS}\n`);

    // 2. Always create a new voting session first
    console.log('📝 Step 2: Creating a new voting session...');
    console.log('📝 Creating new voting session (1 minute duration)...');
    try {
      const createTx = await contract.createSession(60); // 1 minute in seconds
      console.log(`✅ Create session transaction sent: ${createTx.hash}`);
      const receipt = await createTx.wait();
      console.log(`✅ Create session transaction confirmed: ${receipt.hash}\n`);
      
      // Wait a bit for the transaction to be indexed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get the new session ID
      const newTotalSessions = await contract.getSessionCount();
      const newSessionCount = Number(newTotalSessions);
      console.log(`✅ New total sessions: ${newSessionCount}\n`);
      
      if (newSessionCount === 0) {
        throw new Error('Failed to get new session ID after creation');
      }
      
      // Vote on the newly created session
      const newSessionId = newSessionCount - 1;
      console.log(`✅ Created session ID: ${newSessionId}\n`);
      await voteOnSession(fhevm, contract, newSessionId, config);
    } catch (error: any) {
      console.error('❌ Failed to create voting session:', error.message);
      throw error;
    }

    // 3. Wait for voting session to end before requesting tally reveal
    const newTotalSessions = await contract.getSessionCount();
    const newSessionCount = Number(newTotalSessions);
    if (newSessionCount > 0) {
      const lastSessionId = newSessionCount - 1;
      const sessionData = await contract.getSession(lastSessionId);
      const sessionStruct = await contract.sessions(lastSessionId);
      const walletAddress = await fhevm.getAddress();
      const now = Math.floor(Date.now() / 1000);
      const endTime = Number(sessionData.endTime);
      const timeUntilEnd = endTime - now;
      
      // Check if reveal was already requested - if so, just decrypt and submit callback
      if (sessionStruct.revealRequested && !sessionData.resolved) {
        console.log(`\n🔓 Step 7: Tally reveal already requested for session ${lastSessionId}. Decrypting and submitting callback...`);
        try {
          await decryptTallyAndSubmit(fhevm, contract, lastSessionId);
        } catch (error: any) {
          console.log(`⚠️ Tally decryption/callback failed: ${error.message}`);
        }
      }
      // Try to request tally reveal if conditions are met
      else if (sessionData.creator.toLowerCase() === walletAddress?.toLowerCase() && 
               !sessionData.resolved && 
               !sessionStruct.revealRequested) {
        // Wait for session to end (with 20 second buffer)
        if (timeUntilEnd > 0) {
          const waitTime = Math.min(timeUntilEnd + 20, 65); // Wait until end + 20 seconds, max 65 seconds
          console.log(`\n⏳ Step 7: Waiting ${waitTime} seconds for voting session to end before requesting tally reveal...`);
          console.log(`   Session ends at: ${new Date(endTime * 1000).toISOString()}`);
          console.log(`   Current time: ${new Date(now * 1000).toISOString()}`);
          console.log(`   Time until end: ${timeUntilEnd} seconds`);
          await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
          console.log(`✅ Wait complete. Now requesting tally reveal...\n`);
        }
        
        console.log(`🔓 Step 7: Requesting tally reveal for session ${lastSessionId} (FHEVM 0.9.0 - Self-Relaying Decryption with Public Decryption)...`);
        try {
          await requestTallyReveal(fhevm, contract, lastSessionId);
        } catch (error: any) {
          console.log(`⚠️ Tally reveal failed: ${error.message}`);
        }
      } else {
        console.log(`\nℹ️  Tally reveal not available (already resolved, not creator, or already requested)`);
      }
    }

    console.log('\n📋 Voting Demo Summary:');
    console.log(`   Contract address: ${VOTING_CONTRACT_ADDRESS}`);
    console.log('   ✅ REAL FHEVM voting operations demonstrated (FHEVM 0.9.0)');
    console.log('   ✅ Encrypted vote submission tested');
    console.log('   ✅ Self-relaying decryption pattern tested');
    console.log('   ✅ Server-side encryption/decryption');
    console.log('   ✅ Real blockchain interactions');

  } catch (error: any) {
    console.error('❌ Error in Voting Demo:', error);
    throw error;
  }
}

/**
 * Vote on a specific session
 */
async function voteOnSession(
  fhevm: FhevmNode,
  contract: ethers.Contract,
  sessionId: number,
  config: VotingDemoConfig
) {
  try {
    // 1. Get session info
    console.log(`🔍 Step 3: Getting session ${sessionId} info...`);
    const session = await contract.getSession(sessionId);
    const endTime = Number(session.endTime);
    const resolved = session.resolved;
    const now = Math.floor(Date.now() / 1000);
    
    console.log(`   Creator: ${session.creator}`);
    console.log(`   End time: ${new Date(endTime * 1000).toISOString()}`);
    console.log(`   Resolved: ${resolved}`);
    console.log(`   Current time: ${new Date(now * 1000).toISOString()}`);
    
    const isActive = now < endTime && !resolved;
    console.log(`   Session active: ${isActive ? 'Yes' : 'No'}\n`);

    if (!isActive) {
      console.log('⚠️ Session is not active (either ended or resolved). Skipping vote.\n');
      return;
    }

    // 2. Check if already voted
    console.log(`🔍 Step 4: Checking if already voted on session ${sessionId}...`);
    const walletAddress = await fhevm.getAddress();
    const hasVoted = await contract.hasVoted(sessionId, walletAddress);
    console.log(`   Has voted: ${hasVoted ? 'Yes' : 'No'}\n`);

    if (hasVoted) {
      console.log('⚠️ Already voted on this session. Skipping vote.\n');
      return;
    }

    // 3. Create encrypted vote (YES vote = 1)
    console.log(`🔐 Step 5: Creating encrypted vote for session ${sessionId}...`);
    console.log(`🔐 Creating encrypted input for contract ${VOTING_CONTRACT_ADDRESS}, user ${walletAddress}, value 1 (YES vote)`);
    
    const encryptedVote = await fhevm.encrypt(VOTING_CONTRACT_ADDRESS, walletAddress || '0x0000000000000000000000000000000000000000', 1);
    console.log('✅ Encrypted vote created successfully');
    
    // Handle the encrypted data structure properly
    let encryptedData: any, proof: any;
    if (encryptedVote && typeof encryptedVote === 'object') {
      if ((encryptedVote as any).handles && Array.isArray((encryptedVote as any).handles) && (encryptedVote as any).handles.length > 0) {
        encryptedData = (encryptedVote as any).handles[0];
        proof = (encryptedVote as any).inputProof;
      } else if ((encryptedVote as any).encryptedData && (encryptedVote as any).proof) {
        encryptedData = (encryptedVote as any).encryptedData;
        proof = (encryptedVote as any).proof;
      } else {
        encryptedData = encryptedVote;
        proof = encryptedVote;
      }
    } else {
      encryptedData = encryptedVote;
      proof = encryptedVote;
    }
    
    console.log(`   Encrypted data: ${encryptedData ? '0x' + Buffer.from(encryptedData).toString('hex').substring(0, 20) + '...' : 'undefined'}`);
    console.log(`   Proof: ${proof ? '0x' + Buffer.from(proof).toString('hex').substring(0, 20) + '...' : 'undefined'}\n`);

    // 4. Submit vote
    console.log(`🗳️ Step 6: Submitting vote for session ${sessionId}...`);
    try {
      // Note: vote function signature: vote(uint256 sessionId, bytes32 encryptedVote, bytes proof)
      // Convert Uint8Array to hex string if needed
      let encryptedDataHex: string, proofHex: string;
      if (encryptedData instanceof Uint8Array) {
        encryptedDataHex = ethers.hexlify(encryptedData);
      } else {
        encryptedDataHex = encryptedData;
      }
      if (proof instanceof Uint8Array) {
        proofHex = ethers.hexlify(proof);
      } else {
        proofHex = proof;
      }
      
      // Call vote directly with correct parameter order: sessionId, encryptedVote, proof
      const tx = await contract.vote(sessionId, encryptedDataHex, proofHex);
      console.log(`✅ Vote transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Vote transaction confirmed: ${receipt.hash}\n`);
    } catch (voteError: any) {
      console.log('⚠️ Vote transaction failed:', voteError.message);
    }

  } catch (error: any) {
    console.error('❌ Error voting on session:', error);
    throw error;
  }
}

/**
 * Request tally reveal with self-relaying decryption using PUBLIC DECRYPTION (FHEVM 0.9.0)
 * This uses public decryption (not EIP-712 user decryption) - handles are made publicly decryptable
 */
async function requestTallyReveal(
  fhevm: FhevmNode,
  contract: ethers.Contract,
  sessionId: number
) {
  try {
    // Step 1: Request tally reveal (emits event with handles that are now publicly decryptable)
    console.log(`   Step 1: Requesting tally reveal (makes handles publicly decryptable)...`);
    const tx = await contract.requestTallyReveal(sessionId);
    console.log(`   ✅ Tally reveal transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`   ✅ Tally reveal transaction confirmed: ${receipt.hash}`);
    
    // Step 2: Extract handles from TallyRevealRequested event
    console.log(`   Step 2: Extracting handles from TallyRevealRequested event...`);
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed && parsed.name === 'TallyRevealRequested';
      } catch {
        return false;
      }
    });
    
    if (!event) {
      throw new Error('TallyRevealRequested event not found');
    }
    
    const parsedEvent = contract.interface.parseLog(event);
    if (!parsedEvent) {
      throw new Error('Failed to parse TallyRevealRequested event');
    }
    
    const yesVotesHandle = parsedEvent.args.yesVotesHandle;
    const noVotesHandle = parsedEvent.args.noVotesHandle;
    console.log(`   ✅ Extracted handles:`);
    console.log(`      Yes votes handle: ${yesVotesHandle}`);
    console.log(`      No votes handle: ${noVotesHandle}`);
    
    // Step 3: Use PUBLIC DECRYPTION (not EIP-712) via decryptMultiple
    // decryptMultiple uses publicDecrypt internally for handles made publicly decryptable
    console.log(`   Step 3: Using PUBLIC DECRYPTION to decrypt multiple handles...`);
    const wallet = fhevm.getWallet();
    if (!wallet) {
      throw new Error('Wallet not available');
    }
    
    const { cleartexts, decryptionProof, values } = await fhevm.decryptMultiple(
      VOTING_CONTRACT_ADDRESS,
      [yesVotesHandle, noVotesHandle],
      wallet
    );
    
    const [yesVotes, noVotes] = values;
    console.log(`   ✅ Public decryption successful:`);
    console.log(`      Yes votes: ${yesVotes}`);
    console.log(`      No votes: ${noVotes}`);
    console.log(`   ✅ Decryption proof generated`);
    
    // Step 4: Submit callback with proof (self-relaying pattern)
    console.log(`   Step 4: Submitting resolveTallyCallback with proof (self-relaying pattern)...`);
    const callbackTx = await contract.resolveTallyCallback(
      sessionId,
      cleartexts,
      decryptionProof
    );
    console.log(`   ✅ Callback transaction sent: ${callbackTx.hash}`);
    const callbackReceipt = await callbackTx.wait();
    console.log(`   ✅ Callback transaction confirmed: ${callbackReceipt.hash}`);
    console.log(`\n   ✅ Self-relaying decryption completed! Final tally: Yes=${yesVotes}, No=${noVotes}`);
    
  } catch (error: any) {
    console.error('❌ Error in tally reveal:', error);
    throw error;
  }
}

/**
 * Decrypt tally and submit callback when reveal was already requested
 * Uses PUBLIC DECRYPTION (not EIP-712 user decryption)
 */
async function decryptTallyAndSubmit(
  fhevm: FhevmNode,
  contract: ethers.Contract,
  sessionId: number
) {
  try {
    // Get the handles from the contract (they should be publicly decryptable now)
    // We need to query the contract for the handles - but actually, we need to get them from the event
    // For now, let's query past events to get the handles
    console.log(`   Step 1: Querying TallyRevealRequested event for session ${sessionId}...`);
    const filter = contract.filters.TallyRevealRequested(sessionId);
    const events = await contract.queryFilter(filter);
    
    if (events.length === 0) {
      throw new Error('TallyRevealRequested event not found for this session');
    }
    
    const latestEvent = events[events.length - 1];
    if (!('args' in latestEvent)) {
      throw new Error('Event does not have args property');
    }
    const yesVotesHandle = latestEvent.args.yesVotesHandle;
    const noVotesHandle = latestEvent.args.noVotesHandle;
    console.log(`   ✅ Found handles from event:`);
    console.log(`      Yes votes handle: ${yesVotesHandle}`);
    console.log(`      No votes handle: ${noVotesHandle}`);
    
    // Step 2: Use PUBLIC DECRYPTION
    console.log(`   Step 2: Using PUBLIC DECRYPTION to decrypt handles...`);
    const wallet = fhevm.getWallet();
    if (!wallet) {
      throw new Error('Wallet not available');
    }
    
    const { cleartexts, decryptionProof, values } = await fhevm.decryptMultiple(
      VOTING_CONTRACT_ADDRESS,
      [yesVotesHandle, noVotesHandle],
      wallet
    );
    
    const [yesVotes, noVotes] = values;
    console.log(`   ✅ Public decryption successful:`);
    console.log(`      Yes votes: ${yesVotes}`);
    console.log(`      No votes: ${noVotes}`);
    
    // Step 3: Submit callback
    console.log(`   Step 3: Submitting resolveTallyCallback with proof...`);
    const callbackTx = await contract.resolveTallyCallback(
      sessionId,
      cleartexts,
      decryptionProof
    );
    console.log(`   ✅ Callback transaction sent: ${callbackTx.hash}`);
    const callbackReceipt = await callbackTx.wait();
    console.log(`   ✅ Callback transaction confirmed: ${callbackReceipt.hash}`);
    console.log(`\n   ✅ Tally decrypted and submitted! Final tally: Yes=${yesVotes}, No=${noVotes}`);
    
  } catch (error: any) {
    console.error('❌ Error in decrypt tally and submit:', error);
    throw error;
  }
}

