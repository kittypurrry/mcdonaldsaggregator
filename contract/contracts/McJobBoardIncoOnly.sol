// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity >=0.8.9 <0.9.0;

import "fhevm/lib/TFHE.sol";
import "fhevm/abstracts/EIP712WithModifier.sol";

contract JobListingsInco {
    struct SalaryRange {
        euint32 lowerRange;
        euint32 higherRange;
    }

    struct JobPost {
        SalaryRange salaryRange;
    }

    struct Applicant {
        SalaryRange salaryExpectation;
    }

    mapping(address => Applicant) public applicants;
    mapping(uint256 => JobPost) public jobPosts;
    uint256 public jobPostCount;

    event JobPostAdded(uint256 jobId);
    event ApplicantAdded(address applicant);

    function addJobPost(uint256 jobId, bytes calldata _lowerRange, bytes calldata _higherRange) public {
        euint32 lowerRange = TFHE.asEuint32(_lowerRange);
        euint32 higherRange = TFHE.asEuint32(_higherRange);

        ebool isLower = TFHE.lt(lowerRange, higherRange);
        require(TFHE.decrypt(isLower), "Invalid salary range");

        jobPostCount++;
        jobPosts[jobId] = JobPost(
            SalaryRange(lowerRange, higherRange)
        );

        emit JobPostAdded(jobId);
    }

    function addApplicant(bytes calldata _lowerRange, bytes calldata _higherRange) public {
        euint32 lowerRange = TFHE.asEuint32(_lowerRange);
        euint32 higherRange = TFHE.asEuint32(_higherRange);

        ebool isLower = TFHE.lt(lowerRange, higherRange);
        require(TFHE.decrypt(isLower), "Invalid salary range");
        applicants[msg.sender] = Applicant(SalaryRange(lowerRange, higherRange));
        
        emit ApplicantAdded(msg.sender);
    }
    
    function isMatchingSalaryRange(uint256 jobId, address applicantAddress) public view returns (bool) {
        require(jobId > 0 && jobId <= jobPostCount, "Invalid job ID");

        ebool applicantFound = TFHE.gt(applicants[applicantAddress].salaryExpectation.lowerRange, TFHE.asEuint32(0));
        require(TFHE.decrypt(applicantFound), "Applicant not found");

        JobPost storage job = jobPosts[jobId];
        Applicant storage applicant = applicants[applicantAddress];

        ebool lowerRangeCheck = TFHE.le(job.salaryRange.lowerRange, applicant.salaryExpectation.higherRange);
        ebool higherRangeCheck = TFHE.ge(job.salaryRange.higherRange, applicant.salaryExpectation.lowerRange);

        return (TFHE.decrypt(TFHE.and(lowerRangeCheck, higherRangeCheck)));
    }

    address internal contractOwner;

    constructor() {
        contractOwner = msg.sender;
    }

    modifier onlyContractOwner() {
        require(msg.sender == contractOwner);
        _;
    }
}