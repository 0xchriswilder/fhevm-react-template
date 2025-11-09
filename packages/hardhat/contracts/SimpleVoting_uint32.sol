// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, externalEuint32, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { EthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract SimpleVoting_uint32 is EthereumConfig {
    struct Session {
        address creator;
        uint256 endTime;
        euint32 yesVotes;
        euint32 noVotes;
        bool resolved;
        uint32 revealedYes;
        uint32 revealedNo;
        bool revealRequested;
    }

    Session[] public sessions;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event SessionCreated(uint256 indexed sessionId, address indexed creator, uint256 endTime);
    event VoteCast(uint256 indexed sessionId, address indexed voter);
    event TallyRevealRequested(uint256 indexed sessionId, bytes32 yesVotesHandle, bytes32 noVotesHandle);
    event SessionResolved(uint256 indexed sessionId, uint32 yesVotes, uint32 noVotes);

    function createSession(uint256 durationSeconds) external {
        require(durationSeconds > 0, "Duration must be positive");
        Session memory s = Session({
            creator: msg.sender,
            endTime: block.timestamp + durationSeconds,
            yesVotes: FHE.asEuint32(0),
            noVotes: FHE.asEuint32(0),
            resolved: false,
            revealedYes: 0,
            revealedNo: 0,
            revealRequested: false
        });
        sessions.push(s);
        emit SessionCreated(sessions.length - 1, msg.sender, s.endTime);
    }

    // Pure YES/NO voting - encrypt the choice (0 or 1) directly
    function vote(
        uint256 sessionId,
        externalEuint32 encryptedVote,
        bytes calldata proof
    ) external {
        require(sessionId < sessions.length, "Invalid session");
        Session storage s = sessions[sessionId];
        require(block.timestamp < s.endTime, "Voting ended");
        require(!hasVoted[sessionId][msg.sender], "Already voted");

        euint32 v = FHE.fromExternal(encryptedVote, proof);
        euint32 yes = FHE.asEuint32(1);  // Yes = 1
        euint32 no = FHE.asEuint32(0);   // No = 0
        euint32 one = FHE.asEuint32(1);

        s.yesVotes = FHE.add(s.yesVotes, FHE.select(FHE.eq(v, yes), one, FHE.asEuint32(0)));
        s.noVotes = FHE.add(s.noVotes, FHE.select(FHE.eq(v, no), one, FHE.asEuint32(0)));

        FHE.allowThis(s.yesVotes);
        FHE.allowThis(s.noVotes);
        // Allow creator to decrypt (for oracle/callback pattern with user decryption)
        FHE.allow(s.yesVotes, s.creator);
        FHE.allow(s.noVotes, s.creator);

        hasVoted[sessionId][msg.sender] = true;
        emit VoteCast(sessionId, msg.sender);
    }

    /// @notice Request tally reveal - makes handles publicly decryptable and emits event
    /// @param sessionId The ID of the session to reveal
    function requestTallyReveal(uint256 sessionId) external {
        require(sessionId < sessions.length, "Invalid session");
        Session storage s = sessions[sessionId];
        require(block.timestamp >= s.endTime, "Voting not ended");
        require(!s.resolved, "Already resolved");
        require(!s.revealRequested, "Reveal already requested");
        require(msg.sender == s.creator, "Only creator can request reveal");

        // Mark as requested
        s.revealRequested = true;

        // Make handles publicly decryptable so we can use publicDecrypt to get proof
        // This is safe because voting has ended and only creator can request reveal
        s.yesVotes = FHE.makePubliclyDecryptable(s.yesVotes);
        s.noVotes = FHE.makePubliclyDecryptable(s.noVotes);

        // Emit event with handles - frontend will pick this up and decrypt
        bytes32 yesHandle = FHE.toBytes32(s.yesVotes);
        bytes32 noHandle = FHE.toBytes32(s.noVotes);
        
        emit TallyRevealRequested(sessionId, yesHandle, noHandle);
    }

    /// @notice Callback function for oracle/frontend to provide decrypted values
    /// @param sessionId The ID of the session to resolve
    /// @param cleartexts ABI-encoded tuple of (uint32 yesVotes, uint32 noVotes)
    /// @param decryptionProof The decryption proof from the relayer/oracle
    function resolveTallyCallback(
        uint256 sessionId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        require(sessionId < sessions.length, "Invalid session");
        Session storage s = sessions[sessionId];
        require(s.revealRequested, "Reveal not requested");
        require(!s.resolved, "Already resolved");

        // Prepare handles list for verification
        bytes32[] memory handlesList = new bytes32[](2);
        handlesList[0] = FHE.toBytes32(s.yesVotes);
        handlesList[1] = FHE.toBytes32(s.noVotes);

        // Verify the decryption proof 
        require(
            FHE.verifySignatures(handlesList, cleartexts, decryptionProof),
            "Invalid decryption proof"
        );

        // Decode the results
        (uint32 revealedYes, uint32 revealedNo) = abi.decode(cleartexts, (uint32, uint32));

        // Store the results
        s.revealedYes = revealedYes;
        s.revealedNo = revealedNo;
        s.resolved = true;
        emit SessionResolved(sessionId, revealedYes, revealedNo);
    }

    function getSessionCount() external view returns (uint256) {
        return sessions.length;
    }

    function getSession(uint256 sessionId) external view returns (
        address creator,
        uint256 endTime,
        bool resolved,
        uint32 yesVotes,
        uint32 noVotes
    ) {
        require(sessionId < sessions.length, "Invalid session");
        Session storage s = sessions[sessionId];
        return (
            s.creator,
            s.endTime,
            s.resolved,
            s.resolved ? s.revealedYes : 0,
            s.resolved ? s.revealedNo : 0
        );
    }
}
