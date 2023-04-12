// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;


contract Bitsave {
  // *********++++++ Storage +++++++********
  address[] usersAddresses;
  // mapping of userAddress to their child contract address
  mapping (address => address) addressToUserBS;
  // *********------ Storage -------********

  constructor() {
  // All constructor functions
  }

  function joinBitsave() public payable {
    // deploy child contract for user
    address userBSAddress = 0x;
    addressToUserBS[msg.sender] = userBSAddress;
  }

  function createSavings(
  ) public returns (uint) {
    // functionality for creating savings
    return 3;
  }

  function withdrawSavings(
  ) public returns (bool) {
    return true;
  }

}

