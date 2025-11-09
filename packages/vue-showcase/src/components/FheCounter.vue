<template>
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
            :disabled="!countHandle || isDecrypting.value"
            class="btn-secondary w-full"
          >
            <svg v-if="isDecrypting.value" class="icon animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <svg v-else class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            {{ isDecrypting.value ? 'Decrypting...' : 'Decrypt Count' }}
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
              :disabled="isIncrementing || isDecrementing || isEncrypting.value"
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
              :disabled="isIncrementing || isDecrementing || isEncrypting.value"
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ethers } from 'ethers'
import { useDecryptVue, useEncryptVue } from '@fhevm-sdk'

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

// Props
interface Props {
  account: string
  chainId: number
  isConnected: boolean
  fhevmStatus: 'idle' | 'loading' | 'ready' | 'error'
  onMessage: (message: string) => void
}

const props = defineProps<Props>()

// Use Vue composables
const contractAddress = computed(() => 
  CONTRACT_ADDRESSES[props.chainId as keyof typeof CONTRACT_ADDRESSES] || 'Not supported chain'
)

const { decrypt, isDecrypting, error: decryptError } = useDecryptVue()
const { encrypt, isEncrypting, error: encryptError } = useEncryptVue()

// Reactive state
const countHandle = ref<string>('')
const decryptedCount = ref<number | null>(null)
const isIncrementing = ref(false)
const isDecrementing = ref(false)

// Get encrypted count from contract
const getCount = async () => {
  if (!props.isConnected || !contractAddress.value || !window.ethereum) return
  
  try {
    props.onMessage('Reading contract...')
    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(contractAddress.value, CONTRACT_ABI, provider)
    const result = await contract.getCount()
    countHandle.value = result
    props.onMessage('Contract read successfully!')
    setTimeout(() => props.onMessage(''), 3000)
  } catch (error) {
    console.error('Get count failed:', error)
    props.onMessage('Failed to get count')
  }
}

// Decrypt count using EIP-712
const handleDecrypt = async () => {
  if (!countHandle.value || !window.ethereum || !contractAddress.value || contractAddress.value === 'Not supported chain') return
  
  try {
    props.onMessage('Decrypting with EIP-712 user decryption...')
    
    // Get signer for EIP-712 signature
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    
    const result = await decrypt(contractAddress.value, signer, countHandle.value)
    if (result !== null) {
      decryptedCount.value = result
      props.onMessage('EIP-712 decryption completed!')
      setTimeout(() => props.onMessage(''), 3000)
    } else {
      props.onMessage(decryptError.value ? `Decryption failed: ${decryptError.value}` : 'Decryption failed')
    }
  } catch (error) {
    console.error('Decryption failed:', error)
    props.onMessage('Decryption failed')
  }
}

// Increment counter
const incrementCounter = async () => {
  if (!props.isConnected || !contractAddress.value || contractAddress.value === 'Not supported chain' || !window.ethereum) return
  
  try {
    isIncrementing.value = true
    props.onMessage('Starting increment transaction...')
    
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress.value, CONTRACT_ABI, signer)
    
    props.onMessage('Encrypting input...')
    const encryptedInput = await encrypt(contractAddress.value, props.account, 1)
    
    if (!encryptedInput) {
      props.onMessage(encryptError.value ? `Encryption failed: ${encryptError.value}` : 'Encryption failed')
      return
    }
    
    props.onMessage('Sending transaction...')
    const tx = await contract.increment(encryptedInput.encryptedData, encryptedInput.proof)
    
    props.onMessage('Waiting for confirmation...')
    const receipt = await tx.wait()
    
    props.onMessage('Increment completed!')
    console.log('✅ Increment transaction completed:', receipt)
    
    setTimeout(() => props.onMessage(''), 3000)
  } catch (error) {
    console.error('Increment failed:', error)
    props.onMessage('Increment failed')
  } finally {
    isIncrementing.value = false
  }
}

// Decrement counter
const decrementCounter = async () => {
  if (!props.isConnected || !contractAddress.value || contractAddress.value === 'Not supported chain' || !window.ethereum) return
  
  try {
    isDecrementing.value = true
    props.onMessage('Starting decrement transaction...')
    
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress.value, CONTRACT_ABI, signer)
    
    props.onMessage('Encrypting input...')
    const encryptedInput = await encrypt(contractAddress.value, props.account, 1)
    
    if (!encryptedInput) {
      props.onMessage(encryptError.value ? `Encryption failed: ${encryptError.value}` : 'Encryption failed')
      return
    }
    
    props.onMessage('Sending transaction...')
    const tx = await contract.decrement(encryptedInput.encryptedData, encryptedInput.proof)
    
    props.onMessage('Waiting for confirmation...')
    const receipt = await tx.wait()
    
    props.onMessage('Decrement completed!')
    console.log('✅ Decrement transaction completed:', receipt)
    
    setTimeout(() => props.onMessage(''), 3000)
  } catch (error) {
    console.error('Decrement failed:', error)
    props.onMessage('Decrement failed')
  } finally {
    isDecrementing.value = false
  }
}
</script>
