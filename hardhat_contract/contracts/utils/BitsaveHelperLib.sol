// SPDX-License-Identifier: MIT

pragma solidity = 0.8.7;
import "@zetachain/zevm-protocol-contracts/contracts/interfaces/IZRC20.sol";

library BitsaveHelperLib {

  // Errors
  error WrongGasContract();
  error NotEnoughToPayGasFee();

   function approveAmount(
    address toApproveUserAddress,
    uint256 amountToApprove,
    address targetToken
  ) internal returns (uint256) {
    (address gasZRC20, uint256 gasFee) = IZRC20(targetToken)
      .withdrawGasFee();

      if (gasZRC20 != targetToken) revert WrongGasContract();
      if (gasFee >= amountToApprove) revert NotEnoughToPayGasFee();

      uint256 actualSaving = amountToApprove - gasFee;

      IZRC20(targetToken).approve(targetToken, gasFee);
      IZRC20(targetToken).approve(toApproveUserAddress, actualSaving);
      return actualSaving;
  }
}

// // receive the amount to swap
// // Approve the router to spend the inputToken
// TransferHelper.safeApprove(inputToken, address(swapRouter), amountToSwap);
// // convert the token to targetToken by deriving parameters
// ISwapRouter.ExactInputSingleParams memory params =
// ISwapRouter.ExactInputSingleParams({
//   tokenIn: inputToken,
//   tokenOut: targetToken,
//   fee: poolFee,
//   recipient: address(this),
//   deadline: block.timestamp,
//   amountIn: amountToSwap,
//   amountOutMinimum: 0, // todo: get this from an oracle
//   sqrtPriceLimitX96: 0
// });
// // swap and return amount swapped for
// uint amountSwapped = swapRouter.exactInputSingle(params);
// return amountSwapped;

// function approveAmount(
//   address childContractAddress,
//   uint256 amountToApprove,
//   address targetToken
// ) internal view return(uint256) {
//   (address gasZRC20, uint256 gasFee) = IZRC20(targetToken)
//     .withdrawGasFee();
//
//     if (gasZRC20 != targetZRC20) revert WrongGasContract();
//     if (gasFee >= amount) revert NotEnoughToPayGasFee();
//
//     uint256 actualSaving = amountToApprove - gasFee;
//
//     IZRC20(targetZRC20).approve(targetZRC20, gasFee);
//     IZRC20(targetZRC20).approve(childContractAddress, actualSaving);
//     return actualSaving;
// }

