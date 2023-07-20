// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

// Uniswap

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "./userContract.bitsave.sol";


import "hardhat/console.sol";

//// Zetaprotocols
//import "@zetachain/protocol-contracts/contracts/zevm/interfaces/IZRC20.sol";
//import "@zetachain/protocol-contracts/contracts/zevm/interfaces/zContract.sol";
//import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";

import "@zetachain/zevm-example-contracts/contracts/shared/SwapHelperLib.sol" as SH;
import "./utils/BytesHelperLib.sol";
import "./utils/BitsaveHelperLib.sol";


/// @title Bitsave protocol parent contract
/// @author xpanvictor
/// @notice this contract can be interacted with from user
/// @custom:test This is a test contract
contract Bitsave is zContract {

  // *********++++++ Storage +++++++********

  // ****Contract params****
  // router02 address
  SystemContract public immutable systemContract;
  //  address public router02;
  address public stableCoin;
  //  ISwapRouter public immutable swapRouter;
  uint24 public constant poolFee = 3000;
  // ** Contract params **

  address[] usersAddresses;
  // mapping of userAddress to their child contract address
  mapping (address => address) addressToUserBS;

  // *********------ Storage -------********

  // ********++++++ Security +++++++********

  modifier registeredOnly {
    if (addressToUserBS[msg.sender] == address(0x0)) revert BitsaveHelperLib.UserNotRegistered();
    _;
  }

  // ********------ Security -------********

  // ********------ Constants ------********
  string public constant JON = "JON";
  string public constant CRT = "CRT";
  string public constant INC = "INC";
  string public constant WTD = "WTD";
  // ********++++++ Constants ++++++********

  // ********------ Subcontract ----********
  UserContract userChildContract;
  // ********++++++ Subcontract ++++********

  constructor(
    address _stableCoin,
    address systemContractAddress
  ) payable {
    // All constructor functions
    stableCoin = _stableCoin;
    systemContract = SystemContract(systemContractAddress);
  }

  function getStableCoin() public view returns(address) {
    return stableCoin;
  }

  function retrieveAmount(
    address tokenToRetrieve,
    uint amountToRetrieve
  ) internal {
    /// -------token amount already approved from user
    /// -------retrieveAmount from sender
    IZRC20(tokenToRetrieve).transferFrom(msg.sender, address(this), amountToRetrieve);
  }

  /// -------------------------------------------------------------
  /// Message definition
  ///  Address incoming
  ///  Amount sent of token
  ///  Encoded message:
  ///  - Opcode
  ///  - Saving data per Opcode
  ///  - Token data
  ///    Opcodes:
  ///    - Management utility
  ///      JON -> Join Bitsave
  ///    - Saving utility
  ///      CRT -> Create a saving
  ///      INC -> Increment a saving
  ///      WTD -> Withdraw a saving
  /// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  function onCrossChainCall (
    address zrc20,
    uint256 amount,
    bytes calldata message
  ) external override{

    (
      bytes memory Opcode,
      // saving data,
      string memory nameOfSaving,
      uint256 maturityTime,
      uint256 startTime,
      uint8 penaltyPercentage,
      bool safeMode
      // token data
    ) = abi.decode(
      message,
      (
        bytes,
        string,
        uint256,
        uint256,
        uint8,
        bool
      )
    );

//    // retrieve coin used from owner address
    retrieveAmount(zrc20, amount);

    // todo: get the token data from msg.value
    if (BytesHelperLib.compareStrings(Opcode, JON)) {
      // utility to join bitsave
      joinBitsave(
        amount
      );
    }else if (BytesHelperLib.compareStrings(Opcode, CRT)) {
      // Call create functionality
      createSaving(
        nameOfSaving,
        maturityTime,
        startTime,
        penaltyPercentage,
        safeMode,
        zrc20,
        amount
      );
    }else if (BytesHelperLib.compareStrings(Opcode, INC)) {
      // Call incrementSaving functionality
      incrementSaving(
        nameOfSaving,
        zrc20,
        amount
      );
    }else {
      // Call the withdraw functionality
      withdrawSaving(
        nameOfSaving
      );
    }
  }

  // todo: converting this function using the zeta helper module
  function crossChainSwap (
    address inputToken,
    address targetToken,
    uint amountToSwap
  ) internal returns (uint){

    BitsaveHelperLib.approveAmount(
      systemContract.wZetaContractAddress(),
      amountToSwap,
      inputToken
    );

    // todo: use the SwapHelperLib for this instead
    uint256 outputAmount = SH.SwapHelperLib._doSwap(
      systemContract.wZetaContractAddress(),
      systemContract.uniswapv2FactoryAddress(),
      systemContract.uniswapv2Router02Address(),
      inputToken,
      amountToSwap,
      targetToken,
      0
    );
    bytes32 thisAddress = BytesHelperLib.addressToBytes(address(this));
    SH.SwapHelperLib._doWithdrawal(
      targetToken,
      outputAmount,
      bytes32(thisAddress) // todo: can pay directly
    );
    return outputAmount;
  }

  function sendAsOriginalToken(
    address originalToken,
    uint amount,
    address ownerAddress
  ) public payable {
    // check amount sent
    if(amount < poolFee) revert BitsaveHelperLib.AmountNotEnough();
    // retrieve stable coin used from owner address
    retrieveAmount(stableCoin, amount);
    // convert to original token using crossChainSwap()
    uint256 outputAmount = crossChainSwap(stableCoin, originalToken, amount);
    // send to owner address directly
    // IERC20(originalToken).transfer(ownerAddress, amount);
    IZRC20(originalToken).transfer(ownerAddress, outputAmount);
  }

  // the join bitsave functionality implementation, charges and co
  function joinBitsave(uint256 joining_fee) public payable returns (address) {
    // todo ------------------ Please fix me soon
    uint256 JoinLimitFee = 10000;
    if (joining_fee <= JoinLimitFee) revert BitsaveHelperLib.AmountNotEnough(); // todo: work on price
    // deploy child contract for user
    address userBSAddress = address(new UserContract(msg.sender, stableCoin));
    addressToUserBS[msg.sender] = userBSAddress;
    return userBSAddress;
  }

  function getUserChildContractAddress() public view returns (address payable) {
    return payable(addressToUserBS[msg.sender]);
  }

  ///
  /// createSaving
  ///
  ///   Pay the amount to save to this function // todo: check for minimum value
  ///
  ///   string nameOfSaving,
  ///   uint256 timestamp of when savings should end
  ///   uint8 value of penalty percentage btwn 1-10
  ///   bool true for safe mode saving, false for risk mode
  ///
  function createSaving(
    string memory nameOfSaving,
    uint256 maturityTime,
    uint256 startTime,
    uint8 penaltyPercentage,
    // safe/risk mode
    bool safeMode,
    address tokenToSave,
    uint amount
  ) internal registeredOnly {
    if (block.timestamp > maturityTime) revert BitsaveHelperLib.InvalidTime();

    address savingToken = tokenToSave;
    // uint amountOfWeiSent;
    uint amountToSave = amount;

    // functionality for creating savings
    if (safeMode) {
      amountToSave = crossChainSwap(
        savingToken,
        stableCoin,
        amount
      );
      savingToken = stableCoin;
    }
    // Initialize user child contract
    address payable userChildContractAddress = getUserChildContractAddress();
    userChildContract = UserContract(userChildContractAddress);

    /// call create savings for child contract
    /// move funds and call contract with it
    uint actualSaving = BitsaveHelperLib.approveAmount(
      userChildContractAddress,
      amountToSave,
      savingToken
    );

    userChildContract.createSaving(
      nameOfSaving,
      maturityTime,
      startTime,
      penaltyPercentage,
      tokenToSave,
      actualSaving,
      safeMode
    );
  }

  ///
  ///
  ///    the amount to add to saving
  ///
  ///    string nameOfSaving
  ///
  function incrementSaving (
    string memory nameOfSavings,
    address tokenToRetrieve,
    uint256 amount
  ) internal registeredOnly {
    // initialize userChildContract
    address payable userChildContractAddress = payable(addressToUserBS[msg.sender]);
    userChildContract = UserContract(userChildContractAddress);
    // todo: perform amount conversion and everything
    uint savingPlusAmount = amount;
    // todo: check savings detail by reading the storage of userChildContract
    bool isSafeMode = userChildContract.getSavingMode(nameOfSavings);
    if (isSafeMode) {
      savingPlusAmount = crossChainSwap(
        userChildContract.getSavingTokenId(nameOfSavings),
        stableCoin,
        savingPlusAmount
      );
    }
    // call withdrawSavings
    uint actualSaving = BitsaveHelperLib.approveAmount(
      userChildContractAddress,
      savingPlusAmount,
      tokenToRetrieve
    );
    userChildContract.incrementSaving(
      nameOfSavings,
      actualSaving
    );
  }

  ///
  ///
  ///    string nameOfSaving
  ///
  function withdrawSaving(
    string memory nameOfSavings
  ) public registeredOnly returns (bool) {
    // initialize user's child userChildContract
    userChildContract = UserContract(payable(addressToUserBS[msg.sender]));
    // call withdraw savings fn
    userChildContract.withdrawSaving(nameOfSavings);
    return true;
  }

  receive() external payable {
    emit BitsaveHelperLib.Received(msg.sender, msg.value);
  }

}
