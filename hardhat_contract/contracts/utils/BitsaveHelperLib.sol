// SPDX-License-Identifier: MIT

pragma solidity = 0.8.7;

library BitsaveHelperLib {

  // Errors
  error WrongGasContract();
  error NotEnoughToPayGasFee();

   function approveAmount(
    address toApproveUserAddress,
    uint256 amountToApprove,
    address targetToken
  ) internal view returns (uint256) {
    (address gasZRC20, uint256 gasFee) = IZRC20(targetToken)
      .withdrawGasFee();

      if (gasZRC20 != targetZRC20) revert WrongGasContract();
      if (gasFee >= amount) revert NotEnoughToPayGasFee();

      uint256 actualSaving = amountToApprove - gasFee;

      IZRC20(targetZRC20).approve(targetZRC20, gasFee);
      IZRC20(targetZRC20).approve(toApproveUserAddress, actualSaving);
      return actualSaving;
  }
}

