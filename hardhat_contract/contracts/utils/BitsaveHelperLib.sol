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
  ) internal view returns (uint256) {
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

