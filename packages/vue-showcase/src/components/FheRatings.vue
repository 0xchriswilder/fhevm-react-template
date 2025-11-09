<template>
  <div v-if="isConnected && fhevmStatus === 'ready'" class="glass-card">
    <div class="card-header">
      <div class="card-title">
        <svg class="card-icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
        </svg>
        <div>
          <h2>FHE Ratings Demo</h2>
          <p class="card-subtitle">Encrypted rating system with public decryption</p>
        </div>
      </div>
    </div>
    <div class="card-content">
      <div class="demo-controls">
        <!-- Contract Info -->
        <div class="control-group">
          <div class="info-row">
            <div class="info-card">
              <span class="info-label">Total Cards</span>
              <span class="info-value result">{{ totalCards }}</span>
            </div>
            <div class="info-card">
              <span class="info-label">Creation Fee</span>
              <span class="info-value result">{{ creationFee }} ETH</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Actions -->
        <div class="control-group">
          <div class="button-row">
            <button 
              @click="createCard" 
              :disabled="isCreating"
              class="btn-primary"
            >
              <svg v-if="isCreating" class="icon animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <svg v-else class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              {{ isCreating ? 'Creating...' : 'Create Card' }}
            </button>
            <button 
              @click="loadCards"
              class="btn-secondary"
            >
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Load Cards
            </button>
          </div>
        </div>

        <!-- Cards List -->
        <div v-if="cards.length > 0" class="control-group">
          <h3 class="result-title">Review Cards</h3>
          <div class="cards-container">
            <div v-for="card in cards" :key="card.id" class="rating-card">
              <div class="card-header">
                <div>
                  <h4 class="card-title">Card #{{ card.id }}</h4>
                  <p class="card-date">
                    Created: {{ new Date(card.createdAt * 1000).toLocaleDateString() }}
                  </p>
                  <p class="card-creator">
                    Creator: {{ card.creator.slice(0, 6) }}...{{ card.creator.slice(-4) }}
                  </p>
                </div>
                <div class="card-status">
                  <span v-if="card.hasVoted" class="voted-status">✓ Voted</span>
                  <span v-else class="not-voted-status">Not voted</span>
                </div>
              </div>

              <!-- Stats Display -->
              <div v-if="card.decryptedSum !== undefined && card.decryptedCount !== undefined" class="stats-section">
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">Total</span>
                    <p class="stat-value">{{ card.decryptedSum }}</p>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Count</span>
                    <p class="stat-value">{{ card.decryptedCount }}</p>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Average</span>
                    <p class="stat-value">{{ card.averageRating?.toFixed(2) }}</p>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="card-actions">
                <!-- Rating Stars -->
                <div v-if="!card.hasVoted" class="rating-section">
                  <div class="rating-stars">
                    <button
                      v-for="star in 5"
                      :key="star"
                      @click="selectRating(card.id, star)"
                      :class="[
                        'star-button',
                        card.selectedRating && star <= card.selectedRating
                          ? 'star-selected'
                          : 'star-unselected'
                      ]"
                    >
                      <svg class="star-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Submit Rating Button -->
                  <button
                    v-if="card.selectedRating"
                    @click="submitRating(card.id, card.selectedRating)"
                    :disabled="isRating === card.id || isEncrypting.value"
                    class="submit-rating-btn"
                  >
                    <svg v-if="isRating === card.id" class="icon animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <svg v-else class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    {{ isRating === card.id ? 'Submitting...' : `Submit Rating ${card.selectedRating}/5` }}
                  </button>
                </div>

                <!-- Public Decrypt Button -->
                <button
                  @click="decryptStats(card.id)"
                  :disabled="isDecrypting === card.id || isHookDecrypting.value"
                  class="public-decrypt-btn"
                >
                  <svg v-if="isDecrypting === card.id" class="icon animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <svg v-else class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  {{ isDecrypting === card.id ? 'Decrypting...' : 'Public Decrypt' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ethers } from 'ethers'
import { useEncryptVue, useDecryptVue } from '@fhevm-sdk'

// Contract configuration
const RATINGS_CONTRACT_ADDRESS = '0x0382053b0eae2A4A45C4A668505E2030913f559e' // Sepolia - Updated for 0.9.0

const RATINGS_CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "createReviewCard",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "creationFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "cardId",
        "type": "uint256"
      }
    ],
    "name": "getCardInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "cardId",
        "type": "uint256"
      }
    ],
    "name": "getEncryptedStats",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "sum",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "count",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalCards",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "cardId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "voter",
        "type": "address"
      }
    ],
    "name": "hasAddressVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "cardId",
        "type": "uint256"
      },
      {
        "internalType": "externalEuint32",
        "name": "encryptedRating",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "submitEncryptedRating",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
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
const { encrypt, isEncrypting, error: encryptError } = useEncryptVue()
const { publicDecrypt, isDecrypting: isHookDecrypting, error: decryptError } = useDecryptVue()

// Reactive state
const cards = ref<Card[]>([])
const totalCards = ref<number>(0)
const creationFee = ref<string>('0')
const isCreating = ref(false)
const isRating = ref<number | null>(null)
const isDecrypting = ref<number | null>(null)

interface Card {
  id: number
  createdAt: number
  creator: string
  exists: boolean
  decryptedSum?: number
  decryptedCount?: number
  averageRating?: number
  hasVoted?: boolean
  selectedRating?: number
}

// Load cards from localStorage on mount
onMounted(() => {
  const savedCards = localStorage.getItem('fhe-ratings-cards')
  if (savedCards) {
    cards.value = JSON.parse(savedCards)
  }
})

// Save cards to localStorage whenever cards change
watch(cards, (newCards) => {
  localStorage.setItem('fhe-ratings-cards', JSON.stringify(newCards))
}, { deep: true })

// Load contract data
const loadContractData = async () => {
  if (!props.isConnected || !window.ethereum) return

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(RATINGS_CONTRACT_ADDRESS, RATINGS_CONTRACT_ABI, provider)
    
    const [totalCardsResult, creationFeeResult] = await Promise.all([
      contract.getTotalCards(),
      contract.creationFee()
    ])

    totalCards.value = Number(totalCardsResult)
    creationFee.value = ethers.formatEther(creationFeeResult)
  } catch (error) {
    console.error('Failed to load contract data:', error)
  }
}

// Load cards from contract
const loadCards = async () => {
  if (!props.isConnected || !window.ethereum) return

  try {
    props.onMessage('Loading cards from contract...')
    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(RATINGS_CONTRACT_ADDRESS, RATINGS_CONTRACT_ABI, provider)

    const newCards: Card[] = []
    
    for (let i = 0; i < totalCards.value; i++) {
      try {
        const [createdAt, creator, exists] = await contract.getCardInfo(i)
        const hasVoted = await contract.hasAddressVoted(i, props.account)
        
        if (exists) {
          newCards.push({
            id: i,
            createdAt: Number(createdAt),
            creator,
            exists: true,
            hasVoted
          })
        }
      } catch (error) {
        console.error(`Failed to load card ${i}:`, error)
      }
    }

    cards.value = newCards
    props.onMessage(`Loaded ${newCards.length} cards from contract!`)
    setTimeout(() => props.onMessage(''), 3000)
  } catch (error) {
    console.error('Failed to load cards:', error)
    props.onMessage('Failed to load cards')
  }
}

// Create new review card
const createCard = async () => {
  if (!props.isConnected || !window.ethereum) return

  try {
    isCreating.value = true
    props.onMessage('Creating new review card...')
    
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(RATINGS_CONTRACT_ADDRESS, RATINGS_CONTRACT_ABI, signer)
    
    const fee = ethers.parseEther(creationFee.value)
    const tx = await contract.createReviewCard({ value: fee })
    
    props.onMessage('Waiting for confirmation...')
    const receipt = await tx.wait()
    
    props.onMessage('Review card created successfully!')
    console.log('✅ Card creation transaction completed:', receipt)
    
    // Reload cards and contract data
    await loadContractData()
    await loadCards()
    
    setTimeout(() => props.onMessage(''), 3000)
  } catch (error) {
    console.error('Card creation failed:', error)
    props.onMessage('Card creation failed')
  } finally {
    isCreating.value = false
  }
}

// Select rating for a card
const selectRating = (cardId: number, rating: number) => {
  cards.value = cards.value.map(card => 
    card.id === cardId 
      ? { ...card, selectedRating: rating }
      : card
  )
}

// Submit rating for a card
const submitRating = async (cardId: number, rating: number) => {
  if (!props.isConnected || !window.ethereum) return

  try {
    isRating.value = cardId
    props.onMessage(`Submitting rating ${rating}/5 for card ${cardId}...`)
    
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(RATINGS_CONTRACT_ADDRESS, RATINGS_CONTRACT_ABI, signer)
    
    props.onMessage('Encrypting rating...')
    const encryptedInput = await encrypt(RATINGS_CONTRACT_ADDRESS, props.account, rating)
    
    if (!encryptedInput) {
      props.onMessage(encryptError.value ? `Encryption failed: ${encryptError.value}` : 'Encryption failed')
      return
    }
    
    props.onMessage('Submitting encrypted rating...')
    const tx = await contract.submitEncryptedRating(
      cardId,
      encryptedInput.encryptedData,
      encryptedInput.proof
    )
    
    props.onMessage('Waiting for confirmation...')
    const receipt = await tx.wait()
    
    props.onMessage(`Rating ${rating}/5 submitted successfully!`)
    console.log('✅ Rating submission transaction completed:', receipt)
    
    // Clear selected rating and reload cards
    cards.value = cards.value.map(card => 
      card.id === cardId 
        ? { ...card, selectedRating: undefined }
        : card
    )
    await loadCards()
    
    setTimeout(() => props.onMessage(''), 3000)
  } catch (error) {
    console.error('Rating submission failed:', error)
    props.onMessage('Rating submission failed')
  } finally {
    isRating.value = null
  }
}

// Decrypt stats for a card
const decryptStats = async (cardId: number) => {
  if (props.fhevmStatus !== 'ready' || !window.ethereum) return

  try {
    isDecrypting.value = cardId
    props.onMessage(`Decrypting stats for card ${cardId}...`)
    
    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(RATINGS_CONTRACT_ADDRESS, RATINGS_CONTRACT_ABI, provider)
    
    const [sumBytes, countBytes] = await contract.getEncryptedStats(cardId)
    
    props.onMessage('Performing public decryption...')
    const [decryptedSum, decryptedCount] = await Promise.all([
      publicDecrypt(sumBytes),
      publicDecrypt(countBytes)
    ])
    
    if (decryptedSum === null || decryptedCount === null) {
      props.onMessage(decryptError.value ? `Decryption failed: ${decryptError.value}` : 'Decryption failed')
      return
    }
    
    const averageRating = decryptedCount > 0 ? decryptedSum / decryptedCount : 0
    
    // Update the card with decrypted stats
    cards.value = cards.value.map(card => 
      card.id === cardId 
        ? { 
            ...card, 
            decryptedSum, 
            decryptedCount, 
            averageRating: Math.round(averageRating * 100) / 100 
          }
        : card
    )
    
    props.onMessage(`Stats decrypted: ${decryptedSum} total, ${decryptedCount} ratings, ${averageRating.toFixed(2)} average`)
    setTimeout(() => props.onMessage(''), 3000)
  } catch (error) {
    console.error('Stats decryption failed:', error)
    props.onMessage('Stats decryption failed')
  } finally {
    isDecrypting.value = null
  }
}

// Load contract data when component mounts or connection changes
watch(() => props.isConnected, (isConnected) => {
  if (isConnected) {
    loadContractData()
  }
}, { immediate: true })
</script>

<style scoped>
.stats-display {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #0A0A0A;
  border-radius: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  color: #9CA3AF;
  font-size: 0.75rem;
}

.stat-value {
  color: #FFEB3B;
  font-weight: bold;
  font-size: 1.125rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.rating-stars {
  display: flex;
  gap: 0.25rem;
}

.star-button {
  color: #FCD34D;
  transition: color 0.2s;
}

.star-button:hover {
  color: #F59E0B;
}

.star-button:disabled {
  opacity: 0.5;
}

.btn-small {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.result-title {
  color: #FFEB3B;
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

/* Cards Container */
.cards-container {
  max-height: 24rem;
  overflow-y: auto;
  padding-right: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Rating Card */
.rating-card {
  padding: 1rem;
  background: #0A0A0A;
  border: 1px solid rgba(255, 235, 59, 0.3);
  border-radius: 0.5rem;
  transition: all 0.3s;
}

.rating-card:hover {
  border-color: #FFEB3B;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.card-title {
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.card-date {
  color: #9CA3AF;
  font-size: 0.875rem;
  margin: 0 0 0.125rem 0;
}

.card-creator {
  color: #9CA3AF;
  font-size: 0.75rem;
  margin: 0;
}

.card-status {
  text-align: right;
}

.voted-status {
  color: #4ADE80;
  font-size: 0.875rem;
  font-weight: 500;
}

.not-voted-status {
  color: #9CA3AF;
  font-size: 0.875rem;
}

/* Stats Section */
.stats-section {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #0A0A0A;
  border-radius: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  color: #9CA3AF;
  font-size: 0.75rem;
}

.stat-value {
  color: #FFEB3B;
  font-weight: bold;
  font-size: 1rem;
  margin: 0;
}

/* Card Actions */
.card-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rating-stars {
  display: flex;
  gap: 0.25rem;
}

.star-button {
  transition: color 0.2s;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star-icon {
  width: 1.5rem;
  height: 1.5rem;
  transition: color 0.2s;
}

.star-selected .star-icon {
  color: #FCD34D;
}

.star-selected:hover .star-icon {
  color: #F59E0B;
}

.star-unselected .star-icon {
  color: #6B7280;
}

.star-unselected:hover .star-icon {
  color: #9CA3AF;
}

.submit-rating-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #FFEB3B;
  color: #0A0A0A;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-rating-btn:hover:not(:disabled) {
  background: #FDD835;
}

.submit-rating-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.public-decrypt-btn {
  width: 100%;
  padding: 0.75rem;
  background: #374151;
  color: white;
  border: 1px solid #4B5563;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.public-decrypt-btn:hover:not(:disabled) {
  background: #4B5563;
  border-color: #6B7280;
}

.public-decrypt-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Info Cards */
.info-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-direction: row;
}

.info-card {
  flex: 1;
  padding: 0.75rem;
  background: #0A0A0A;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  color: #9CA3AF;
  font-size: 0.875rem;
  font-weight: 500;
}

.info-value {
  color: #FFEB3B;
  font-size: 1.125rem;
  font-weight: bold;
}
</style>
