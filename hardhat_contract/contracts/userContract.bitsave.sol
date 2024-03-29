// SPDX-License-Identifier: MIT
pragma solidity >0.6.0;
pragma abicoder v2;

import "hardhat/console.sol";
import "./Bitsave.sol";

// Zetaprotocols
// Zetaprotocols
// import "@zetachain/protocol-contracts/contracts/zevm/interfaces/IZRC20.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/zContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";

// import "@zetachain/zevm-example-contracts/contracts/shared/SwapHelperLib.sol";
import "./utils/BitsaveHelperLib.sol";

contract UserContract {

    // ****--------- DS for user saving contract -----------
    address payable public bitsaveAddress;
    address payable ownerAddress;
    address payable public stableCoin;

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
    mapping (string => SavingDataStruct) public savings;
    struct SavingsNamesObj {
        string[] savingsNames;   
    }

    SavingsNamesObj private savingsNamesVar;
    function addSavingName(string memory _name) private {
        savingsNamesVar.savingsNames.push(_name);
    }

    function getSavingsNames() external view returns(SavingsNamesObj memory) {
        return savingsNamesVar;
    }

    // *****+++++++ DS for user saving contract ++++++++++++

    // *******-------- Security functionalities ------------
    error callNotFromBitsave();

    modifier bitsaveOnly {
        if (msg.sender != bitsaveAddress) revert callNotFromBitsave();
        _;
    }
    // ******+++++++++ Security functionalities ++++++++++++

    constructor(address _ownerAddress, address _stableCoin) payable {
        // save bitsaveAddress first // todo: retrieve correct address
        bitsaveAddress = payable(msg.sender);
        // store owner's address
        ownerAddress = payable(_ownerAddress);
        // store stable coin
        stableCoin = payable(_stableCoin);
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
    ) internal{
      // retrieve token from parent contract
      uint256 currentBalance = address(this).balance;
      retrieveToken(
        bitsaveAddress,
        tokenId,
        amountToRetrieve
      );
      uint256 newBalance = address(this).balance;
      if (currentBalance + amountToRetrieve <= newBalance) revert BitsaveHelperLib.AmountNotEnough();
    }

    function getSavings(string memory nameOfSaving) public view returns (SavingDataStruct memory) {
        return savings[nameOfSaving];
    }

    // functionality to create savings
    function createSaving (
        string memory name,
        uint256 maturityTime,
        uint256 startTime,
        uint8 penaltyPercentage,
        address tokenId,
        uint256 amountToRetrieve,
        bool isSafeMode
    ) public payable bitsaveOnly returns (uint) {
        // ensure saving does not exist; ! todo: this wont work
        if (savings[name].isValid) revert BitsaveHelperLib.InvalidSaving();
        // check if end time valid
        if (maturityTime < startTime) revert BitsaveHelperLib.InvalidTime();
        if (maturityTime < block.timestamp) revert BitsaveHelperLib.InvalidTime();

        // calculate interest
        uint accumulatedInterest = 3; // todo: create interest formulae

        if (isSafeMode) {
            handleTokenRetrieving(
                stableCoin,
                amountToRetrieve
            );
        }else {
            handleTokenRetrieving(
                tokenId,
                amountToRetrieve
            );
        }

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

        addSavingName(name);

        emit BitsaveHelperLib.SavingCreated(
            name,
            amountToRetrieve,
            tokenId
        );

        return 1;
    }

    // functionality to add to savings
    function incrementSaving (
      string memory name,
      uint256 savingPlusAmount
    ) public payable bitsaveOnly returns (uint) {
        SavingDataStruct storage toFundSavings = savings[name];
        if (!toFundSavings.isValid) revert BitsaveHelperLib.InvalidSaving();
        if (block.timestamp > toFundSavings.maturityTime) revert BitsaveHelperLib.InvalidTime();

        // handle retrieving token from contract
        if (toFundSavings.isSafeMode) {
            handleTokenRetrieving(
                stableCoin,
                savingPlusAmount
            );
        }else {
            handleTokenRetrieving(
                toFundSavings.tokenId,
                savingPlusAmount
            );
        }

        // calculate new interest
        uint recalculatedInterest = 1;
        toFundSavings.interestAccumulated = toFundSavings.interestAccumulated + recalculatedInterest;
        toFundSavings.amount = toFundSavings.amount + savingPlusAmount;

        // save new savings data
        savings[name] = toFundSavings;

        emit BitsaveHelperLib.SavingIncremented(
            name,
            savingPlusAmount,
            toFundSavings.amount,
            toFundSavings.tokenId
        );

        return toFundSavings.interestAccumulated;
    }

    function withdrawSaving (string memory name) public payable bitsaveOnly returns (string memory) {
        SavingDataStruct storage toWithdrawSavings = savings[name];
        // check if saving exit
        if (!toWithdrawSavings.isValid) revert BitsaveHelperLib.InvalidSaving();
        uint amountToWithdraw;
        // check if saving is mature
        if (block.timestamp < toWithdrawSavings.maturityTime) {
            // remove penalty from savings
            amountToWithdraw = (toWithdrawSavings.amount * (100 - toWithdrawSavings.penaltyPercentage)) / 100;
            // todo: fn to convert token if not safe mode
        }else {
            // todo: functionality to send csa token as interest
            ownerAddress.transfer(toWithdrawSavings.interestAccumulated);
        }

        // send the savings amount to withdraw
        address tokenId = toWithdrawSavings.tokenId;
        // function can be abstracted for sending token out
        if (toWithdrawSavings.isSafeMode) {
            // approve withdrawal from parent contract
            uint256 actualAmountToWithdraw = BitsaveHelperLib.approveAmount(
              bitsaveAddress,
              amountToWithdraw,
              stableCoin
            );
            // call parent for conversion
            Bitsave bitsave = Bitsave(bitsaveAddress);
            bitsave
                .sendAsOriginalToken(
                    tokenId,
                    actualAmountToWithdraw,
                    ownerAddress
                );
        }else {
            BitsaveHelperLib.transferToken(
                toWithdrawSavings.tokenId,
                ownerAddress,
                amountToWithdraw
            );
        }
        // Delete savings; ensure saving is deleted/made invalid
        savings[name].isValid = false;

        emit BitsaveHelperLib.SavingWithdrawn(
            name
        );

        return "savings withdrawn successfully";
    }

    // Contract Getters
    function getSavingMode(string memory nameOfSaving) view external returns (bool) {
        return savings[nameOfSaving].isSafeMode;
    }

    function getSavingTokenId(string memory nameOfSaving) view external returns (address) {
        return savings[nameOfSaving].tokenId;
    }

    receive() external payable {
        emit BitsaveHelperLib.Received(msg.sender, msg.value);
    }

}
