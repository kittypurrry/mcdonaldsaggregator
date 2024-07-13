// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity >=0.8.13 <0.9.0;

import "fhevm/abstracts/EIP712WithModifier.sol";
import "fhevm/lib/TFHE.sol";
import "./Common.sol";

contract HiddenCard is BridgeContract, EIP712WithModifier {
    mapping (address => euint8) public encryptedCards;

    constructor() EIP712WithModifier("Authorization token", "1") {}
    
    function returnCard(address user) external onlyCallerContract returns(uint8) {
        encryptedCards[user] = TFHE.rem(TFHE.randEuint8(), 52);
        return TFHE.decrypt(encryptedCards[user]);
    }

    function viewCard(address user) external view returns (uint8) {
        return TFHE.decrypt(encryptedCards[user]);
    }
}