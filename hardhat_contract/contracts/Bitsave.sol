// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

// Uniswap
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";


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

  function joinBitsave() public payable {
    // deploy child contract for user
    address userBSAddress;
    addressToUserBS[msg.sender] = userBSAddress;
  }

  function createSavings(
    // safe/risk mode
    bool safeMode
  ) public payable returns (uint) {

    address inputToken;

    uint amountToSave = msg.value();
    // functionality for creating savings
    if (!safeMode) {
      amountToSave = crossChainSwap(
        inputToken,
        usdc,
        amountToSave
      );
    }
    return 3;
  }

  function withdrawSavings(
  ) public returns (bool) {
    return true;
  }

}

