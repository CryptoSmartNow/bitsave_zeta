// SPDX-License-Identifier: MIT
pragma solidity >0.6.0;
pragma abicoder v2;

import "hardhat/console.sol";
import "./Bitsave.sol";

// Zetaprotocols
import "@zetachain/zevm-protocol-contracts/contracts/interfaces/IZRC20.sol";
import "@zetachain/zevm-protocol-contracts/contracts/system/SystemContract.sol";
import "@zetachain/zevm-protocol-contracts/contracts/interfaces/zContract.sol";

import "@zetachain/zevm-example-contracts/contracts/shared/SwapHelperLib.sol";

contract UserContract {

    // ****--------- DS for user saving contract -----------
    address public bitsaveAddress;
    address payable ownerAddress;

    // structure of saving data
    struct SavingDataStruct {
        bool isValid;
        uint256 amount;
        address tokenId;
        uint256 interestAccumulated;
        uint256 startTime;
        uint penaltyPercentage;
        uint256 maturityTime;
        bool isSafeMode;
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

    constructor() payable {
        // save bitsaveAddress first // todo: retrieve correct address
        bitsaveAddress = msg.sender;
        // store owner's address
        ownerAddress = msg.sender;
    }

    function transferToken(
        address token,
        address recipient, uint amount) internal {
//        IERC20(token).transfer(recipient, amount);
        IZRC20(token).transfer(recipient, amount);
    }

    function retrieveToken(
        address toRetrieveFrom,
        address tokenToRetrieve,
        uint amount
    ) internal {
        address thisAddress = address(this);
        IZRC20(tokenToRetrieve).transferFrom(
          toRetrieveFrom,
          thisAddress,
          amount
        );
    }
    
    function handleTokenRetrieving(
      address tokenId,
      uint amountToRetrieve
    ) internal pure{
      // retrieve token from parent contract
      uint256 currentBalance = address(this).balance;
      retrieveToken(
        bitsaveAddress,
        tokenId,
        amountToRetrieve
      );
      uint256 newBalance = address(this).balance;
      require(currentBalance + amountToRetrieve <= newBalance, "Saving not withdrawn correctly");
    }

    function getSavings(string memory nameOfSaving) public view returns (SavingDataStruct memory) {
        return savings[nameOfSaving];
    }

    // functionality to create savings
    // returns: uint interest accumulated
    function createSaving (
        string memory name,
        uint256 maturityTime,
        uint8 penaltyPercentage,
        address tokenId,
        uint256 amountToRetrieve,
        bool isSafeMode
    ) public payable bitsaveOnly returns (uint) {
        uint startTime = block.timestamp;
        // ensure saving does not exist; ! todo: this wont work
        require(!savings[name].isValid, "Saving exists already");
        // check if end time valid
        require(maturityTime > startTime, "Maturity time of saving must be in the future!");

        // calculate interest
        uint accumulatedInterest = 3; // todo: create interest formulae

        handleTokenRetrieving(
          tokenId,
          amountToRetrieve
        );
        
        // store saving to map of savings
        savings[name] = SavingDataStruct({
            amount : amountToRetrieve,
            maturityTime : maturityTime,
            interestAccumulated : accumulatedInterest,
            startTime : startTime,
            tokenId : tokenId,
            penaltyPercentage : penaltyPercentage,
            isSafeMode : isSafeMode,
            isValid : true
        });
        return 1;
    }

    // functionality to add to savings
    // returns: uint interest accumulated
    function incrementSaving (
      string memory name,
      uint256 savingPlusAmount
    ) public payable bitsaveOnly returns (uint) {
        SavingDataStruct storage toFundSavings = savings[name];
        require(toFundSavings.isValid, "Saving to fund does not exist");
        require(block.timestamp > toFundSavings.maturityTime, "Sorry, saving has ended");

        // handle retrieving token from contract
        handleTokenRetrieving(
          tokenId,
          savingPlusAmount
        );

        // calculate new interest
        uint recalculatedInterest = 1;
        toFundSavings.interestAccumulated = toFundSavings.interestAccumulated + recalculatedInterest;
        toFundSavings.amount = toFundSavings.amount + savingPlusAmount;

        // save new savings data
        savings[name] = toFundSavings;
        return toFundSavings.interestAccumulated;
    }

    function withdrawSaving (string memory name) public payable bitsaveOnly returns (string memory) {
        SavingDataStruct storage toWithdrawSavings = savings[name];
        // check if saving exit
        require(toWithdrawSavings.isValid, "Saving to withdraw does not exist");
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
        address tokenId = toWithdrawSavings.tokenId;
        ownerAddress.transfer(amountToWithdraw); // todo: use this only for native saving
        if (toWithdrawSavings.isSafeMode) {
            // call parent for conversion
            Bitsave bitsave = Bitsave(bitsaveAddress);
            bitsave
                .sendAsOriginalToken(
                    toWithdrawSavings.tokenId,
                    amountToWithdraw,
                    ownerAddress
                );
        }else {
            transferToken(
                toWithdrawSavings.tokenId,
                ownerAddress,
                amountToWithdraw
            );
        }
        // Delete savings; todo: ensure saving is deleted
        savings[name].isValid = false;
        delete savings[name]; // todo: can't delete so make invalid
        return "savings withdrawn successfully";
    }

    // Contract Getters
    function getSavingMode(string memory nameOfSaving) view external returns (bool) {
        return savings[nameOfSaving].isSafeMode;
    }

    function getSavingTokenId(string memory nameOfSaving) view external returns (address) {
        return savings[nameOfSaving].tokenId;
    }

}
