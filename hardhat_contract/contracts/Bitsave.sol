// SPDX-License-Identifier: MIT
pragma solidity >=0.7.5;
pragma abicoder v2;

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
    require(addressToUserBS[msg.sender] != address(0x0), "User not registered to bitsave!");
    _;
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

  function getSwapRouter() public returns(ISwapRouter) {
    return swapRouter;
  }

  function getstableCoin() public returns(address) {
    return usdc;
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
    ISwapRouter.ExactInputSingleParams({
      tokenIn: inputToken,
      tokenOut: targetToken,
      fee: poolFee,
      recipient: address(this),
      deadline: block.timestamp,
      amountIn: amountToSwap,
      amountOutMinimum: 0, // todo: get this from an oracle
      sqrtPriceLimitX96: 0
    });
    // swap and return amount swapped for
    uint amountSwapped = swapRouter.exactInputSingle(params);
    return amountSwapped;
  }

  // the join bitsave functionality implementation, charges and co
  function joinBitsave() public payable returns (address) {
    require(msg.value > 10000, "Incomplete bitsave fee"); // todo: encapsulate
    // deploy child contract for user
    address userBSAddress = address(new UserContract{value: 1000}());
    addressToUserBS[msg.sender] = userBSAddress;
    return userBSAddress;
  }

  function getUserChildContractAddress() public returns (address) {
    return addressToUserBS[msg.sender];
  }

  // /*
  // createSaving
  // @payable
  //   Pay the amount to save to this function // todo: check for minimum value
  // @param:
  //   string nameOfSaving,
  //   uint256 timestamp of when savings should end
  //   uint8 value of penalty percentage btwn 1-10
  //   bool true for safe mode saving, false for risk mode
  // */
  function createSaving(
    string memory nameOfSaving,
    uint256 maturityTime, // todo: add ft to check minimum time diff
    uint8 penaltyPercentage,
    // safe/risk mode
    bool safeMode,
    address tokenToSave, // todo: abstract away from code
    uint amountToSave // necessary if saving is not native token
  ) public payable registeredOnly {

    // first approve contract usage and remove of amount of token
//    IERC20(tokenToSave).approve(address(this), amountToSave);
//    IERC20(tokenToSave).transferFrom(msg.sender, address(this), amountToSave);
    // ? if to save native token, need to send instead

    address savingToken;
    uint amountOfWeiSent = msg.value;
    // functionality for creating savings
    if (safeMode) {
      amountToSave = crossChainSwap(
        savingToken,
        usdc,
        amountToSave
      );
    }
    // Initialize user child contract
    userChildContract = UserContract(addressToUserBS[msg.sender]);
    // todo: pay txn
    // call create savings for child contract
    userChildContract.createSavings{value: amountToSave}(
      nameOfSaving,
      maturityTime,
      penaltyPercentage,
      savingToken,
      safeMode
    );
  }

  function addToSavings(string memory nameOfSavings) public payable {
    // todo: handle saving in token
    // initialize userChildContract
    userChildContract = UserContract(addressToUserBS[msg.sender]);
    // todo: perform amount conversion and everything
    uint savingPlusAmount = msg.value;
    // todo: check savings detail by reading the storage of userChildContract
    bool isSafeMode = userChildContract.getSavingMode(nameOfSavings);
    if (isSafeMode) {
      savingPlusAmount = crossChainSwap(
        userChildContract.getSavingTokenId(nameOfSavings),
        usdc,
        savingPlusAmount
      );
    }
    // call withdrawSavings
    userChildContract.addToSavings{value: savingPlusAmount}(nameOfSavings);
  }

  function withdrawSavings(
    string memory nameOfSavings
  ) public registeredOnly returns (bool) {
    // initialize user's child userChildContract
    userChildContract = UserContract(addressToUserBS[msg.sender]);
    // call withdraw savings fn
    userChildContract.withdrawSavings(nameOfSavings);
    return true;
  }

}