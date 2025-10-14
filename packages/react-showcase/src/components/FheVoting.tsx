import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { createEncryptedInput } from '@fhevm-sdk';

// Contract ABI for SimpleVoting_uint32
const VOTING_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "durationSeconds",
        "type": "uint256"
      }
    ],
    "name": "createSession",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "sessionId",
        "type": "uint256"
      }
    ],
    "name": "getSession",
    "outputs": [
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "resolved",
        "type": "bool"
      },
      {
        "internalType": "uint32",
        "name": "yesVotes",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "noVotes",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSessionCount",
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
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasVoted",
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
        "name": "sessionId",
        "type": "uint256"
      }
    ],
    "name": "requestTallyReveal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "sessionId",
        "type": "uint256"
      },
      {
        "internalType": "externalEuint32",
        "name": "encryptedVote",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "proof",
        "type": "bytes"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Contract address for SimpleVoting_uint32
const VOTING_CONTRACT_ADDRESS = '0x7294A541222ce449faa2B8A7214C571b0fCAb52E';

interface VotingSession {
  id: number;
  creator: string;
  endTime: number;
  resolved: boolean;
  yesVotes: number;
  noVotes: number;
  hasVoted: boolean;
  canRequestTally: boolean;
}


const FheVoting = ({
  account,
  chainId,
  isConnected,
  fhevmStatus,
  onMessage
}) => {
  const [sessions, setSessions] = useState<VotingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isRequestingTally, setIsRequestingTally] = useState(false);
  const [selectedVote, setSelectedVote] = useState<'yes' | 'no' | null>(null);
  const [newSessionDuration, setNewSessionDuration] = useState(60); // 1 minute default
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sessionTopic, setSessionTopic] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const CARDS_PER_PAGE = 2;

  // Load all voting sessions
  const loadSessions = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);
      
      const sessionCount = await contract.getSessionCount();
      const sessionsData: VotingSession[] = [];

      for (let i = 0; i < Number(sessionCount); i++) {
        try {
          const sessionData = await contract.getSession(i);
          const hasVoted = await contract.hasVoted(i, account);
          
          const session: VotingSession = {
            id: i,
            creator: sessionData.creator,
            endTime: Number(sessionData.endTime),
            resolved: sessionData.resolved,
            yesVotes: Number(sessionData.yesVotes),
            noVotes: Number(sessionData.noVotes),
            hasVoted,
            canRequestTally: sessionData.creator.toLowerCase() === account.toLowerCase() && 
                           !sessionData.resolved && 
                           Date.now() / 1000 > Number(sessionData.endTime)
          };
          
          sessionsData.push(session);
        } catch (error) {
          console.error(`Error loading session ${i}:`, error);
        }
      }

      setSessions(sessionsData);
    } catch (error) {
      console.error('Error loading sessions:', error);
      onMessage('Failed to load voting sessions');
    } finally {
      setIsLoading(false);
    }
  }, [onMessage, account]);

  // Load sessions on component mount and when account changes
  useEffect(() => {
    if (isConnected && fhevmStatus === 'ready') {
      loadSessions();
    }
  }, [isConnected, fhevmStatus, account, loadSessions]);

  // Create a new voting session
  const createSession = async () => {
    if (!window.ethereum || !account) return;

    try {
      setIsLoading(true);
      onMessage('Creating new voting session...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);
      
      const tx = await contract.createSession(newSessionDuration * 60); // Convert minutes to seconds
      await tx.wait();
      
      onMessage('Voting session created successfully!');
      await loadSessions();
    } catch (error) {
      console.error('Error creating session:', error);
      onMessage('Failed to create voting session');
    } finally {
      setIsLoading(false);
    }
  };

  // Cast a vote
  const castVote = async (sessionId: number, vote: 'yes' | 'no') => {
    if (!window.ethereum || !account) return;

    try {
      setIsVoting(true);
      onMessage(`Casting ${vote} vote...`);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);
      
      // Create encrypted vote
      const encryptedVote = await createEncryptedInput(VOTING_CONTRACT_ADDRESS, account, vote === 'yes' ? 1 : 0);
      
      // Use the encrypted data and proof from the FHEVM SDK
      const tx = await contract.vote(sessionId, encryptedVote.encryptedData, encryptedVote.proof);
      await tx.wait();
      
      onMessage(`Vote cast successfully!`);
      setSelectedVote(null);
      await loadSessions();
    } catch (error) {
      console.error('Error casting vote:', error);
      onMessage('Failed to cast vote');
    } finally {
      setIsVoting(false);
    }
  };

  // Request tally reveal
  const requestTallyReveal = async (sessionId: number) => {
    if (!window.ethereum || !account) return;

    try {
      setIsRequestingTally(true);
      onMessage('Requesting tally reveal...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);
      
      const tx = await contract.requestTallyReveal(sessionId);
      await tx.wait();
      
      onMessage('Tally reveal requested successfully!');
      await loadSessions();
    } catch (error) {
      console.error('Error requesting tally reveal:', error);
      onMessage('Failed to request tally reveal');
    } finally {
      setIsRequestingTally(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const isSessionActive = (endTime: number) => {
    return Date.now() / 1000 < endTime;
  };

  // Get final tally for a resolved session
  const getFinalTally = async (sessionId: number) => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);
      
      const sessionData = await contract.getSession(sessionId);
      
      // Update the session with fresh data
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === sessionId 
            ? {
                ...session,
                resolved: sessionData.resolved,
                yesVotes: Number(sessionData.yesVotes),
                noVotes: Number(sessionData.noVotes)
              }
            : session
        )
      );
      
      onMessage(`Final tally for Session #${sessionId}: Yes: ${sessionData.yesVotes}, No: ${sessionData.noVotes}`);
    } catch (error) {
      console.error('Error getting final tally:', error);
      onMessage('Failed to get final tally');
    }
  };

  if (!isConnected || fhevmStatus !== 'ready') {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-6 h-6 text-[#FFEB3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h2 className="text-2xl font-bold text-white">FHE Voting</h2>
        </div>
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-[#3A3A3A] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-gray-400">Connect your wallet to use FHE Voting features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[#FFEB3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h2 className="text-2xl font-bold text-white">FHE Voting</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          )}
          Create Session
        </button>
      </div>

      {/* FHE Voting Info */}
      <div className="mb-6 p-4 bg-[#0A0A0A] border border-[#FFEB3B]/30 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-[#FFEB3B]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          <span className="text-[#FFEB3B] font-semibold text-sm">How FHE Voting Works</span>
        </div>
        <div className="space-y-2 text-sm text-gray-300">
          <p><strong className="text-[#FFEB3B]">Encrypted Votes:</strong> Your Yes/No votes are encrypted using FHEVM before submission, keeping your choice private.</p>
          <p><strong className="text-[#FFEB3B]">Oracle Callbacks:</strong> After voting ends, the oracle decrypts the encrypted tallies and reveals the results.</p>
          <p><strong className="text-[#FFEB3B]">Privacy Preserving:</strong> Individual votes remain private until the session creator requests tally reveal.</p>
          <p><strong className="text-[#FFEB3B]">Decryption Process:</strong> Only session creators can request tally reveal, which triggers oracle decryption of the encrypted vote counts.</p>
        </div>
      </div>


      {/* Sessions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <svg className="w-8 h-8 text-[#FFEB3B] animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <p className="text-gray-400">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-[#3A3A3A] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-gray-400">No voting sessions found</p>
          </div>
        ) : (
          <>
            {sessions.slice(currentPage * CARDS_PER_PAGE, (currentPage + 1) * CARDS_PER_PAGE).map((session) => (
            <div key={session.id} className="p-4 bg-[#0A0A0A] border border-gray-700 rounded-lg hover:border-[#FFEB3B] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">Session #{session.id}</h3>
                  <p className="text-sm text-gray-400">
                    Created: {formatTime(session.endTime - newSessionDuration)}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    isSessionActive(session.endTime) 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {isSessionActive(session.endTime) ? 'Active' : 'Ended'}
                  </div>
                  {session.hasVoted && (
                    <div className="mt-1 text-xs text-[#FFEB3B]">Voted</div>
                  )}
                </div>
              </div>

              {/* Voting Interface */}
              {isSessionActive(session.endTime) && !session.hasVoted && (
                <div className="mb-4">
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setSelectedVote(selectedVote === 'yes' ? null : 'yes')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        selectedVote === 'yes'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      YES
                    </button>
                    <button
                      onClick={() => setSelectedVote(selectedVote === 'no' ? null : 'no')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        selectedVote === 'no'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                      NO
                    </button>
                  </div>
                  
                  {selectedVote && (
                    <button
                      onClick={() => castVote(session.id, selectedVote)}
                      disabled={isVoting}
                      className="w-full btn-primary"
                    >
                      {isVoting ? (
                        <svg className="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      )}
                      Submit {selectedVote.toUpperCase()} Vote
                    </button>
                  )}
                </div>
              )}

              {/* Results */}
              {session.resolved && (
                <div className="mb-4 p-3 bg-[#1A1A1A] rounded-lg">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Results</h4>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-green-400">Yes: {session.yesVotes}</span>
                    <span className="text-red-400">No: {session.noVotes}</span>
                  </div>
                  <button 
                    onClick={() => getFinalTally(session.id)}
                    className="w-full px-3 py-2 bg-[#FFEB3B] text-[#0A0A0A] rounded-lg font-semibold text-sm hover:bg-[#FDD835] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                    Get Final Tally
                  </button>
                </div>
              )}

              {/* Request Tally Button */}
              {session.canRequestTally && (
                <button
                  onClick={() => requestTallyReveal(session.id)}
                  disabled={isRequestingTally}
                  className="w-full btn-secondary"
                >
                  {isRequestingTally ? (
                    <svg className="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  )}
                  Request Tally Reveal
                </button>
              )}
            </div>
          ))}
          
          {/* Pagination Controls */}
          {sessions.length > CARDS_PER_PAGE && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              
              <span className="px-3 py-1 text-sm text-gray-400">
                Page {currentPage + 1} of {Math.ceil(sessions.length / CARDS_PER_PAGE)}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(Math.ceil(sessions.length / CARDS_PER_PAGE) - 1, currentPage + 1))}
                disabled={currentPage >= Math.ceil(sessions.length / CARDS_PER_PAGE) - 1}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          )}
          </>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] border border-[#FFEB3B]/30 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Create Voting Session</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vote Topic
                </label>
                <input
                  type="text"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  placeholder="Enter the topic for this vote..."
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-gray-600 rounded-lg text-white focus:border-[#FFEB3B] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNewSessionDuration(Math.max(1, newSessionDuration - 1))}
                    className="p-2 bg-[#374151] border-2 border-[#4B5563] rounded-lg hover:border-[#FFEB3B] hover:bg-[#4B5563] transition-all duration-200 min-w-[2.5rem] h-[2.5rem] flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"/>
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={newSessionDuration}
                    onChange={(e) => setNewSessionDuration(Math.max(1, Number(e.target.value)))}
                    className="flex-1 px-3 py-2 bg-[#0A0A0A] border border-gray-600 rounded-lg text-white text-center focus:border-[#FFEB3B] focus:outline-none"
                    min="1"
                  />
                  <button
                    onClick={() => setNewSessionDuration(newSessionDuration + 1)}
                    className="p-2 bg-[#374151] border-2 border-[#4B5563] rounded-lg hover:border-[#FFEB3B] hover:bg-[#4B5563] transition-all duration-200 min-w-[2.5rem] h-[2.5rem] flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (sessionTopic.trim()) {
                      
                      await createSession();
                      setSessionTopic('');
                      setShowCreateModal(false);
                    }
                  }}
                  disabled={!sessionTopic.trim() || isLoading}
                  className="flex-1 btn-primary"
                >
                  {isLoading ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FheVoting;
