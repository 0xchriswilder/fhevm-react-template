// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { EthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ReviewCardsFHE is EthereumConfig {
    // Struct to store a single review card
    struct ReviewCard {
        uint256 id;                  // Unique card ID
        euint32 encryptedSum;         // Encrypted sum of all ratings (1-5 range)
        euint32 encryptedCount;       // Encrypted count of ratings submitted
        bool exists;                 // Check if card exists
        uint256 createdAt;           // Timestamp when card was created
        address creator;             // Address that created the card
    }

    // State variables
    mapping(uint256 => ReviewCard) public reviewCards;
    uint256 public nextCardId;  // Auto-incrementing ID for each new card
    
    // Track which addresses have voted on which cards to prevent double voting
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Fee and owner
    address public owner;
    uint256 public creationFee = 0.005 ether;

    // Events
    event CardCreated(uint256 indexed cardId, address indexed creator, uint256 timestamp);
    event RatingSubmitted(uint256 indexed cardId, address indexed rater, uint256 timestamp);
    event CreationFeeChanged(uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Set creation fee (only owner)
    function setCreationFee(uint256 newFee) external onlyOwner {
        creationFee = newFee;
        emit CreationFeeChanged(newFee);
    }

    // Withdraw collected fees (only owner)
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner).transfer(balance);
        emit FeesWithdrawn(owner, balance);
    }

    // Create a new review card (requires fee)
    function createReviewCard() external payable {
        require(msg.value >= creationFee, "Insufficient creation fee");
        uint256 cardId = nextCardId++;
        ReviewCard storage card = reviewCards[cardId];
        
        card.id = cardId;
        card.encryptedSum = FHE.asEuint32(0);
        FHE.allowThis(card.encryptedSum);
        FHE.makePubliclyDecryptable(card.encryptedSum);
        card.encryptedCount = FHE.asEuint32(0);
        FHE.allowThis(card.encryptedCount);
        FHE.makePubliclyDecryptable(card.encryptedCount);
        card.exists = true;
        card.createdAt = block.timestamp;
        card.creator = msg.sender;

        emit CardCreated(cardId, msg.sender, block.timestamp);
    }

    // Submit encrypted rating (1-5 stars)
    function submitEncryptedRating(uint256 cardId, externalEuint32 encryptedRating, bytes calldata inputProof) external {
        require(reviewCards[cardId].exists, "Card does not exist");
        require(!hasVoted[cardId][msg.sender], "Already voted on this card");

        ReviewCard storage card = reviewCards[cardId];

        // Import the encrypted rating using the proof
        euint32 rating = FHE.fromExternal(encryptedRating, inputProof);

        // Homomorphic addition: add encrypted rating to sum
        card.encryptedSum = FHE.add(card.encryptedSum, rating);
        FHE.allowThis(card.encryptedSum);
        FHE.makePubliclyDecryptable(card.encryptedSum);

        // Increment encrypted count
        euint32 one = FHE.asEuint32(1);
        card.encryptedCount = FHE.add(card.encryptedCount, one);
        FHE.allowThis(card.encryptedCount);
        FHE.makePubliclyDecryptable(card.encryptedCount);

        // Mark this address as having voted
        hasVoted[cardId][msg.sender] = true;

        emit RatingSubmitted(cardId, msg.sender, block.timestamp);
    }

    // Get encrypted stats (sum and count) for frontend decryption/average
    function getEncryptedStats(uint256 cardId) external view returns (bytes32 sum, bytes32 count) {
        require(reviewCards[cardId].exists, "Card does not exist");
        ReviewCard storage card = reviewCards[cardId];
        sum = FHE.toBytes32(card.encryptedSum);
        count = FHE.toBytes32(card.encryptedCount);
    }

    // Get card information (non-encrypted data)
    function getCardInfo(uint256 cardId) external view returns (
        uint256 createdAt,
        address creator,
        bool exists
    ) {
        require(reviewCards[cardId].exists, "Card does not exist");
        
        ReviewCard storage card = reviewCards[cardId];
        return (
            card.createdAt,
            card.creator,
            card.exists
        );
    }

    // Check if an address has voted on a specific card
    function hasAddressVoted(uint256 cardId, address voter) external view returns (bool) {
        return hasVoted[cardId][voter];
    }

    // Get total number of cards created
    function getTotalCards() external view returns (uint256) {
        return nextCardId;
    }
}
