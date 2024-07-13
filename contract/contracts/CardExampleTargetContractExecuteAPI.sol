// SPDX-License-Identifier: Apache-2.0

/* 
This contract is an example contract to demonstrate 
the cross-chain function call using ExcuteAPI 
on the base chain.
*/

pragma solidity >=0.8.13 <=0.8.19;

import "./Common.sol";


interface IHiddenCard {
    function returnCard(address user) external returns(uint8);
}


contract Card is BridgeContract {
    // bytes32 messageId;
    // mapping (address => uint8) public Cards;

    // function CardGet(address user) public {
    //     IHiddenCard _Hiddencard = IHiddenCard(hiddencard);

    //     bytes memory _callback = abi.encodePacked(this.cardReceive.selector, (uint256(uint160(user))));

    //     messageId = IInterchainExecuteRouter(iexRouter).callRemote(
    //         DestinationDomain,
    //         address(_Hiddencard),
    //         0,
    //         abi.encodeCall(_Hiddencard.returnCard, (user)),
    //         _callback
    //     );
    // }

    // function cardReceive(uint256 user, uint8 _card) external {
    //     require(caller_contract == msg.sender, "not right caller contract");
    //     Cards[address(uint160(user))] = _card;
    // }

    // function CardView(address user) public view returns(uint8) {
    //     return Cards[user];
    // }
}