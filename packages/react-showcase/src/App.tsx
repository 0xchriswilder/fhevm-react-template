import React, { useState } from 'react';
import { initializeFheInstance } from '@fhevm-sdk';
import FheCounter from './components/FheCounter';
import FheRatings from './components/FheRatings';
import FheVoting from './components/FheVoting';
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
  const [message, setMessage] = useState<string>('');
  const [fhevmStatus, setFhevmStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || 'Not supported chain';

  // Network switching state
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [networkError, setNetworkError] = useState<string>('');




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
                          <div className="text-center py-8">
                <svg className="w-16 h-16 text-[#3A3A3A] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <p className="text-gray-400 mb-4">Connect your wallet to use FHEVM features</p>
                
                {/* Network switching notice */}
                            <div className="mt-4 p-3 bg-[#0A0A0A] border border-[#FFEB3B]/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 text-[#FFEB3B]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                                <span className="text-[#FFEB3B] font-semibold text-xs">Network Notice</span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    <strong className="text-[#FFEB3B]">Important:</strong> This app requires the Sepolia testnet. 
                    After connecting your wallet, you'll be prompted to switch to Sepolia if you're on a different network.
                  </p>
                </div>

                            {/* SDK Features */}
                            <div className="mt-6 space-y-2">
                              <div className="flex items-center gap-2 text-xs text-gray-300">
                                <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                                <span>React compatible FHEVM</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-300">
                                <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                                <span>No webpack bundling issues</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-300">
                                <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                                <span>Real contract interactions</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-300">
                                <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                                <span>Framework-agnostic core</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-300">
                                <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                                <span>Works in React, Next.js, Vue</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-300">
                                <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                                <span>Clean, simple API</span>
                              </div>
                            </div>

                            <div className="mt-4 p-3 bg-[#0A0A0A] border border-[#FFEB3B]/30 rounded-lg">
                              <p className="text-gray-400 text-xs leading-relaxed">
                                <strong className="text-[#FFEB3B]">Note:</strong> This is a demonstration using REAL FHEVM SDK from Zama's CDN.
                                The SDK provides actual encryption/decryption functionality on Sepolia testnet.
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

          {isConnected && fhevmStatus === 'ready' && (
            <FheVoting 
              account={account}
              chainId={chainId}
              isConnected={isConnected}
              fhevmStatus={fhevmStatus}
              onMessage={setMessage}
            />
          )}
          </div>

        {isConnected && fhevmStatus === 'ready' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FheCounter 
              account={account}
              chainId={chainId}
              isConnected={isConnected}
              fhevmStatus={fhevmStatus}
              onMessage={setMessage}
            />

            <FheRatings 
              account={account}
              chainId={chainId}
              isConnected={isConnected}
              fhevmStatus={fhevmStatus}
              onMessage={setMessage}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
