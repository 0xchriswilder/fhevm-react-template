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
              <button v-if="!isConnected" @click="handleConnectWallet" class="btn-primary">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                Connect
              </button>
              <button v-else @click="handleDisconnectWallet" class="btn-danger">
                Disconnect
              </button>
            </div>
            <div class="card-content">
                          <div v-if="!isConnected" class="empty-state">
                            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                            <p>Connect your wallet to use FHEVM features</p>
                            
                            <!-- Network switching notice -->
                            <div class="network-notice">
                              <div class="notice-header">
                                <svg class="notice-icon" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                                </svg>
                                <span class="notice-title">Network Notice</span>
                              </div>
                              <p class="notice-text">
                                <strong>Important:</strong> This app requires the Sepolia testnet. 
                                After connecting your wallet, you'll be prompted to switch to Sepolia if you're on a different network.
                              </p>
                            </div>

                            <!-- SDK Features -->
                            <div class="sdk-features">
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

                            <div class="sdk-note">
                              <strong>Note:</strong> This is a demonstration using REAL FHEVM SDK from Zama's CDN. 
                              The SDK provides actual encryption/decryption functionality on Sepolia testnet.
                            </div>
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
                    <span class="info-label">Contract Address</span>
                    <div v-if="contractAddress === 'Not supported chain' || !contractAddress" class="contract-error">
                      <span class="error-text">Not supported chain</span>
                      <button 
                        @click="switchNetworkToSepolia"
                        :disabled="isSwitchingNetwork"
                        class="btn-primary btn-small"
                      >
                        <svg v-if="isSwitchingNetwork" class="icon animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <svg v-else class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        {{ isSwitchingNetwork ? 'Switching...' : 'Switch to Sepolia' }}
                      </button>
                    </div>
                    <span v-else class="info-value code-text">{{ contractAddress }}</span>
                  </div>
                </div>
                
                <!-- Error displays -->
                <div v-if="networkError" class="info-card network-error">
                  <div class="error-content">
                    <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span class="error-message">{{ networkError }}</span>
                  </div>
                </div>
                <div v-if="walletError.value" class="info-card network-error">
                  <div class="error-content">
                    <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span class="error-message">Wallet: {{ walletError.value }}</span>
                  </div>
                </div>
                <div v-if="fhevmError.value" class="info-card network-error">
                  <div class="error-content">
                    <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span class="error-message">FHEVM: {{ fhevmError.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

                      <!-- FHE Voting -->
                      <FheVoting 
                        v-if="isConnected && fhevmStatus === 'ready'"
                        :account="account"
                        :chainId="chainId"
                        :isConnected="isConnected"
                        :fhevmStatus="fhevmStatus"
                        :onMessage="(msg) => message = msg"
                      />
        </div>

                    <!-- Main Content Grid -->
                    <div class="main-grid">
                      <!-- FHEVM Counter Demo -->
                      <FheCounter 
                        :account="account"
                        :chainId="chainId"
                        :isConnected="isConnected"
                        :fhevmStatus="fhevmStatus"
                        :onMessage="(msg) => message = msg"
                      />

                      <!-- FHE Ratings Demo -->
                      <FheRatings 
                        :account="account"
                        :chainId="chainId"
                        :isConnected="isConnected"
                        :fhevmStatus="fhevmStatus"
                        :onMessage="(msg) => message = msg"
                      />
                    </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useWalletVue, useFhevmVue } from '@fhevm-sdk'
import FheCounter from './components/FheCounter.vue'
import FheRatings from './components/FheRatings.vue'
import FheVoting from './components/FheVoting.vue'

// Contract configuration
const CONTRACT_ADDRESSES = {
  31337: '0x40e8Aa088739445BC3a3727A724F56508899f65B', // Local Hardhat
  11155111: '0x1b45fa7b7766fb27A36fBB0cfb02ea904214Cc75', // Sepolia - Updated for 0.9.0
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

// Use Vue composables
const {
  address: account,
  chainId,
  isConnected,
  connect: connectWallet,
  disconnect: disconnectWallet,
  error: walletError
} = useWalletVue()

const {
  status: fhevmStatus,
  initialize: initializeFhevm,
  error: fhevmError
} = useFhevmVue()

// Reactive state
const message = ref<string>('')
const isSwitchingNetwork = ref(false)
const networkError = ref<string>('')

const contractAddress = computed(() => {
  const id = chainId.value
  return CONTRACT_ADDRESSES[id as keyof typeof CONTRACT_ADDRESSES] || 'Not supported chain'
})

// Auto-initialize FHEVM when wallet connects
watch(() => isConnected.value, (newValue) => {
  if (newValue && fhevmStatus.value === 'idle') {
    initializeFhevm()
  }
})

// Handle wallet connection
const handleConnectWallet = async () => {
  await connectWallet()
  if (isConnected.value && fhevmStatus.value === 'idle') {
    await initializeFhevm()
  }
}

// Switch network to Sepolia
const switchNetworkToSepolia = async () => {
  if (!window.ethereum) {
    networkError.value = 'No Ethereum provider found'
    return
  }

  try {
    isSwitchingNetwork.value = true
    networkError.value = ''
    message.value = 'Switching to Sepolia network...'

    // Try to switch to Sepolia network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CONFIG.chainId }],
    })

    // Chain ID will be updated automatically by useWalletVue hook
    message.value = 'Successfully switched to Sepolia!'
    
    console.log('✅ Network switched to Sepolia')
    setTimeout(() => message.value = '', 3000)
  } catch (error: any) {
    console.error('Network switch failed:', error)
    
    // If the chain doesn't exist, try to add it
    if (error.code === 4902) {
      try {
        message.value = 'Adding Sepolia network...'
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SEPOLIA_CONFIG],
        })
        
        // Chain ID will be updated automatically by useWalletVue hook
        message.value = 'Sepolia network added and switched!'
        
        console.log('✅ Sepolia network added and switched')
        setTimeout(() => message.value = '', 3000)
      } catch (addError) {
        console.error('Failed to add Sepolia network:', addError)
        networkError.value = 'Failed to add Sepolia network. Please add it manually in your wallet.'
        message.value = 'Failed to add Sepolia network'
      }
    } else {
      networkError.value = `Failed to switch network: ${error.message || 'Unknown error'}`
      message.value = 'Failed to switch network'
    }
  } finally {
    isSwitchingNetwork.value = false
  }
}

// Handle wallet disconnection
const handleDisconnectWallet = () => {
  disconnectWallet()
  message.value = ''
  networkError.value = ''
  isSwitchingNetwork.value = false
  console.log('Wallet disconnected')
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

/* Network switching styles */
.network-notice {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #0A0A0A;
  border: 1px solid rgba(255, 235, 59, 0.3);
  border-radius: 0.5rem;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.notice-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #FFEB3B;
}

.notice-title {
  color: #FFEB3B;
  font-weight: 600;
  font-size: 0.875rem;
}

.notice-text {
  color: #9CA3AF;
  font-size: 0.75rem;
  line-height: 1.5;
}

.contract-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.error-text {
  color: #F87171;
  font-size: 0.875rem;
}

.btn-small {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.network-error {
  border-color: rgba(248, 113, 113, 0.3);
  background: rgba(248, 113, 113, 0.05);
}

.error-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-icon {
  width: 1rem;
  height: 1rem;
  color: #F87171;
  flex-shrink: 0;
}

.error-message {
  color: #F87171;
  font-size: 0.875rem;
}

/* SDK Features in Wallet Connection */
.sdk-features {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sdk-features .feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #D1D5DB;
}

.sdk-features .checkmark {
  width: 0.75rem;
  height: 0.75rem;
  color: #10B981;
  flex-shrink: 0;
}

.sdk-note {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #0A0A0A;
  border: 1px solid rgba(255, 235, 59, 0.3);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  line-height: 1.5;
  color: #9CA3AF;
}

.sdk-note strong {
  color: #FFEB3B;
}
</style>