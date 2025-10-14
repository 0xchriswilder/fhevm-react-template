import React, { useState } from 'react';
import { ethers } from 'ethers';
import { initializeFheInstance, decryptValue, createEncryptedInput, publicDecrypt } from '@fhevm-sdk';
import './App.css';

// Contract configuration
const CONTRACT_ADDRESSES = {
  31337: '0x40e8Aa088739445BC3a3727A724F56508899f65B', // Local Hardhat
  11155111: '0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e', // Sepolia
}

// Sepolia network configuration
const SEPOLIA_CONFIG = {
  chainId: '0xaa36a7', // 11155111 in hex
  chainName: 'Sepolia',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
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

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
      isConnected?: () => boolean;
    };
  }
}

function App() {
  const [account, setAccount] = useState<string>('');
  const [chainId, setChainId] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [countHandle, setCountHandle] = useState<string>('');
  const [decryptedCount, setDecryptedCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [fhevmStatus, setFhevmStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  // Network switching state
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [networkError, setNetworkError] = useState<string>('');

  // Public decryption state
  const [publicDecryptedCount, setPublicDecryptedCount] = useState<number | null>(null);
  const [publicDecryptedSum, setPublicDecryptedSum] = useState<number | null>(null);
  const [isPublicDecrypting, setIsPublicDecrypting] = useState(false);

  // Hardcoded ciphertexts for public decryption testing
  const HARDCODED_CIPHERTEXTS = {
    encryptedCount: "0x42bbe4377f93c8e01c6ea6a9bfe98cab65b67b97e1ff0000000000aa36a70500",
    encryptedSum: "0x1495e50acd5cef684c3a9cae49e18a13d631768f70ff0000000000aa36a70500"
  };

  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || 'Not supported chain';

  // Initialize FHEVM
  const initializeFhevm = async () => {
    setFhevmStatus('loading');
    
    try {
      await initializeFheInstance();
      setFhevmStatus('ready');
      console.log('✅ FHEVM initialized for React!');
    } catch (error) {
      setFhevmStatus('error');
      console.error('FHEVM initialization failed:', error);
    }
  };

  // Switch network to Sepolia
  const switchNetworkToSepolia = async () => {
    if (!window.ethereum) {
      setNetworkError('No Ethereum provider found');
      return;
    }

    try {
      setIsSwitchingNetwork(true);
      setNetworkError('');
      setMessage('Switching to Sepolia network...');

      // Try to switch to Sepolia network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CONFIG.chainId }],
      });

      // Update chain ID after successful switch
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(chainIdHex, 16));
      setMessage('Successfully switched to Sepolia!');
      
      console.log('✅ Network switched to Sepolia');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Network switch failed:', error);
      
      // If the chain doesn't exist, try to add it
      if (error.code === 4902) {
        try {
          setMessage('Adding Sepolia network...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_CONFIG],
          });
          
          // Update chain ID after adding
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(parseInt(chainIdHex, 16));
          setMessage('Sepolia network added and switched!');
          
          console.log('✅ Sepolia network added and switched');
          setTimeout(() => setMessage(''), 3000);
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          setNetworkError('Failed to add Sepolia network. Please add it manually in your wallet.');
          setMessage('Failed to add Sepolia network');
        }
      } else {
        setNetworkError(`Failed to switch network: ${error.message || 'Unknown error'}`);
        setMessage('Failed to switch network');
      }
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  // Wallet connection
  const connectWallet = async () => {
    console.log('🔗 Attempting to connect wallet...');
    
    if (typeof window === 'undefined') {
      console.error('❌ Window is undefined - not in browser environment');
      return;
    }
    
    if (!window.ethereum) {
      console.error('❌ No Ethereum provider found. Please install MetaMask or connect a wallet.');
      alert('Please install MetaMask or connect a wallet to use this app.');
      return;
    }
    
    try {
      console.log('📱 Requesting accounts...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('✅ Accounts received:', accounts);
      
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('🔗 Chain ID:', chainIdHex);
      
      setAccount(accounts[0]);
      setChainId(parseInt(chainIdHex, 16));
      setIsConnected(true);
      
      console.log('✅ Wallet connected successfully!');
      
      // Initialize FHEVM after wallet connection
      await initializeFhevm();
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      alert(`Wallet connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Get encrypted count from contract
  const getCount = async () => {
    if (!isConnected || !contractAddress || !window.ethereum) return;
    
    try {
      setMessage('Reading contract...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      const result = await contract.getCount();
      setCountHandle(result);
      setMessage('Contract read successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Get count failed:', error);
      setMessage('Failed to get count');
    }
  };

  // Decrypt count
  const handleDecrypt = async () => {
    if (!countHandle || !window.ethereum) return;
    
    try {
      setIsDecrypting(true);
      setMessage('Decrypting with EIP-712 user decryption...');
      
      // Get signer for EIP-712 signature
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const result = await decryptValue(countHandle, contractAddress, signer);
      setDecryptedCount(result);
      setMessage('EIP-712 decryption completed!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Decryption failed:', error);
      setMessage('Decryption failed');
    } finally {
      setIsDecrypting(false);
    }
  };

  // Increment counter
  const incrementCounter = async () => {
    if (!isConnected || !contractAddress || !window.ethereum) return;
    
    try {
      setIsProcessing(true);
      setMessage('Starting increment transaction...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      
      setMessage('Encrypting input...');
      const encryptedInput = await createEncryptedInput(contractAddress, account, 1);
      
      setMessage('Sending transaction...');
      const tx = await contract.increment(encryptedInput.encryptedData, encryptedInput.proof);
      
      setMessage('Waiting for confirmation...');
      const receipt = await tx.wait();
      
      setMessage('Increment completed!');
      console.log('✅ Increment transaction completed:', receipt);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Increment failed:', error);
      setMessage('Increment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Decrement counter
  const decrementCounter = async () => {
    if (!isConnected || !contractAddress || !window.ethereum) return;
    
    try {
      setIsProcessing(true);
      setMessage('Starting decrement transaction...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      
      setMessage('Encrypting input...');
      const encryptedInput = await createEncryptedInput(contractAddress, account, 1);
      
      setMessage('Sending transaction...');
      const tx = await contract.decrement(encryptedInput.encryptedData, encryptedInput.proof);
      
      setMessage('Waiting for confirmation...');
      const receipt = await tx.wait();
      
      setMessage('Decrement completed!');
      console.log('✅ Decrement transaction completed:', receipt);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Decrement failed:', error);
      setMessage('Decrement failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Public decryption function
  const handlePublicDecrypt = async () => {
    if (fhevmStatus !== 'ready') return;
    
    try {
      setIsPublicDecrypting(true);
      setMessage('Testing public decryption...');
      
      // Test public decryption with hardcoded ciphertexts
      const countResult = await publicDecrypt(HARDCODED_CIPHERTEXTS.encryptedCount);
      const sumResult = await publicDecrypt(HARDCODED_CIPHERTEXTS.encryptedSum);
      
      setPublicDecryptedCount(countResult);
      setPublicDecryptedSum(sumResult);
      setMessage('Public decryption completed!');
      
      console.log('✅ Public decryption results:');
      console.log('Count:', countResult);
      console.log('Sum:', sumResult);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Public decryption failed:', error);
      setMessage('Public decryption failed');
    } finally {
      setIsPublicDecrypting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Enhanced FHEVM Header */}
      <header className="bg-gradient-to-r from-[#FFEB3B] to-[#FDD835] border-b-4 border-black shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#FFEB3B]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-black text-3xl font-bold tracking-tight">Universal FHEVM SDK</h1>
                <p className="text-black/70 text-sm font-medium mt-1">React Showcase</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {fhevmStatus === 'ready' ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="status-badge bg-green-600 text-white">READY</span>
                </div>
              ) : fhevmStatus === 'error' ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="status-badge bg-red-600 text-white">ERROR</span>
                </div>
              ) : fhevmStatus === 'loading' ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#FFEB3B] animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  </div>
                  <span className="status-badge bg-black text-[#FFEB3B]">LOADING</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-500 rounded-full"></div>
                  <span className="status-badge bg-gray-500 text-white">IDLE</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {message && (
          <div className="mb-8 glass-card p-4 border-l-4 border-[#FFEB3B] animate-pulse">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#FFEB3B]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
              </svg>
              <p className="text-white font-medium">{message}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="glass-card p-8 hover:border-[#FFEB3B] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-[#FFEB3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <h2 className="text-2xl font-bold text-white">Wallet Connection</h2>
              </div>
              {!isConnected ? (
                <button onClick={connectWallet} className="btn-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  Connect
                </button>
              ) : (
                <button onClick={() => {
                  setAccount('');
                  setChainId(0);
                  setIsConnected(false);
                  setCountHandle('');
                  setDecryptedCount(null);
                  setIsDecrypting(false);
                  setIsProcessing(false);
                  setFhevmStatus('idle');
                  setMessage('');
                  setNetworkError('');
                  setIsSwitchingNetwork(false);
                }} className="btn-danger">
                  Disconnect
                </button>
              )}
            </div>

            {!isConnected ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-[#3A3A3A] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <p className="text-gray-400 mb-4">Connect your wallet to use FHEVM features</p>
                
                {/* Network switching notice */}
                <div className="mt-6 p-4 bg-[#0A0A0A] border border-[#FFEB3B]/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-[#FFEB3B]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-[#FFEB3B] font-semibold text-sm">Network Notice</span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    <strong className="text-[#FFEB3B]">Important:</strong> This app requires the Sepolia testnet. 
                    After connecting your wallet, you'll be prompted to switch to Sepolia if you're on a different network.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="info-card">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm font-medium">Status</span>
                    <span className="text-green-400 font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      Connected
                    </span>
                  </div>
                </div>
                <div className="info-card">
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-400 text-sm font-medium">Address</span>
                    <span className="code-text text-[#FFEB3B]">{account}</span>
                  </div>
                </div>
                <div className="info-card">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm font-medium">Chain ID</span>
                    <span className="text-white font-mono font-bold">{chainId}</span>
                  </div>
                </div>
                <div className="info-card">
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-400 text-sm font-medium">Contract</span>
                    {contractAddress === 'Not supported chain' ? (
                      <div className="flex items-center justify-between">
                        <span className="text-red-400 text-sm">Not supported chain</span>
                        <button
                          onClick={switchNetworkToSepolia}
                          disabled={isSwitchingNetwork}
                          className="btn-primary text-xs px-3 py-1"
                        >
                          {isSwitchingNetwork ? (
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                            </svg>
                          )}
                          {isSwitchingNetwork ? 'Switching...' : 'Switch to Sepolia'}
                        </button>
                      </div>
                    ) : (
                      <span className="code-text text-[#FFEB3B]">{contractAddress}</span>
                    )}
                  </div>
                </div>
                
                {/* Network error display */}
                {networkError && (
                  <div className="info-card border-red-500/30 bg-red-500/5">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-red-400 text-sm">{networkError}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass-card p-8 hover:border-[#FFEB3B] transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-[#FFEB3B]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              <div>
                <h2 className="text-2xl font-bold text-white">Universal FHEVM SDK</h2>
                <p className="text-gray-400 text-sm">React compatible implementation</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                'React compatible FHEVM',
                'No webpack bundling issues',
                'Real contract interactions',
                'Framework-agnostic core',
                'Works in React, Next.js, Vue',
                'Clean, simple API'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 info-card hover:border-[#FFEB3B] transition-all">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}

              <div className="mt-6 p-4 bg-[#0A0A0A] border border-[#FFEB3B]/30 rounded-lg">
                <p className="text-gray-400 text-xs leading-relaxed">
                  <strong className="text-[#FFEB3B]">Note:</strong> This is a demonstration using REAL FHEVM SDK from Zama's CDN.
                  The SDK provides actual encryption/decryption functionality on Sepolia testnet.
                </p>
              </div>
            </div>
          </div>
          </div>

        {isConnected && fhevmStatus === 'ready' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    disabled={isProcessing}
                    className="btn-primary"
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
                    {isProcessing ? 'Processing...' : 'Increment'}
                  </button>
                  <button
                    onClick={decrementCounter}
                    disabled={isProcessing}
                    className="btn-danger"
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
                    {isProcessing ? 'Processing...' : 'Decrement'}
                  </button>
                </div>

                {/* Progress/Status Messages */}
                {message && (
                  <div className="mt-6 p-4 bg-[#0A0A0A] rounded-lg border-l-4 border-[#FFEB3B] border border-[#2A2A2A] animate-pulse">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#FFEB3B]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                      </svg>
                      <p className="text-white font-medium">{message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-8 hover:border-[#FFEB3B] transition-all duration-300">
              <div className="flex items-center gap-3 mb-8">
                <svg className="w-6 h-6 text-[#FFEB3B]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                <div>
                  <h2 className="text-2xl font-bold text-white">Public Decryption Demo</h2>
                  <p className="text-gray-400 text-sm">Testing with hardcoded ciphertexts</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="info-card">
                    <span className="text-gray-400 text-xs font-medium block mb-2">Encrypted Count Ciphertext</span>
                    <span className="code-text text-[#FFEB3B] text-xs">{HARDCODED_CIPHERTEXTS.encryptedCount}</span>
                  </div>
                  <div className="info-card">
                    <span className="text-gray-400 text-xs font-medium block mb-2">Encrypted Sum Ciphertext</span>
                    <span className="code-text text-[#FFEB3B] text-xs">{HARDCODED_CIPHERTEXTS.encryptedSum}</span>
                  </div>
                </div>

                <button
                  onClick={handlePublicDecrypt}
                  disabled={isPublicDecrypting}
                  className="btn-primary w-full"
                >
                  {isPublicDecrypting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Decrypting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Test Public Decrypt
                    </>
                  )}
                </button>

                {(publicDecryptedCount !== null || publicDecryptedSum !== null) && (
                  <div className="info-card border-[#FFEB3B]/30 bg-[#FFEB3B]/5">
                    <h3 className="text-[#FFEB3B] text-lg font-bold mb-4">Public Decryption Results</h3>
                    <div className="space-y-3">
                      {publicDecryptedCount !== null && (
                        <div className="flex justify-between items-center p-3 bg-[#0A0A0A] rounded-lg">
                          <span className="text-gray-400 text-sm font-medium">Decrypted Count</span>
                          <span className="text-white text-2xl font-bold">{publicDecryptedCount}</span>
                        </div>
                      )}
                      {publicDecryptedSum !== null && (
                        <div className="flex justify-between items-center p-3 bg-[#0A0A0A] rounded-lg">
                          <span className="text-gray-400 text-sm font-medium">Decrypted Sum</span>
                          <span className="text-white text-2xl font-bold">{publicDecryptedSum}</span>
                        </div>
                      )}
                      <p className="text-gray-400 text-xs mt-3">
                        These values were decrypted using public decryption (no user signature required)
                      </p>
                      <div className="p-3 bg-[#0A0A0A] rounded-lg border border-[#FFEB3B]/20 mt-3">
                        <p className="text-gray-400 text-xs leading-relaxed">
                          <strong className="text-[#FFEB3B]">Source:</strong> The encrypted count and sum ciphertexts are from the{' '}
                          <a
                            href="https://sepolia.etherscan.io/address/0xb218c0a83fb718683ddbf97b56e01df3de3bfcf3#code"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#FFEB3B] hover:text-[#FDD835] underline transition-colors"
                          >
                            FReviewCardsFHE.sol contract
                          </a>
                          {' '}on Sepolia. These ciphertexts are publicly decryptable, demonstrating the public decryption functionality.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
