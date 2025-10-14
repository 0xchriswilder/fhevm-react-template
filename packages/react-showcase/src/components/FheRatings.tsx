import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { createEncryptedInput, publicDecrypt } from '@fhevm-sdk';

// Contract configuration
const RATINGS_CONTRACT_ADDRESS = '0xcA2430F1B112EC25cF6b6631bb40039aCa0C86e0';

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
];

interface Card {
  id: number;
  createdAt: number;
  creator: string;
  exists: boolean;
  decryptedSum?: number;
  decryptedCount?: number;
  averageRating?: number;
  hasVoted?: boolean;
  selectedRating?: number;
}

interface FheRatingsProps {
  account: string;
  chainId: number;
  isConnected: boolean;
  fhevmStatus: 'idle' | 'loading' | 'ready' | 'error';
  onMessage: (message: string) => void;
}

export default function FheRatings({ account, chainId, isConnected, fhevmStatus, onMessage }: FheRatingsProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [totalCards, setTotalCards] = useState<number>(0);
  const [creationFee, setCreationFee] = useState<string>('0');
  const [isCreating, setIsCreating] = useState(false);
  const [isRating, setIsRating] = useState<number | null>(null);
  const [isDecrypting, setIsDecrypting] = useState<number | null>(null);

  // Load cards from localStorage on mount
  useEffect(() => {
    const savedCards = localStorage.getItem('fhe-ratings-cards');
    if (savedCards) {
      setCards(JSON.parse(savedCards));
    }
  }, []);

  // Save cards to localStorage whenever cards change
  useEffect(() => {
    localStorage.setItem('fhe-ratings-cards', JSON.stringify(cards));
  }, [cards]);

  // Load contract data
  const loadContractData = useCallback(async () => {
    if (!isConnected || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(RATINGS_CONTRACT_ADDRESS, RATINGS_CONTRACT_ABI, provider);
      
      const [totalCardsResult, creationFeeResult] = await Promise.all([
        contract.getTotalCards(),
        contract.creationFee()
      ]);

      setTotalCards(Number(totalCardsResult));
      setCreationFee(ethers.formatEther(creationFeeResult));
    } catch (error) {
      console.error('Failed to load contract data:', error);
    }
  }, [isConnected]);

  // Load cards from contract
  const loadCards = async () => {
    if (!isConnected || !window.ethereum) return;

    try {
      onMessage('Loading cards from contract...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(RATINGS_CONTRACT_ADDRESS, RATINGS_CONTRACT_ABI, provider);

      const newCards: Card[] = [];
      
      for (let i = 0; i < totalCards; i++) {
        try {
          const [createdAt, creator, exists] = await contract.getCardInfo(i);
          const hasVoted = await contract.hasAddressVoted(i, account);
          
          if (exists) {
            newCards.push({
              id: i,
              createdAt: Number(createdAt),
              creator,
              exists: true,
              hasVoted
            });
          }
        } catch (error) {
          console.error(`Failed to load card ${i}:`, error);
        }
      }

      setCards(newCards);
      onMessage(`Loaded ${newCards.length} cards from contract!`);
      setTimeout(() => onMessage(''), 3000);
    } catch (error) {
      console.error('Failed to load cards:', error);
      onMessage('Failed to load cards');
    }
  };

  // Create new review card
  const createCard = async () => {
    if (!isConnected || !window.ethereum) return;

    try {
      setIsCreating(true);
      onMessage('Creating new review card...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(RATINGS_CONTRACT_ADDRESS, RATINGS_CONTRACT_ABI, signer);
      
      const fee = ethers.parseEther(creationFee);
      const tx = await contract.createReviewCard({ value: fee });
      
      onMessage('Waiting for confirmation...');
      const receipt = await tx.wait();
      
      onMessage('Review card created successfully!');
      console.log('✅ Card creation transaction completed:', receipt);
      
      // Reload cards and contract data
      await loadContractData();
      await loadCards();
      
      setTimeout(() => onMessage(''), 3000);
    } catch (error) {
      console.error('Card creation failed:', error);
      onMessage('Card creation failed');
    } finally {
      setIsCreating(false);
    }
  };

  // Select rating for a card
  const selectRating = (cardId: number, rating: number) => {
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId 
          ? { ...card, selectedRating: rating }
          : card
      )
    );
  };

  // Submit rating for a card
  const submitRating = async (cardId: number, rating: number) => {
    if (!isConnected || !window.ethereum) return;

    try {
      setIsRating(cardId);
      onMessage(`Submitting rating ${rating}/5 for card ${cardId}...`);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(RATINGS_CONTRACT_ADDRESS, RATINGS_CONTRACT_ABI, signer);
      
      onMessage('Encrypting rating...');
      const encryptedInput = await createEncryptedInput(RATINGS_CONTRACT_ADDRESS, account, rating);
      
      onMessage('Submitting encrypted rating...');
      const tx = await contract.submitEncryptedRating(
        cardId,
        encryptedInput.encryptedData,
        encryptedInput.proof
      );
      
      onMessage('Waiting for confirmation...');
      const receipt = await tx.wait();
      
      onMessage(`Rating ${rating}/5 submitted successfully!`);
      console.log('✅ Rating submission transaction completed:', receipt);
      
      // Clear selected rating and reload cards
      setCards(prevCards => 
        prevCards.map(card => 
          card.id === cardId 
            ? { ...card, selectedRating: undefined }
            : card
        )
      );
      await loadCards();
      
      setTimeout(() => onMessage(''), 3000);
    } catch (error) {
      console.error('Rating submission failed:', error);
      onMessage('Rating submission failed');
    } finally {
      setIsRating(null);
    }
  };

  // Decrypt stats for a card
  const decryptStats = async (cardId: number) => {
    if (fhevmStatus !== 'ready' || !window.ethereum) return;

    try {
      setIsDecrypting(cardId);
      onMessage(`Decrypting stats for card ${cardId}...`);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(RATINGS_CONTRACT_ADDRESS, RATINGS_CONTRACT_ABI, provider);
      
      const [sumBytes, countBytes] = await contract.getEncryptedStats(cardId);
      
      onMessage('Performing public decryption...');
      const [decryptedSum, decryptedCount] = await Promise.all([
        publicDecrypt(sumBytes),
        publicDecrypt(countBytes)
      ]);
      
      const averageRating = decryptedCount > 0 ? decryptedSum / decryptedCount : 0;
      
      // Update the card with decrypted stats
      setCards(prevCards => 
        prevCards.map(card => 
          card.id === cardId 
            ? { 
                ...card, 
                decryptedSum, 
                decryptedCount, 
                averageRating: Math.round(averageRating * 100) / 100 
              }
            : card
        )
      );
      
      onMessage(`Stats decrypted: ${decryptedSum} total, ${decryptedCount} ratings, ${averageRating.toFixed(2)} average`);
      setTimeout(() => onMessage(''), 3000);
    } catch (error) {
      console.error('Stats decryption failed:', error);
      onMessage('Stats decryption failed');
    } finally {
      setIsDecrypting(null);
    }
  };

  // Load contract data when component mounts or connection changes
  useEffect(() => {
    if (isConnected) {
      loadContractData();
    }
  }, [isConnected, loadContractData]);

  if (!isConnected || fhevmStatus !== 'ready') {
    return null;
  }

  return (
    <div className="glass-card p-8 hover:border-[#FFEB3B] transition-all duration-300">
      <div className="flex items-center gap-3 mb-8">
        <svg className="w-6 h-6 text-[#FFEB3B]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
        </svg>
        <div>
          <h2 className="text-2xl font-bold text-white">FHE Ratings Demo</h2>
          <p className="text-gray-400 text-sm">Encrypted rating system with public decryption</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Contract Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="info-card">
            <span className="text-gray-400 text-sm font-medium">Total Cards: </span>
            <span className="text-[#FFEB3B] text-xl font-bold">{totalCards}</span>
          </div>
          <div className="info-card">
            <span className="text-gray-400 text-sm font-medium">Creation Fee: </span>
            <span className="text-[#FFEB3B] text-xl font-bold">{creationFee} ETH</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={createCard}
            disabled={isCreating}
            className="btn-primary"
          >
            {isCreating ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            )}
            {isCreating ? 'Creating...' : 'Create Card'}
          </button>
          <button
            onClick={loadCards}
            className="btn-secondary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Load Cards
          </button>
        </div>

        {/* Cards List */}
        {cards.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Review Cards</h3>
            <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
              {cards.map((card) => (
                <div key={card.id} className="info-card border-[#FFEB3B]/30">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-white font-semibold">Card #{card.id}</h4>
                      <p className="text-gray-400 text-sm">
                        Created: {new Date(card.createdAt * 1000).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Creator: {card.creator.slice(0, 6)}...{card.creator.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      {card.hasVoted ? (
                        <span className="text-green-400 text-sm font-medium">✓ Voted</span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not voted</span>
                      )}
                    </div>
                  </div>

                  {/* Stats Display */}
                  {card.decryptedSum !== undefined && card.decryptedCount !== undefined && (
                    <div className="mb-3 p-3 bg-[#0A0A0A] rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <span className="text-gray-400 text-xs">Total</span>
                          <p className="text-[#FFEB3B] font-bold">{card.decryptedSum}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs">Count</span>
                          <p className="text-[#FFEB3B] font-bold">{card.decryptedCount}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs">Average</span>
                          <p className="text-[#FFEB3B] font-bold">{card.averageRating?.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    {/* Rating Stars */}
                    {!card.hasVoted && (
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => selectRating(card.id, star)}
                              className={`transition-colors duration-200 ${
                                card.selectedRating && star <= card.selectedRating
                                  ? 'text-yellow-400 hover:text-yellow-300'
                                  : 'text-gray-500 hover:text-gray-400'
                              }`}
                            >
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                            </button>
                          ))}
                        </div>
                        
                        {/* Submit Rating Button */}
                        {card.selectedRating && (
                          <button
                            onClick={() => submitRating(card.id, card.selectedRating!)}
                            disabled={isRating === card.id}
                            className="btn-primary text-sm px-4 py-2"
                          >
                            {isRating === card.id ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                Submitting...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                </svg>
                                Submit Rating {card.selectedRating}/5
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Public Decrypt Button */}
                    <button
                      onClick={() => decryptStats(card.id)}
                      disabled={isDecrypting === card.id}
                      className="btn-secondary w-full"
                    >
                      {isDecrypting === card.id ? (
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
                          Public Decrypt
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
