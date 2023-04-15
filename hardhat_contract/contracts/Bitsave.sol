// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;


contract Bitsave is ZContract {
  // *********++++++ Storage +++++++********

  // ****Contract params****
  // router02 address
  address _router02;
  address _usdc;
  // ** Contract params **

  address[] usersAddresses;
  // mapping of userAddress to their child contract address
  mapping (address => address) addressToUserBS;

  // *********------ Storage -------********

  constructor(address router02, address usdc) {
    // All constructor functions
    _router02 = router02;
    _usdc = usdc;
  }

  function crossChainSwap (
    address targetToken,
    uint amountToSwap
  ) internal {
    // receive the amount to swap
    // convert the token to targetToken
    // return amount swapped for
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
    uint amountToSave = msg.value();
    // functionality for creating savings
    if (!safeMode) {
      amountToSave = crossChainSwap(
        _usdc,
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

