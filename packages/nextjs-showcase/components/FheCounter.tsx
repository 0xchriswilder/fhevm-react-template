'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { useDecrypt, useEncrypt, useContract } from '@fhevm-sdk';

// Contract configuration
const CONTRACT_ADDRESSES = {
  31337: '0x40e8Aa088739445BC3a3727A724F56508899f65B', // Local Hardhat
  11155111: '0x1b45fa7b7766fb27A36fBB0cfb02ea904214Cc75', // Sepolia - Updated for 0.9.0
}

const CONTRACT_ABI = [
  {
    inputs: [],
    name: "getCount",
    outputs: [{ internalType: "euint32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "externalEuint32", name: "inputEuint32", type: "bytes32" },
      { internalType: "bytes", name: "inputProof", type: "bytes" },
    ],
    name: "increment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "externalEuint32", name: "inputEuint32", type: "bytes32" },
      { internalType: "bytes", name: "inputProof", type: "bytes" },
    ],
    name: "decrement",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]

interface FheCounterProps {
  account: string;
  chainId: number;
  isConnected: boolean;
  isInitialized: boolean;
  onMessage: (message: string) => void;
}

export default function FheCounter({ account, chainId, isConnected, isInitialized, onMessage }: FheCounterProps) {
  const [countHandle, setCountHandle] = useState<string>('');
  const [decryptedCount, setDecryptedCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || 'Not supported chain';

  // Use adapter hooks - they provide state management and error handling
  const { decrypt, isDecrypting, error: decryptError } = useDecrypt();
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt();
  const { contract: readContract } = useContract(
    contractAddress !== 'Not supported chain' ? contractAddress : '',
    CONTRACT_ABI
  );

  // Get encrypted count from contract
  const getCount = async () => {
    if (!isConnected || !contractAddress || !window.ethereum || !readContract) return;
    
    try {
      onMessage('Reading contract...');
      const result = await readContract.getCount();
      setCountHandle(result);
      onMessage('Contract read successfully!');
      setTimeout(() => onMessage(''), 3000);
    } catch (error) {
      console.error('Get count failed:', error);
      onMessage('Failed to get count');
    }
  };

  // Decrypt count using the adapter hook
  const handleDecrypt = async () => {
    if (!countHandle || !window.ethereum || !contractAddress) return;
    
    try {
      onMessage('Decrypting with EIP-712 user decryption...');
      
      // Get signer for EIP-712 signature
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Use the decrypt hook - it handles loading state and errors automatically
      const result = await decrypt(countHandle, contractAddress, signer);
      setDecryptedCount(result);
      onMessage('EIP-712 decryption completed!');
      setTimeout(() => onMessage(''), 3000);
    } catch (error) {
      console.error('Decryption failed:', error);
      onMessage(decryptError || 'Decryption failed');
    }
  };

  // Increment counter using the adapter hooks
  const incrementCounter = async () => {
    if (!isConnected || !contractAddress || !window.ethereum) return;
    
    try {
      setIsProcessing(true);
      onMessage('Starting increment transaction...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      
      onMessage('Encrypting input...');
      // Use the encrypt hook - it handles loading state and errors automatically
      const encryptedInput = await encrypt(contractAddress, account, 1);
      
      onMessage('Sending transaction...');
      const tx = await contract.increment(encryptedInput.encryptedData, encryptedInput.proof);
      
      onMessage('Waiting for confirmation...');
      const receipt = await tx.wait();
      
      onMessage('Increment completed!');
      console.log('✅ Increment transaction completed:', receipt);
      
      setTimeout(() => onMessage(''), 3000);
    } catch (error) {
      console.error('Increment failed:', error);
      onMessage(encryptError || 'Increment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Decrement counter using the adapter hooks
  const decrementCounter = async () => {
    if (!isConnected || !contractAddress || !window.ethereum) return;
    
    try {
      setIsProcessing(true);
      onMessage('Starting decrement transaction...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      
      onMessage('Encrypting input...');
      // Use the encrypt hook - it handles loading state and errors automatically
      const encryptedInput = await encrypt(contractAddress, account, 1);
      
      onMessage('Sending transaction...');
      const tx = await contract.decrement(encryptedInput.encryptedData, encryptedInput.proof);
      
      onMessage('Waiting for confirmation...');
      const receipt = await tx.wait();
      
      onMessage('Decrement completed!');
      console.log('✅ Decrement transaction completed:', receipt);
      
      setTimeout(() => onMessage(''), 3000);
    } catch (error) {
      console.error('Decrement failed:', error);
      onMessage(encryptError || 'Decrement failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConnected || !isInitialized) {
    return null;
  }

  return (
    <div className="glass-card p-8 hover:border-[#FFEB3B] transition-all duration-300">
      <div className="flex items-center gap-3 mb-8">
        <svg className="w-6 h-6 text-[#FFEB3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <div>
          <h2 className="text-2xl font-bold text-white">FHEVM Counter Demo</h2>
          <p className="text-gray-400 text-sm">Using REAL FHEVM SDK on Sepolia testnet</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <button onClick={getCount} className="btn-primary w-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Get Count
          </button>
          {countHandle && (
            <div className="mt-4 info-card border-[#FFEB3B]/30">
              <span className="text-gray-400 text-xs font-medium block mb-2">Encrypted Handle</span>
              <span className="code-text text-[#FFEB3B] text-xs">{countHandle}</span>
            </div>
          )}
        </div>

        <div className="h-px bg-[#2A2A2A]"></div>

        <div>
          <button
            onClick={handleDecrypt}
            disabled={!countHandle || isDecrypting}
            className="btn-secondary w-full"
            title={decryptError || undefined}
          >
            {isDecrypting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            )}
            {isDecrypting ? 'Decrypting...' : 'Decrypt Count'}
          </button>
          {decryptedCount !== null && (
            <div className="mt-4 info-card border-green-500/30 bg-green-500/5">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm font-medium">Decrypted Count</span>
                <span className="text-[#FFEB3B] text-3xl font-bold">{decryptedCount}</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-[#2A2A2A]"></div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={incrementCounter}
            disabled={isProcessing || isEncrypting}
            className="btn-primary"
            title={encryptError || undefined}
          >
            {isProcessing ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            )}
            {(isProcessing || isEncrypting) ? 'Processing...' : 'Increment'}
          </button>
          <button
            onClick={decrementCounter}
            disabled={isProcessing || isEncrypting}
            className="btn-danger"
            title={encryptError || undefined}
          >
            {isProcessing ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"/>
              </svg>
            )}
            {(isProcessing || isEncrypting) ? 'Processing...' : 'Decrement'}
          </button>
        </div>
      </div>
    </div>
  );
}
