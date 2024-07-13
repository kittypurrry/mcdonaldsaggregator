// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.9 <0.9.0;


import "./Common.sol";


interface IHiddenSalary {
    
    function addApplicant(address applicant, bytes memory salaryMin, bytes memory salaryMax) external;
    function addJobSalary(uint256 jobId, bytes memory salaryMin, bytes memory salaryMax) external;
    function matchingSalary(address applicant, uint256 jobId) external view returns (bool);
}

contract JobListings is BridgeContract {
    bytes32 messageId;

    uint256 public jobPostCount;

    mapping(address => mapping(uint256 => bool)) public matchingResult;

    event JobPostAdded(uint256 jobId);
    event ApplicantAdded(address applicant);

    function addJobPost(bytes calldata _lowerRange, bytes calldata _higherRange, uint256 _jobId) public {
        jobPostCount++;
        IHiddenSalary _hiddenSalary = IHiddenSalary(hiddenContract);

        // call to inco
        messageId = IInterchainExecuteRouter(iexRouter).callRemote(
            DestinationDomain,
            address(_hiddenSalary),
            0,
            abi.encodeCall(_hiddenSalary.addJobSalary, (_jobId, _lowerRange, _higherRange)),
            ""
        );

        emit JobPostAdded(_jobId);
    }

    function addApplicant(bytes calldata _lowerRange, bytes calldata _higherRange) public {
        IHiddenSalary _hiddenSalary = IHiddenSalary(hiddenContract);

        // call to inco
        messageId = IInterchainExecuteRouter(iexRouter).callRemote(
            DestinationDomain,
            address(_hiddenSalary),
            0,
            abi.encodeCall(_hiddenSalary.addApplicant, (msg.sender, _lowerRange, _higherRange)),
            ""
        );
        emit ApplicantAdded(msg.sender);
    }

    function isMatchingSalaryRange(uint256 jobId, address applicantAddress) public returns (bool) {
          IHiddenSalary _hiddenSalary = IHiddenSalary(hiddenContract);

        // call to inco

        bytes memory _callback = abi.encodePacked(this.machtingSalaryRangeResult.selector, (uint256(uint160(applicantAddress))), jobId);

        messageId = IInterchainExecuteRouter(iexRouter).callRemote(
            DestinationDomain,
            address(_hiddenSalary),
            0,
            abi.encodeCall(_hiddenSalary.matchingSalary, (msg.sender, jobId)),
            _callback
        );
    }

    function machtingSalaryRangeResult(address applicant, uint256 jobId, bool _isMatchingSalaryRange) public  {
        require(caller_contract == msg.sender, "not right caller contract");
        matchingResult[applicant][jobId] = _isMatchingSalaryRange;
    }

    function isMatching(address applicant, uint256 jobId) public view returns (bool) {
        return matchingResult[applicant][jobId];
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