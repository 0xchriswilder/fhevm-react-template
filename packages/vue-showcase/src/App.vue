<template>
  <div class="app">
    <!-- Enhanced FHEVM Header -->
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
          <div class="header-text">
            <h1 class="app-title">Universal FHEVM SDK</h1>
            <p class="app-subtitle">Vue Showcase</p>
          </div>
        </div>
        <div class="header-right">
          <div v-if="fhevmStatus === 'ready'" class="status-indicator">
            <div class="status-icon ready">
              <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span class="status-badge ready">READY</span>
          </div>
          <div v-else-if="fhevmStatus === 'error'" class="status-indicator">
            <div class="status-icon error">
              <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span class="status-badge error">ERROR</span>
          </div>
          <div v-else class="status-indicator">
            <div class="status-icon loading">
              <svg class="icon animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <span class="status-badge loading">LOADING</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Progress Messages -->
        <div v-if="message" class="message-container">
          <div class="message">
            <svg class="message-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
            </svg>
            <p>{{ message }}</p>
          </div>
        </div>

        <!-- Wallet Connection and SDK Info Side by Side -->
        <div class="main-grid">
          <!-- Wallet Connection -->
          <div class="glass-card">
            <div class="card-header">
              <div class="card-title">
                <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <h2>Wallet Connection</h2>
              </div>
              <button v-if="!isConnected" @click="connectWallet" class="btn-primary">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                Connect
              </button>
              <button v-else @click="disconnectWallet" class="btn-danger">
                Disconnect
              </button>
            </div>
            <div class="card-content">
              <div v-if="!isConnected" class="empty-state">
                <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <p>Connect your wallet to use FHEVM features</p>
              </div>
              <div v-else class="connection-info">
                <div class="info-card">
                  <div class="info-row">
                    <span class="info-label">Status</span>
                    <span class="info-value success">
                      <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                      Connected
                    </span>
                  </div>
                </div>
                <div class="info-card">
                  <div class="info-column">
                    <span class="info-label">Address</span>
                    <span class="info-value code-text">{{ account }}</span>
                  </div>
                </div>
                <div class="info-card">
                  <div class="info-row">
                    <span class="info-label">Chain ID</span>
                    <span class="info-value">{{ chainId }}</span>
                  </div>
                </div>
                <div class="info-card">
                  <div class="info-column">
                    <span class="info-label">Contract</span>
                    <span class="info-value code-text">{{ contractAddress }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SDK Info -->
          <div class="glass-card">
            <div class="card-header">
              <div class="card-title">
                <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <div>
                  <h2>Universal FHEVM SDK</h2>
                  <p class="card-subtitle">Vue compatible implementation</p>
                </div>
              </div>
            </div>
            <div class="card-content">
              <div class="features-list">
                <div class="feature-item">
                  <svg class="checkmark" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span>Vue compatible FHEVM</span>
                </div>
                <div class="feature-item">
                  <svg class="checkmark" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span>No webpack bundling issues</span>
                </div>
                <div class="feature-item">
                  <svg class="checkmark" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span>Real contract interactions</span>
                </div>
                <div class="feature-item">
                  <svg class="checkmark" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span>Framework-agnostic core</span>
                </div>
                <div class="feature-item">
                  <svg class="checkmark" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span>Works in React, Next.js, Vue</span>
                </div>
                <div class="feature-item">
                  <svg class="checkmark" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span>Clean, simple API</span>
                </div>
              </div>
              <div class="note">
                <strong>Note:</strong> This is a demonstration using REAL FHEVM SDK from Zama's CDN. 
                The SDK provides actual encryption/decryption functionality on Sepolia testnet.
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="main-grid">
          <!-- FHEVM Counter Demo -->
          <div v-if="isConnected && fhevmStatus === 'ready'" class="glass-card">
            <div class="card-header">
              <div class="card-title">
                <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <div>
                  <h2>FHEVM Counter Demo</h2>
                  <p class="card-subtitle">Using REAL FHEVM SDK on Sepolia testnet</p>
                </div>
              </div>
            </div>
            <div class="card-content">
              <div class="demo-controls">
                <div class="control-group">
                  <button @click="getCount" class="btn-primary w-full">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Get Count
                  </button>
                  <div v-if="countHandle" class="info-card border-[#FFEB3B]/30">
                    <span class="info-label">Encrypted Handle</span>
                    <span class="info-value code-text">{{ countHandle }}</span>
                  </div>
                </div>

                <div class="divider"></div>

                <div class="control-group">
                  <button 
                    @click="handleDecrypt" 
                    :disabled="!countHandle || isDecrypting"
                    class="btn-secondary w-full"
                  >
                    <svg v-if="isDecrypting" class="icon animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <svg v-else class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    {{ isDecrypting ? 'Decrypting...' : 'Decrypt Count' }}
                  </button>
                  <div v-if="decryptedCount !== null" class="info-card">
                    <div class="info-row">
                      <span class="info-label">Decrypted Count</span>
                      <span class="info-value result">{{ decryptedCount }}</span>
                    </div>
                  </div>
                </div>

                <div class="divider"></div>

                <div class="control-group">
                  <div class="button-row">
                    <button 
                      @click="incrementCounter" 
                      :disabled="isIncrementing || isDecrementing"
                      class="btn-primary"
                    >
                      <svg v-if="isIncrementing" class="icon animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      <svg v-else class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5v14"/>
                      </svg>
                      {{ isIncrementing ? 'Incrementing...' : '+ Increment' }}
                    </button>
                    <button 
                      @click="decrementCounter" 
                      :disabled="isIncrementing || isDecrementing"
                      class="btn-danger"
                    >
                      <svg v-if="isDecrementing" class="icon animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      <svg v-else class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/>
                      </svg>
                      {{ isDecrementing ? 'Decrementing...' : '- Decrement' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Public Decryption Demo -->
          <div v-if="fhevmStatus === 'ready'" class="glass-card">
            <div class="card-header">
              <div class="card-title">
                <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <div>
                  <h2>Public Decryption Demo</h2>
                  <p class="card-subtitle">Testing with hardcoded ciphertexts</p>
                </div>
              </div>
            </div>
            <div class="card-content">
              <div class="demo-controls">
                <!-- Show ciphertexts initially -->
                <div class="control-group">
                  <div class="info-card">
                    <span class="info-label">Encrypted Count Ciphertext</span>
                    <span class="info-value code-text">{{ HARDCODED_CIPHERTEXTS.encryptedCount }}</span>
                  </div>
                  <div class="info-card">
                    <span class="info-label">Encrypted Sum Ciphertext</span>
                    <span class="info-value code-text">{{ HARDCODED_CIPHERTEXTS.encryptedSum }}</span>
                  </div>
                </div>

                <div class="divider"></div>

                <div class="control-group">
                  <button 
                    @click="handlePublicDecrypt"
                    :disabled="isPublicDecrypting"
                    class="btn-primary w-full"
                  >
                    <svg v-if="isPublicDecrypting" class="icon animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <svg v-else class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    {{ isPublicDecrypting ? 'Decrypting...' : 'Test Public Decrypt' }}
                  </button>
                </div>

                <!-- Show decrypted results only after clicking -->
                <div v-if="publicDecryptedCount !== null || publicDecryptedSum !== null" class="result-section">
                  <h3 class="result-title">Public Decryption Results:</h3>
                  <div v-if="publicDecryptedCount !== null" class="info-card">
                    <div class="info-row">
                      <span class="info-label">Decrypted Count</span>
                      <span class="info-value result">{{ publicDecryptedCount }}</span>
                    </div>
                  </div>
                  <div v-if="publicDecryptedSum !== null" class="info-card">
                    <div class="info-row">
                      <span class="info-label">Decrypted Sum</span>
                      <span class="info-value result">{{ publicDecryptedSum }}</span>
                    </div>
                  </div>
                  <div class="note">
                    These values were decrypted using public decryption (no user signature required)
                  </div>
                  <div class="note">
                    <strong>Source:</strong> The encrypted count and sum ciphertexts are from the
                    <a 
                      href="https://sepolia.etherscan.io/address/0xb218c0a83fb718683ddbf97b56e01df3de3bfcf3#code" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="link"
                    >
                      ReviewCardsFHE.sol contract
                    </a>
                    on Sepolia. These ciphertexts are publicly decryptable, demonstrating the public decryption functionality.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ethers } from 'ethers'
import { initializeFheInstance, decryptValue, createEncryptedInput, publicDecrypt } from '@fhevm-sdk'

// Contract configuration
const CONTRACT_ADDRESSES = {
  31337: '0x40e8Aa088739445BC3a3727A724F56508899f65B', // Local Hardhat
  11155111: '0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e', // Sepolia
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

// Reactive state
const account = ref<string>('')
const chainId = ref<number>(0)
const isConnected = ref(false)
const fheInstance = ref<any>(null)
const countHandle = ref<string>('')
const decryptedCount = ref<number | null>(null)
const isIncrementing = ref(false)
const isDecrementing = ref(false)
const isDecrypting = ref(false)
const message = ref<string>('')
const fhevmStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const fhevmError = ref<string>('')

// Public decryption state
const publicDecryptedCount = ref<number | null>(null)
const publicDecryptedSum = ref<number | null>(null)
const isPublicDecrypting = ref(false)

// Hardcoded ciphertexts for public decryption demo
const HARDCODED_CIPHERTEXTS = {
  encryptedCount: "0x42bbe4377f93c8e01c6ea6a9bfe98cab65b67b97e1ff0000000000aa36a70500",
  encryptedSum: "0x1495e50acd5cef684c3a9cae49e18a13d631768f70ff0000000000aa36a70500"
}

const contractAddress = computed(() => 
  CONTRACT_ADDRESSES[chainId.value as keyof typeof CONTRACT_ADDRESSES] || 'Not supported chain'
)

// Initialize FHEVM
const initializeFhevm = async () => {
  try {
    fhevmStatus.value = 'loading'
    fhevmError.value = ''
    const instance = await initializeFheInstance()
    fheInstance.value = instance
    fhevmStatus.value = 'ready'
    console.log('✅ FHEVM initialized for Vue!')
  } catch (error) {
    console.error('❌ FHEVM initialization failed:', error)
    fhevmStatus.value = 'error'
    fhevmError.value = error instanceof Error ? error.message : 'Unknown error'
  }
}

// Wallet connection
const connectWallet = async () => {
  console.log('Attempting to connect wallet...')
  
  if (typeof window === 'undefined') {
    console.error('Window is undefined - not in browser environment')
    return
  }
  
  if (!window.ethereum) {
    console.error('No Ethereum provider found. Please install MetaMask or connect a wallet.')
    alert('Please install MetaMask or connect a wallet to use this app.')
    return
  }
  
  try {
    console.log('Requesting accounts...')
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    console.log('Accounts received:', accounts)
    
    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
    console.log('Chain ID:', chainIdHex)
    
    account.value = accounts[0]
    chainId.value = parseInt(chainIdHex, 16)
    isConnected.value = true
    
    console.log('Wallet connected successfully!')
    
    // Initialize FHEVM after wallet connection
    await initializeFhevm()
  } catch (error) {
    console.error('Wallet connection failed:', error)
    alert(`Wallet connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Disconnect wallet
const disconnectWallet = () => {
  account.value = ''
  chainId.value = 0
  isConnected.value = false
  fheInstance.value = null
  countHandle.value = ''
  decryptedCount.value = null
  isIncrementing.value = false
  isDecrementing.value = false
  isDecrypting.value = false
  fhevmStatus.value = 'idle'
  fhevmError.value = ''
  message.value = ''
  console.log('Wallet disconnected')
}

// Get encrypted count from contract
const getCount = async () => {
  if (!isConnected.value || !contractAddress.value || !window.ethereum) return
  
  try {
    message.value = 'Reading contract...'
    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(contractAddress.value, CONTRACT_ABI, provider)
    const result = await contract.getCount()
    countHandle.value = result
    message.value = 'Contract read successfully!'
    setTimeout(() => message.value = '', 3000)
  } catch (error) {
    console.error('Get count failed:', error)
    message.value = 'Failed to get count'
  }
}

// Decrypt count using EIP-712
const handleDecrypt = async () => {
  if (!countHandle.value || !window.ethereum) return
  
  try {
    isDecrypting.value = true
    message.value = 'Decrypting with EIP-712 user decryption...'
    
    // Get signer for EIP-712 signature
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    
    const result = await decryptValue(countHandle.value, contractAddress.value, signer)
    decryptedCount.value = result
    message.value = 'EIP-712 decryption completed!'
    setTimeout(() => message.value = '', 3000)
  } catch (error) {
    console.error('Decryption failed:', error)
    message.value = 'Decryption failed'
  } finally {
    isDecrypting.value = false
  }
}

// Public decryption function
const handlePublicDecrypt = async () => {
  if (fhevmStatus.value !== 'ready') return
  
  try {
    isPublicDecrypting.value = true
    message.value = 'Testing public decryption...'
    
    // Test public decryption with hardcoded ciphertexts
    const countResult = await publicDecrypt(HARDCODED_CIPHERTEXTS.encryptedCount)
    const sumResult = await publicDecrypt(HARDCODED_CIPHERTEXTS.encryptedSum)
    
    publicDecryptedCount.value = countResult
    publicDecryptedSum.value = sumResult
    message.value = 'Public decryption completed!'
    
    console.log('✅ Public decryption results:')
    console.log('Count:', countResult)
    console.log('Sum:', sumResult)
    
    setTimeout(() => message.value = '', 3000)
  } catch (error) {
    console.error('Public decryption failed:', error)
    message.value = 'Public decryption failed'
  } finally {
    isPublicDecrypting.value = false
  }
}

// Increment counter
const incrementCounter = async () => {
  if (!isConnected.value || !contractAddress.value || !window.ethereum || !fheInstance.value) return
  
  try {
    isIncrementing.value = true
    message.value = 'Starting increment transaction...'
    
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress.value, CONTRACT_ABI, signer)
    
    message.value = 'Encrypting input...'
    const encryptedInput = await createEncryptedInput(contractAddress.value, account.value, 1)
    
    message.value = 'Sending transaction...'
    const tx = await contract.increment(encryptedInput.encryptedData, encryptedInput.proof)
    
    message.value = 'Waiting for confirmation...'
    const receipt = await tx.wait()
    
    message.value = 'Increment completed!'
    console.log('✅ Increment transaction completed:', receipt)
    
    setTimeout(() => message.value = '', 3000)
  } catch (error) {
    console.error('Increment failed:', error)
    message.value = 'Increment failed'
  } finally {
    isIncrementing.value = false
  }
}

// Decrement counter
const decrementCounter = async () => {
  if (!isConnected.value || !contractAddress.value || !window.ethereum || !fheInstance.value) return
  
  try {
    isDecrementing.value = true
    message.value = 'Starting decrement transaction...'
    
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress.value, CONTRACT_ABI, signer)
    
    message.value = 'Encrypting input...'
    const encryptedInput = await createEncryptedInput(contractAddress.value, account.value, 1)
    
    message.value = 'Sending transaction...'
    const tx = await contract.decrement(encryptedInput.encryptedData, encryptedInput.proof)
    
    message.value = 'Waiting for confirmation...'
    const receipt = await tx.wait()
    
    message.value = 'Decrement completed!'
    console.log('✅ Decrement transaction completed:', receipt)
    
    setTimeout(() => message.value = '', 3000)
  } catch (error) {
    console.error('Decrement failed:', error)
    message.value = 'Decrement failed'
  } finally {
    isDecrementing.value = false
  }
}
</script>

<style>
@import './App.css';

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>