// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

interface IWorldID {
    function verifyProof(
        uint256 merkleRoot,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}
