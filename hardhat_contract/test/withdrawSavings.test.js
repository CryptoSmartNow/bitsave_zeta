
const {expect} = require("chai")
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")
const {utils} = require("ethers")
const {deployBitsaveFixture, childContractGenerate} = require("./utils/generator")
const {getWithdrawParams} = require("./utils/helper");
const {createSaving, nameOfSaving} = require("./createSavings.test")


describe('WITHDRAW SAVING', function () {

    it('should withdraw user\'s saving', async() => {
        const {
            bitsave, registeredUser, reg_userChildAddress, ZRC20Contracts
        } = await loadFixture(deployBitsaveFixture)
        const PaymentContract = ZRC20Contracts[0]

        await createSaving(bitsave, registeredUser, reg_userChildAddress)
        
        const initialUserBalance = await registeredUser.getBalance()
        console.log("initial", initialUserBalance)
        
        await bitsave
            .connect(registeredUser)
            .onCrossChainCall(
                PaymentContract.address,
                0,
                getWithdrawParams(nameOfSaving)
            )

        const postBalance = await registeredUser.getBalance()
        console.log("post", postBalance)

        expect(
            initialUserBalance
        ).to.be.lt(
            postBalance
        )
    });

    it('should withdraw original token');

    it('should invalidate saving after withdrawal');

    it('should change value of saving to null');

    it('should emit event for withdrawal')
});