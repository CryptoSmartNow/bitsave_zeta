
const {expect} = require("chai")
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")
const {utils} = require("ethers")
const {deployBitsaveFixture, childContractGenerate} = require("./utils/generator")
const {getWithdrawParams} = require("./utils/helper");
const {createSaving, nameOfSaving, amountToSave} = require("./createSavings.test")


describe('WITHDRAW SAVING', function () {

    it('should withdraw user\'s saving', async() => {
        const {
            bitsave, registeredUser, reg_userChildAddress, ZRC20Contracts
        } = await loadFixture(deployBitsaveFixture)
        const PaymentContract = ZRC20Contracts[0]
        const userAddress = registeredUser.address

        await createSaving(bitsave, registeredUser, reg_userChildAddress)
        
        const initialUserBalance = await PaymentContract.balanceOf(userAddress)
        console.log("initial", initialUserBalance)
        
        await bitsave
            .connect(registeredUser)
            .onCrossChainCall(
                PaymentContract.address,
                0,
                getWithdrawParams(nameOfSaving)
            )

        const postBalance = await PaymentContract.balanceOf(userAddress)
        console.log("post", postBalance)

        expect(
            initialUserBalance
        ).to.be.lt(
            postBalance
        )
    });

    it('should invalidate saving after withdrawal', async function() {
        const {
            bitsave, registeredUser, reg_userChildAddress, ZRC20Contracts
        } = await loadFixture(deployBitsaveFixture)
        const PaymentContract = ZRC20Contracts[0]

        const { userChildContract } = await childContractGenerate(reg_userChildAddress);
        await createSaving(bitsave, registeredUser, reg_userChildAddress);

        const savingCreated = await userChildContract.getSavings(nameOfSaving);
        expect(savingCreated.isValid).to.be.true

        await bitsave
            .connect(registeredUser)
            .onCrossChainCall(
                PaymentContract.address,
                0,
                getWithdrawParams(nameOfSaving)
            )
        
        const savingWithdrawn = await userChildContract.getSavings(nameOfSaving);
        expect(savingWithdrawn.isValid).to.be.false
    });

    it('should revert for invalid saving', async function() {
        const {
            bitsave, registeredUser, reg_userChildAddress, ZRC20Contracts
        } = await loadFixture(deployBitsaveFixture)
        const PaymentContract = ZRC20Contracts[0]
        await createSaving(bitsave, registeredUser, reg_userChildAddress);

        const { userChildContract } = await childContractGenerate(reg_userChildAddress)

        await expect(
            bitsave
            .connect(registeredUser)
            .onCrossChainCall(
                PaymentContract.address,
                0,
                getWithdrawParams("Fake saving")
            )
        ).to.be.revertedWithCustomError(userChildContract, "InvalidSaving")
    });

});