// SPDX-License-Identifier: MIT
pragma solidity >=^0.5.4 <= ^0.8.4;

contract UserContract {

    // ****--------- DS for user saving contract -----------
    address bitsaveAddress;
    address ownerAddress;

    // structure of saving data
    struct SavingDataStruct {
        uint256 amount;
        uint256 interestAccumulated;
        uint256 startTime;
        uint256 endTime;
    }

    // mapping of name of saving to individual saving
    mapping (string => SavingDataStruct) savings;

    // *****+++++++ DS for user saving contract ++++++++++++

    // *******-------- Security functionalities ------------
    modifier bitsaveOnly {
        require(msg.sender == bitsaveAddress, "Functionality can only be called by Bitsave protocol.");
        _;
    }
    // ******+++++++++ Security functionalities ++++++++++++

    constructor() {
        // save bitsaveAddress first // todo: retrieve correct address
        bitsaveAddress = msg.sender;
        // store owner's address
        ownerAddress = msg.sender;
    }

    function createSavings () public payable bitsaveOnly returns (string memory) {
        return "saving A created";
    }

    function addToSavings () public payable bitsaveOnly returns (uint) {
        return 3;
    }

    function withdrawSavings () public bitsaveOnly returns (uint) {

        return 3;
    }
}
