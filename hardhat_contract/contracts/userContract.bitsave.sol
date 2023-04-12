// SPDX-License-Identifier: MIT
pragma solidity >=^0.5.4 <= ^0.8.4;

contract UserContract {

    // ****--------- DS for user saving contract -----------
    address bitsaveAddress;
    address ownerAddress;

    // structure of saving data
    struct SavingDataStruct {
        uint256 amount;
        uint tokenId;
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

    // functionality to create savings
    // returns: uint interest accumulated
    function createSavings(
        memory string name,
        uint endTime
    ) public payable bitsaveOnly returns (uint) {
        uint startTime = block.timestamp;
        // check if end time valid
        require(endTime > startTime, "Maturity time of saving must be in the future!");

        // calculate interest
        uint accumulatedInterest = 3; // todo: create interest formulae

        SavingDataStruct saving = SavingDataStruct({
            amount : msg.value,
            endTime : endTime,
            interestAccumulated : accumulatedInterest,
            startTime : startTime,
            tokenId : 0
        });

        // store saving to map of savings
        savings[name] = saving;
        return saving.interestAccumulated;
    }

    function addToSavings () public payable bitsaveOnly returns (uint) {
        return 3;
    }

    function withdrawSavings () public bitsaveOnly returns (uint) {

        return 3;
    }
}
