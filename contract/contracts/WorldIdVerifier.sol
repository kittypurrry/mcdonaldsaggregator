// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "./ByteHasher.sol";
import "./IWorldID.sol";

contract WorldIdVerifier {
    using ByteHasher for bytes;

    IWorldID internal immutable worldId;
    uint256 internal immutable groupId = 1; // Always 1 for Orb verification

    mapping(uint256 => bool) internal applicantNullifierHashes;
    mapping(uint256 => bool) internal companyNullifierHashes;

    uint256 internal immutable applicantExternalNullifierHash;
    uint256 internal immutable companyExternalNullifierHash;

    // Define the custom error
    error InvalidNullifier();

    constructor(IWorldID _worldId, string memory _appId) {
        worldId = _worldId;

        applicantExternalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), "apply-job")
            .hashToField();

        companyExternalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), "post-job")
            .hashToField();
    }

    function verifyApplicant(address signal, uint256 root, uint256 nullifierHash, uint256[8] calldata proof) public {
        if (applicantNullifierHashes[nullifierHash]) revert InvalidNullifier();

        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            applicantExternalNullifierHash,
            proof
        );

        applicantNullifierHashes[nullifierHash] = true;

        // TODO: Any additional logic for verified applicants
    }

    function verifyCompany(address signal, uint256 root, uint256 nullifierHash, uint256[8] calldata proof) public {
        if (companyNullifierHashes[nullifierHash]) revert InvalidNullifier();

        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(signal).hashToField(),
            nullifierHash,
            companyExternalNullifierHash,
            proof
        );

        companyNullifierHashes[nullifierHash] = true;

        // TODO: Any additional logic for verified companies
    }
}
