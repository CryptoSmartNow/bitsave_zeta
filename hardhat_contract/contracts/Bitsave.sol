// SPDX-License-Identifier: MIT
pragma solidity >=0.7.5;
pragma abicoder v2;

// Uniswap
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "./userContract.bitsave.sol";

import "hardhat/console.sol";

// Zetaprotocols
import "@zetachain/zevm-protocol-contracts/contracts/interfaces/IZRC20.sol";
import "@zetachain/zevm-protocol-contracts/contracts/system/SystemContract.sol";
import "@zetachain/zevm-protocol-contracts/contracts/interfaces/zContract.sol";

import "@zetachain/zevm-example-contracts/contracts/shared/SwapHelperLib.sol";

// Make interface work with zContract
// Use the swap SwapHelperLib
// Employ the interface for ZRC 
// Introduce the swap into userChildContract
// Complete the swap from child contract 
// Finish the functionality with swap
// Try testing
// Deploy and Finish
// May the forces be with you


contract Bitsave is zContract {

  // Errors
  error WrongGasContract();
  error NotEnoughToPayGasFee();

  // *********++++++ Storage +++++++********

  // ****Contract params****
  // router02 address
  SystemContract public immutable systemContract;
  address public router02;
  address public stableCoin;
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

  constructor(
    ISwapRouter _swapRouter,
    address _router02,
    address _stableCoin,
    address systemContractAddress
  ) payable {
    // All constructor functions
    swapRouter = _swapRouter;
    router02 = _router02;
    stableCoin = _stableCoin;
    systemContract = SystemContract(systemContractAddress);
  }

  function getSwapRouter() public view returns(ISwapRouter) {
    return swapRouter;
  }

  function getStableCoin() public view returns(address) {
    return stableCoin;
  }

  function retrieveAmount(
    address tokenToRetrieve,
    uint amountToRetrieve
  ) internal {
    // -------approve amount from user
//    IERC20(tokenToRetrieve).approve(msg.sender, amountToRetrieve);
    IZRC20(tokenToRetrieve).approve(msg.sender, amountToRetrieve);
    // -------retrieveAmount from sender
//    IERC20(tokenToRetrieve).transferFrom(msg.sender, address(this), amountToRetrieve);
    IZRC20(tokenToRetrieve).transferFrom(msg.sender, address(this), amountToRetrieve);
  }

  // todo: contract route definition
  function onCrossChainCall (
    address zrc20,
    uint256 amount,
    bytes calldata message
  ) external{
    () = abi.decode(message);
  }

  // todo: converting this function using the zeta helper module
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

  function sendAsOriginalToken(
    address originalToken,
    uint amount,
    address ownerAddress
  ) public payable {
    // check amount sent
    require(amount > poolFee, "Amount to convert not enough");
    // retrieve stable coin used from owner address
    retrieveAmount(stableCoin, amount);
    // convert to original token using crossChainSwap()
    crossChainSwap(stableCoin, originalToken, amount);
    // send to owner address directly
//    IERC20(originalToken).transfer(ownerAddress, amount);
    IZRC20(originalToken).transfer(ownerAddress, amount);
  }

  // the join bitsave functionality implementation, charges and co
  function joinBitsave() public payable returns (address) {
    require(msg.value >= 10000, "Incomplete bitsave fee"); // todo: encapsulate
    // deploy child contract for user
    address userBSAddress = address(new UserContract{value: 1000}());
    addressToUserBS[msg.sender] = userBSAddress;
    return userBSAddress;
  }

  function getUserChildContractAddress() public view returns (address) {
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
    uint amount // necessary if saving is not native token
  ) public payable registeredOnly {
    require(block.timestamp < maturityTime, "Maturity time exceeded/invalid");

    address savingToken;
//    uint amountOfWeiSent;
    uint amountToSave;
    // check if saving in native token
    if(tokenToSave == address(0)) {
      amountToSave = msg.value;
    }else {
      amountToSave = amount;
      // using utility fn to transfer token from user
      retrieveAmount(tokenToSave, amountToSave);
    }
    // functionality for creating savings
    if (safeMode) {
      amountToSave = crossChainSwap(
        savingToken,
        stableCoin,
        amountToSave
      );
    }
    // Initialize user child contract
    address userChildContractAddress = getUserChildContractAddress();
    userChildContract = UserContract(userChildContractAddress);

    // call create savings for child contract
    userChildContract.createSaving{value: amountToSave}(
      nameOfSaving,
      maturityTime,
      penaltyPercentage,
      savingToken,
      safeMode
    );
  }

  //  /*
  //  @payable
  //    the amount to add to saving
  //  @param:
  //    string nameOfSaving
  //  */
  function incrementSaving(string memory nameOfSavings) public payable registeredOnly {
    // todo: handle saving in token
    retrieveAmount(); // todo: structure this function
    // initialize userChildContract
    userChildContract = UserContract(addressToUserBS[msg.sender]);
    // todo: perform amount conversion and everything
    uint savingPlusAmount = msg.value;
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
    userChildContract.incrementSaving{value: savingPlusAmount}(nameOfSavings);
  }

  //
  // @param:
  //    string nameOfSaving
  //
  function withdrawSaving(
    string memory nameOfSavings
  ) public registeredOnly returns (bool) {
    // initialize user's child userChildContract
    userChildContract = UserContract(addressToUserBS[msg.sender]);
    // call withdraw savings fn
    userChildContract.withdrawSaving(nameOfSavings);
    return true;
  }

}
