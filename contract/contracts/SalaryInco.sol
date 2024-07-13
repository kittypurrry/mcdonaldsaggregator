// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity >=0.8.13 <0.9.0;

import "fhevm/abstracts/EIP712WithModifier.sol";
import "fhevm/lib/TFHE.sol";
import "./Common.sol";

contract HiddenSalary is BridgeContract, EIP712WithModifier {
    mapping (address => SalaryRange) public eApplicantSalary;
    mapping (uint256 => SalaryRange) public eJobSalary;

    struct SalaryRange {
        euint32 min;
        euint32 max;
    }

    constructor() EIP712WithModifier("Authorization token", "1") {}


    function addApplicant(address applicant, bytes memory salaryMin, bytes memory salaryMax) external onlyCallerContract {
        ebool isLower = TFHE.lt(TFHE.asEuint32(salaryMin), TFHE.asEuint32(salaryMax));
        require(TFHE.decrypt(isLower), "Invalid salary range");
        eApplicantSalary[applicant] =  SalaryRange(TFHE.asEuint32(salaryMin), TFHE.asEuint32(salaryMax));
    }

    function addJobSalary(uint256 jobId, bytes memory salaryMin, bytes memory salaryMax) external onlyCallerContract {
        ebool isLower = TFHE.lt(TFHE.asEuint32(salaryMin), TFHE.asEuint32(salaryMax));
        require(TFHE.decrypt(isLower), "Invalid salary range");
        eJobSalary[jobId] =  SalaryRange(TFHE.asEuint32(salaryMin), TFHE.asEuint32(salaryMax));
    }

    function matchingSalary(address applicant, uint256 jobId) external view returns (bool) {
        ebool  lowerRangeCheck  = TFHE.le(eApplicantSalary[applicant].min, eJobSalary[jobId].max);
        ebool higherRangeCheck = TFHE.ge(eApplicantSalary[applicant].max, eJobSalary[jobId].min);
        return TFHE.decrypt(TFHE.and(lowerRangeCheck,higherRangeCheck));
    }
}