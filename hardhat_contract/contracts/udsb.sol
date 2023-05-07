
// SPDX-License-Identifier: MIT
pragma solidity >=0.7.5;

// todo: get zrc contract
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UDSK is ERC20 {
    constructor() ERC20("USD Bitsave", "USDB") {
        _mint(msg.sender, 20 * 10 ** 18);
    }
}
