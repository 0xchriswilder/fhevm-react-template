// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE} from "@fhevm/solidity/lib/FHE.sol";
import {CoprocessorConfig} from "@fhevm/solidity/lib/Impl.sol";

/**
 * @title   ZamaConfig.
 * @notice  This library returns the FHEVM config for different networks
 *          with the contract addresses for (1) ACL, (2) CoprocessorAddress, (3) KMSVerifier,
 *          which are deployed & maintained by Zama.
 */
library ZamaConfig {
    function getSepoliaProtocolId() internal pure returns (uint256) {
        /// @note Zama Ethereum Sepolia protocol id is '10000 + Zama Ethereum protocol id'
        return 10001;
    }

    function getSepoliaConfig() internal pure returns (CoprocessorConfig memory) {
        return
            CoprocessorConfig({
                ACLAddress: 0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D,
                CoprocessorAddress: 0xe3a9105a3a932253A70F126eb1E3b589C643dD24,
                KMSVerifierAddress: 0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A
            });
    }

    function getEthereumProtocolId() internal pure returns (uint256) {
        /// @note Zama Ethereum protocol id is '1'
        return 1;
    }

    function getEthereumConfig() internal pure returns (CoprocessorConfig memory) {
        /// @note The addresses below are placeholders and should be replaced with actual addresses
        /// once deployed on the Ethereum mainnet.
        return
            CoprocessorConfig({ACLAddress: address(0), CoprocessorAddress: address(0), KMSVerifierAddress: address(0)});
    }
}

/**
 * @title   EthereumConfig.
 * @dev     This contract can be inherited by a contract wishing to use the FHEVM contracts provided by Zama
 *          on the Ethereum (mainnet) network (chainId = 1) or Sepolia (testnet) network (chainId = 11155111).
 *          Other providers may offer similar contracts deployed at different addresses.
 *          If you wish to use them, you should rely on the instructions from these providers.
 */
contract EthereumConfig {
    constructor() {
        if (block.chainid == 1) {
            FHE.setCoprocessor(ZamaConfig.getEthereumConfig());
        } else if (block.chainid == 11155111) {
            FHE.setCoprocessor(ZamaConfig.getSepoliaConfig());
        } else if (block.chainid == 31337) {
            FHE.setCoprocessor(ZamaConfig.getSepoliaConfig());
        }
    }

    function protocolId() public view returns (uint256) {
        if (block.chainid == 1) {
            return ZamaConfig.getEthereumProtocolId();
        } else if (block.chainid == 11155111) {
            return ZamaConfig.getSepoliaProtocolId();
        } else if (block.chainid == 31337) {
            return ZamaConfig.getSepoliaProtocolId();
        }
        return 0;
    }
}
