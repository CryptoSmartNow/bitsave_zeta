// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

// Uniswap
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "./userContract.bitsave.sol";


contract Bitsave {
  // *********++++++ Storage +++++++********

  // ****Contract params****
  // router02 address
  address router02;
  address usdc;
  ISwapRouter public immutable swapRouter;
  uint24 public constant poolFee = 3000;
  // ** Contract params **

  address[] usersAddresses;
  // mapping of userAddress to their child contract address
  mapping (address => address) addressToUserBS;

  // *********------ Storage -------********

  // ********++++++ Security +++++++********

  modifier registeredOnly {
    require(addressToUserBS[msg.sender] != 0, "User not registered to bitsave!");
  }

  // ********------ Security -------********

  // ********------ Subcontract ----********
  UserContract userChildContract;
  // ********++++++ Subcontract ++++********

  constructor(ISwapRouter _swapRouter, address _router02, address _usdc) {
    // All constructor functions
    swapRouter = _swapRouter;
    router02 = _router02;
    usdc = _usdc;
  }

  function crossChainSwap (
    address inputToken,
    address targetToken,
    uint amountToSwap
  ) internal returns (uint){
    // receive the amount to swap
    // Approve the router to spend the inputToken
    TransferHelper.safeApprove(inputToken, address(swapRouter), amountToSwap);
    // convert the token to targetToken by deriving parameters
    ISwapRouter.ExactInputSingleParams memory params =
    ISwapRouter.exactInputSingle({
      tokenIn: inputToken,
      tokenOut: targetToken,
      fee: poolFee,
      recipient: address(this),
      deadline: block.timestamp,
      amountIn: amountToSwap,
      amountOutMinimum: 0, // todo: work on this
      sqrtPriceLimitX96: 0
    });
    // swap and return amount swapped for
    return swapRouter.exactInputSingle(params);
  }

  // todo: the join bitsave functionality implementation, charges and co
  function joinBitsave() public payable {
    // deploy child contract for user
    address userBSAddress;
    addressToUserBS[msg.sender] = userBSAddress;
  }

  //  /*
  //  createSaving
  //  @payable
  //    Pay the amount to save to this function // todo: check for minimum value
  //  @param:
  //    string nameOfSaving,
  //    uint256 timestamp of when savings should end
  //    uint8 value of penalty percentage btwn 1-10
  //    bool true for safe mode saving, false for risk mode
  //  */
  function createSaving(
    string memory nameOfSaving,
    uint256 maturityTime, // todo: add ft to check minimum time diff
    uint8 penaltyPercentage,
    // safe/risk mode
    bool safeMode
  ) public payable registeredOnly returns (uint) {

    address savingToken;

    uint amountToSave = msg.value();
    // functionality for creating savings
    if (safeMode) {
      amountToSave = crossChainSwap(
        savingToken,
        usdc,
        amountToSave
      );
      savingToken = usdc;
    }
    // Initialize user child contract
    UserContract userChildContract = UserContract(addressToUserBS[msg.sender]);
    // todo: pay txn
    // call create savings for child contract
    userChildContract.createSavings(
      nameOfSaving,
      maturityTime,
      penaltyPercentage,
      savingToken
    );

    return 3;
  }

  function withdrawSavings(
    string memory nameOfSavings
  ) public registeredOnly returns (bool) {
    // initialize user's child userChildContract
    UserContract userChildContract = UserContract(addressToUserBS[msg.sender]);
    // call withdraw savings fn
    userChildContract.withdrawSavings(nameOfSavings);
    return true;
  }

}

