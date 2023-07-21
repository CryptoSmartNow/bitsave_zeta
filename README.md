### Documentation

## Constants
- bitsaveAddress => `0x6e299956270c355aAe829c2aaB435b2e81E5B5f6`
- paymentTokenAddress => `0x91d18e54DAf4F677cB28167158d6dd21F6aB3921`
- parsedJoiningFee => `parseUnits("100")`

# Project interface

All interaction with the contract passes through the `onCrossChainCall` method.
After gaining the Contract object using whatever tool e.g. ethersjs,
You can name the Contract object as `Bitsave`, format example with ethersjs.
```js
new ethers.Contract(
    bitsaveAddress,
    BitsaveABI,
    signer // from the user's wallet
)
```
You also create the Payment Token Contract object, can name as `PaymentToken`.
You also create the User Child Contract object, can name as `UserChildContract`.

All ABIs have been provided already, sources include
1. BitsaveABI => `hardhat_contract/artifacts/contracts/Bitsave.sol/Bitsave.json`
2. UserChildContractABI => `hardhat_contract/artifacts/contracts/userContract.bitsave.sol/UserContract.json`
3. PaymentContractABI => `hardhat_contract/artifacts/@zetachain/protocol-contracts/contracts/zevm/interfaces/IZRC20.sol/IZRC20.json`


Each integration proceeds as follows:

- ### Join Bitsave
1. Approve joining fee:
    ```js
    PaymentToken.approve(bitsaveAddress, parsedJoiningFee)
    ```
2. Call onCrossChainCall on Bitsave
    `Bitsave.onCrossChainCall(...arguments)`
3. Pass the following arguments
    - paymentTokenAddress
    - parsedJoiningFee
    - joinParameters(): (This function has been provided already)
        encodeParams("JON", 0, 0, 0, false) // this is data returned from it
4. You can always retrieve the user's child address from
    `userChildContractAddress = Bitsave.getUserChildContractAddress()`
5. From this child address, the userChildContract can be created using same approach for the Bitsave Object


- ### Create Savings
1. Approve saving amount
    *Implementation in 'Join Bitsave'*
2. Call onCrossChain on Bitsave
3. Pass the following arguments
    - paymentTokenAddress
    - parsed form of savingsAmount eg:
    `parseUnits(savingsAmount.toString())`
    - getSavingsParams(...arguments): (function provided already)
    - arguments are:
        1. nameOfSaving,
        2. endTime: timestamp / 1000 // remove decimal,
        3. startTime: type of endTime
        4. penaltyPercentage: penaltyPercentage eg 1 or 2...
        5. isSavingInSafeMode: boolean
4. You can always retrieve a particular savings data from
    `UserChildContract.getSavings(nameOfSaving)`


- ### Increment Savings
1. Approve saving amount
    *Implementation in 'Join Bitsave'*
2. Call onCrossChain on Bitsave
3. Pass the following arguments
    - paymentTokenAddress
    - parsed form of savingsAmount eg:
    `parseUnits(savingsAmount.toString())`
    - getSavingsParams(...arguments): (function provided already)
    - arguments are:
        1. nameOfSaving,


- ### Withdraw Savings
1. Call onCrossChainCall on Bitsave
2. Pass the following arguments
    - paymentTokenAddress
    - 0
    - getWithdrawParams(...arguments): (function provided already)
    - arguments are:
        1. nameOfSaving


- ### Get all user's savings
    `UserChildContract.getSavingsNames()`


# Project Development:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```
