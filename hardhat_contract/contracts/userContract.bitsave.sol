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
        uint penaltyPercentage;
        uint256 maturityTime;
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
    function createSavings (
        string memory name,
        uint maturityTime,
        uint penaltyPercentage,
        uint tokenId
    ) public payable bitsaveOnly returns (uint) {
        uint startTime = block.timestamp;
        // ensure saving does not exist
        require(!savings[name], "Savings exist already");
        // check if end time valid
        require(maturityTime > startTime, "Maturity time of saving must be in the future!");

        // calculate interest
        uint accumulatedInterest = 3; // todo: create interest formulae

        SavingDataStruct saving = SavingDataStruct({
            amount : msg.value,
            maturityTime : maturityTime,
            interestAccumulated : accumulatedInterest,
            startTime : startTime,
            tokenId : tokenId,
            penaltyPercentage : penaltyPercentage
        });

        // store saving to map of savings
        savings[name] = saving;
        return saving.interestAccumulated;
    }

    // functionality to add to savings
    // returns: uint interest accumulated
    function addToSavings (string memory name) public payable bitsaveOnly returns (uint) {
        SavingDataStruct toFundSavings = savings[name];
        require(toFundSavings, "Saving to fund does not exist");
        require(block.timestamp > toFundSavings.maturityTime, "Sorry, saving has ended");

        // calculate new interest
        uint recalculatedInterest = 1;
        toFundSavings.interestAccumulated = toFundSavings.interestAccumulated + recalculatedInterest;
        toFundSavings.amount = toFundSavings.amount + msg.value;

        // save new savings data
        savings[name] = toFundSavings;
        return toFundSavings.interestAccumulated;
    }

    function withdrawSavings (string memory name) public bitsaveOnly returns (string memory) {
        SavingDataStruct toWithdrawSavings = savings[name];
        // check if saving exit
        require(toWithdrawSavings, "Saving to withdraw does not exist");
        uint amountToWithdraw;
        // check if saving is mature
        if (block.timestamp < toWithdrawSavings.maturityTime) {
            // remove penalty from savings
            amountToWithdraw = toWithdrawSavings.amount * (1 - toWithdrawSavings.penaltyPercentage);
            // todo: fn to convert token if not safe mode
        }else {
            // todo: functionality to send csa token as interest
            ownerAddress.transfer(toWithdrawSavings.interestAccumulated);
        }

        // send the savings amount to withdraw
        ownerAddress.transfer(amountToWithdraw);
        // todo: Delete savings
        return "savings withdrawn successfully";
    }
}
