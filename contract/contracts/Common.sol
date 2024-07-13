// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity >=0.8.13 <0.9.0;


interface IInterchainExecuteRouter {
    function callRemote(
        uint32 _destination,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes memory _callback
    ) external returns (bytes32);

    function getRemoteInterchainAccount(uint32 _destination, address _owner) external view returns (address);
}

abstract contract BridgeContract {
    uint32 DestinationDomain;
    // HiddenCard contract in Inco Network
    address hiddenContract;
    // InterchainExcuteRouter contract address in current chain
    address iexRouter;
    address caller_contract;
    bool public isInitialized;

    function initialize(uint32 _DestinationDomain, address _hiddenContract, address _iexRouter) public {
        require(isInitialized == false, "Bridge contract already initialized");
        DestinationDomain = _DestinationDomain;
        hiddenContract = _hiddenContract;
        iexRouter = _iexRouter;
        caller_contract = msg.sender;
        isInitialized = true;
    }

    function setCallerContract(address _caller_contract) public {
        caller_contract = _caller_contract;
    }

    function getICA() public view returns(address) {
        return IInterchainExecuteRouter(iexRouter).getRemoteInterchainAccount(DestinationDomain, address(this));
    }

    modifier onlyCallerContract() {
        require(caller_contract == msg.sender, "not right caller contract");
        _;
    }
}