# FHEVM 0.8 vs 0.9 Migration Comparison

## Overview
This document compares the old fhevm 0.8 contract with the new fhevm 0.9 contract to highlight all the changes required for migration.

---

## Required Dependencies

Before migrating to FHEVM 0.9, ensure you have the following minimum package versions installed:

| Dependency | Minimum Required Version | Notes |
|------------|-------------------------|-------|
| `@fhevm/solidity` | v0.9.0 | Contains the updated FHE library contracts. |
| `@zama-fhe/relayer-sdk` | v0.3.0-5 | Crucial for v0.9: Enables the new self-relaying decryption model. |
| `@fhevm/hardhat-plugin` | v0.3.0-0 | Latest tooling support for development and deployment. |

**Installation:**
```bash
npm install @fhevm/solidity@^0.9.0 @zama-fhe/relayer-sdk@^0.3.0-5 @fhevm/hardhat-plugin@^0.3.0-0
```

**Important Notes:**
- The `@zama-fhe/relayer-sdk` is essential for the new self-relaying decryption pattern in FHEVM 0.9
- The Relayer SDK runs in your frontend/client to handle decryption using `publicDecrypt()` or `userDecrypt()`
- Without the Relayer SDK, you cannot perform the off-chain decryption required by the new event-driven pattern

---

## 1. Configuration Import

### ❌ fhevm 0.8
```solidity
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
contract SimpleVoting_uint32 is SepoliaConfig {
```

### ✅ fhevm 0.9
```solidity
import { EthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
contract SimpleVoting_uint32 is EthereumConfig {
```

**Change:** `SepoliaConfig` → `EthereumConfig`
- `EthereumConfig` automatically handles both Ethereum mainnet (chainId = 1) and Sepolia (chainId = 11155111)
- More flexible and future-proof

---

## 2. Session Struct

### ❌ fhevm 0.8
```solidity
struct Session {
    address creator;
    uint256 endTime;
    euint32 yesVotes;
    euint32 noVotes;
    bool resolved;
    uint32 revealedYes;
    uint32 revealedNo;
    uint256 decryptionRequestId;  // Stores the request ID from oracle (FHEVM 0.8 pattern)
}
```

**Purpose of `decryptionRequestId`:**
- In 0.8, `FHE.requestDecryption()` returned a `requestId` that the oracle (external service) used to track the decryption request
- This `requestId` was stored in the session and used later to map back to the session in the callback

### ✅ fhevm 0.9
```solidity
struct Session {
    address creator;
    uint256 endTime;
    euint32 yesVotes;
    euint32 noVotes;
    bool resolved;
    uint32 revealedYes;
    uint32 revealedNo;
    bool revealRequested;  // Tracks if reveal has been requested
}
```

**Purpose of `revealRequested`:**
- Simple boolean flag that prevents duplicate reveal requests
- Ensures `requestTallyReveal()` can only be called once per session
- Used to validate that a reveal was requested before allowing `resolveTallyCallback()` to execute

**Key Differences:**
1. **Removed:** `decryptionRequestId` - No longer needed because:
   - FHEVM 0.9 doesn't use `FHE.requestDecryption()` (this function was removed)
   - Decryption is now handled externally (frontend/Relayer) via event listening
   - The callback function receives `sessionId` directly, eliminating the need for ID mapping

2. **Added:** `revealRequested` - Required because:
   - Prevents multiple reveal requests for the same session
   - Validates that a reveal was properly requested before allowing callback execution
   - Provides clear state tracking for the reveal workflow

**Why This Change Matters:**
- **0.8 Pattern:** Contract → Oracle (external service, synchronous, returns requestId) → Oracle decrypts → Oracle calls back with requestId
- **0.9 Pattern:** Contract → Event emission → Frontend (Relayer SDK) listens → Frontend (Relayer SDK) decrypts → Frontend calls back with sessionId directly
- The new pattern is more flexible, transparent, and uses the Relayer SDK in the frontend/client instead of requiring external oracle infrastructure

---

## 3. State Variables

### ❌ fhevm 0.8
```solidity
mapping(uint256 => uint256) internal sessionIdByRequestId;  // Maps requestId → sessionId
```

**Purpose:**
- When `FHE.requestDecryption()` was called, it returned a `requestId`
- The oracle (external service in 0.8) would later call `resolveTallyCallback(requestId, ...)` 
- This mapping was needed to convert the `requestId` back to the `sessionId` to find the correct session

**Workflow (FHEVM 0.8):**
```
1. requestTallyReveal() → FHE.requestDecryption() → returns requestId
2. Store: sessionIdByRequestId[requestId] = sessionId
3. Oracle (external service) decrypts and calls: resolveTallyCallback(requestId, ...)
4. Contract looks up: sessionId = sessionIdByRequestId[requestId]
```

### ✅ fhevm 0.9
```solidity
// No mapping needed - sessionId is passed directly to callback
```

**Why Removed:**
- The callback function signature changed: `resolveTallyCallback(sessionId, ...)` instead of `resolveTallyCallback(requestId, ...)`
- The frontend (using Relayer SDK) that listens to the `TallyRevealRequested` event already knows the `sessionId` from the event
- No need to map between requestId and sessionId anymore

**New Workflow (FHEVM 0.9):**
```
1. requestTallyReveal() → emit TallyRevealRequested(sessionId, handles)
2. Frontend (Relayer SDK) listens to event (gets sessionId from event)
3. Frontend (Relayer SDK) decrypts handles using publicDecrypt()
4. Frontend calls: resolveTallyCallback(sessionId, ...) directly
```

**Benefits:**
- **Simpler:** One less state variable to manage
- **More Direct:** No indirection through requestId mapping
- **Clearer:** The sessionId is explicit in both the event and callback
- **Less Gas:** No storage operations for mapping

---

## 4. Events

### ❌ fhevm 0.8
```solidity
event TallyRevealRequested(uint256 indexed sessionId, uint256 requestId);
```

### ✅ fhevm 0.9
```solidity
event TallyRevealRequested(uint256 indexed sessionId, bytes32 yesVotesHandle, bytes32 noVotesHandle);
```

**Change:** Event now emits encrypted handles instead of request ID
- Frontend (using Relayer SDK) can directly use the handles for decryption via `publicDecrypt()`
- More transparent and useful for client-side decryption

---

## 5. Vote Function - Permission Grants

### ❌ fhevm 0.8
```solidity
FHE.allowThis(s.yesVotes);
FHE.allowThis(s.noVotes);
// No explicit permission for creator
```

### ✅ fhevm 0.9 (Public Decryption Pattern)
```solidity
FHE.allowThis(s.yesVotes);
FHE.allowThis(s.noVotes);
// Note: FHE.allow() is NOT needed for public decryption pattern
// Public decryption uses makePubliclyDecryptable() in requestTallyReveal()
```

**Change:** No additional permission grants needed in `vote()` function
- **Public Decryption Pattern:** Uses `FHE.makePubliclyDecryptable()` in `requestTallyReveal()` instead
- `FHE.allow()` is only needed if using `userDecrypt()` (which requires per-user permissions)
- Since we use `publicDecrypt()` after making handles publicly decryptable, `FHE.allow()` is not required
- The `allowThis()` calls are still needed for homomorphic operations within the contract

**Alternative Pattern (User Decryption):**
If you wanted to use `userDecrypt()` instead of `publicDecrypt()`, you would add:
```solidity
FHE.allow(s.yesVotes, s.creator);
FHE.allow(s.noVotes, s.creator);
```
But this is **not needed** for the public decryption flow we're using.

---

## 6. requestTallyReveal Function

### ❌ fhevm 0.8
```solidity
function requestTallyReveal(uint256 sessionId) external {
    // ... validations ...
    
    bytes32[] memory cts = new bytes32[](2);
    cts[0] = FHE.toBytes32(s.yesVotes);
    cts[1] = FHE.toBytes32(s.noVotes);
    
    // Direct call to FHE library - synchronous
    uint256 requestId = FHE.requestDecryption(cts, this.resolveTallyCallback.selector);
    s.decryptionRequestId = requestId;
    sessionIdByRequestId[requestId] = sessionId;
    emit TallyRevealRequested(sessionId, requestId);
}
```

### ✅ fhevm 0.9
```solidity
function requestTallyReveal(uint256 sessionId) external {
    // ... validations ...
    require(!s.revealRequested, "Reveal already requested");  // NEW: Prevent duplicate requests
    
    // Mark as requested
    s.revealRequested = true;
    
    // CRITICAL: Make handles publicly decryptable so publicDecrypt() can be used
    // This is safe because voting has ended and only creator can request reveal
    s.yesVotes = FHE.makePubliclyDecryptable(s.yesVotes);
    s.noVotes = FHE.makePubliclyDecryptable(s.noVotes);
    
    // Emit event with handles - frontend will pick this up and decrypt
    bytes32 yesHandle = FHE.toBytes32(s.yesVotes);
    bytes32 noHandle = FHE.toBytes32(s.noVotes);
    
    emit TallyRevealRequested(sessionId, yesHandle, noHandle);
}
```

**Key Changes:**
1. **Removed:** `FHE.requestDecryption()` - This function doesn't exist in 0.9
2. **Added:** `revealRequested` flag check to prevent duplicate requests
3. **Added:** `FHE.makePubliclyDecryptable()` - **Critical step** that enables `publicDecrypt()` to work
4. **Changed:** Event-based pattern - emits handles for frontend/client decryption
5. **Removed:** Direct oracle interaction - now handled by Relayer SDK in the frontend/client

**Why `makePubliclyDecryptable()` is Required:**
- In FHEVM 0.9, encrypted values are private by default
- To use `publicDecrypt()` (which returns a decryption proof), the handles must be made publicly decryptable
- This is safe because:
  - Voting has already ended (`block.timestamp >= s.endTime`)
  - Only the creator can request reveal (`msg.sender == s.creator`)
  - The reveal is explicitly requested, indicating the creator wants to make results public
- Without this call, `publicDecrypt()` would fail because the handles are still private

---

## 7. resolveTallyCallback Function

### ❌ fhevm 0.8
```solidity
function resolveTallyCallback(
    uint256 requestId,  // First parameter is requestId
    bytes memory cleartexts,
    bytes memory decryptionProof
) external {
    // Uses requestId to verify
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);
    
    (uint32 revealedYes, uint32 revealedNo) = abi.decode(cleartexts, (uint32, uint32));
    
    // Lookup sessionId from requestId
    uint256 sessionId = sessionIdByRequestId[requestId];
    Session storage s = sessions[sessionId];
    
    s.revealedYes = revealedYes;
    s.revealedNo = revealedNo;
    s.resolved = true;
    emit SessionResolved(sessionId, revealedYes, revealedNo);
}
```

### ✅ fhevm 0.9
```solidity
function resolveTallyCallback(
    uint256 sessionId,  // First parameter is sessionId (direct!)
    bytes memory cleartexts,
    bytes memory decryptionProof
) external {
    require(sessionId < sessions.length, "Invalid session");
    Session storage s = sessions[sessionId];
    require(s.revealRequested, "Reveal not requested");  // NEW: Verify reveal was requested
    require(!s.resolved, "Already resolved");
    
    // Prepare handles list for verification
    bytes32[] memory handlesList = new bytes32[](2);
    handlesList[0] = FHE.toBytes32(s.yesVotes);
    handlesList[1] = FHE.toBytes32(s.noVotes);
    
    // NEW API: verifySignatures instead of checkSignatures
    require(
        FHE.verifySignatures(handlesList, cleartexts, decryptionProof),
        "Invalid decryption proof"
    );
    
    (uint32 revealedYes, uint32 revealedNo) = abi.decode(cleartexts, (uint32, uint32));
    
    s.revealedYes = revealedYes;
    s.revealedNo = revealedNo;
    s.resolved = true;
    emit SessionResolved(sessionId, revealedYes, revealedNo);
}
```

**Key Changes:**
1. **Parameter:** `requestId` → `sessionId` (direct lookup, no mapping needed)
2. **API:** `FHE.checkSignatures(requestId, ...)` → `FHE.verifySignatures(handlesList, ...)`
3. **Verification:** Now requires handles list instead of requestId
4. **Added:** Validation checks for `revealRequested` and `resolved` status
5. **Removed:** `sessionIdByRequestId` mapping lookup

---

## 8. createSession Function

### ❌ fhevm 0.8
```solidity
Session memory s = Session({
    // ... other fields ...
    decryptionRequestId: 0
});
```

### ✅ fhevm 0.9
```solidity
Session memory s = Session({
    // ... other fields ...
    revealRequested: false
});
```

**Change:** Initialization matches new struct field

---

## Summary of Breaking Changes

| Aspect | fhevm 0.8 | fhevm 0.9 | Impact |
|--------|-----------|-----------|--------|
| **Config** | `SepoliaConfig` | `EthereumConfig` | ✅ Better network support |
| **Decryption API** | `FHE.requestDecryption()` | Event-based pattern | ⚠️ Major change - requires external handler |
| **Verification API** | `FHE.checkSignatures(requestId, ...)` | `FHE.verifySignatures(handles, ...)` | ⚠️ API signature changed |
| **Callback Param** | `requestId` first | `sessionId` first | ⚠️ Breaking change for callers |
| **State Tracking** | `decryptionRequestId` + mapping | `revealRequested` flag | ✅ Simpler |
| **Permissions** | Implicit | Explicit `FHE.allow()` | ⚠️ Must grant permissions |

---

## Migration Checklist

- [x] Change `SepoliaConfig` → `EthereumConfig`
- [x] Remove `decryptionRequestId` from Session struct
- [x] Add `revealRequested` boolean to Session struct
- [x] Remove `sessionIdByRequestId` mapping
- [x] Update `requestTallyReveal()` to emit event instead of calling `FHE.requestDecryption()`
- [x] Update `resolveTallyCallback()` signature: `requestId` → `sessionId`
- [x] Replace `FHE.checkSignatures()` with `FHE.verifySignatures()`
- [x] Add `FHE.makePubliclyDecryptable()` in `requestTallyReveal()` for public decryption pattern
- [x] Update event signature to emit handles
- [x] Add validation checks in callback function

---

## Architecture Change

### fhevm 0.8: Synchronous Oracle Pattern
```
Contract → FHE.requestDecryption() → Oracle (external service) → Callback
         (returns requestId immediately)
```
- Oracle is an external service that handles decryption
- Contract has direct dependency on oracle infrastructure

### fhevm 0.9: Event-Driven Self-Relaying Pattern
```
Contract → emit TallyRevealRequested event
         ↓
Frontend (Relayer SDK) listens to event
         ↓
Frontend (Relayer SDK) decrypts handles using publicDecrypt()
         ↓
Frontend calls resolveTallyCallback() with proof
```
- Relayer SDK runs in the frontend/client (browser)
- No external oracle service needed
- Frontend handles the entire decryption flow

**Benefits of 0.9 Pattern:**
- More flexible (frontend/client handles decryption using Relayer SDK)
- Better separation of concerns (decryption logic in client, not external service)
- No oracle dependency - uses Relayer SDK in frontend instead
- More transparent (handles visible in events, decryption happens client-side)
- Self-relaying: The same frontend that requests reveal also performs decryption and submits results

