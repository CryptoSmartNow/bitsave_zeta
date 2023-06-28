
const {expect} = require("chai")
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")
const {utils} = require("ethers")
const {deployBitsaveFixture, childContractGenerate} = require("./utils/generator")
const {getWithdrawParams} = require("./utils/helper");
const {createSaving, nameOfSaving} = require("./createSavings.test")


describe('WITHDRAW SAVING', function () {

    it('should withdraw user\'s saving', async() => {
        const {
            bitsave, registeredUser, ZRC20Contracts
        } = await loadFixture(deployBitsaveFixture)
        const PaymentContract = ZRC20Contracts[0]

        await createSaving(bitsave, registeredUser)
        
        const initialUserBalance = await registeredUser.getBalance()
        
        bitsave
            .connect(registeredUser)
            .onCrossChainCall(
                PaymentContract.address,
                0,
                getWithdrawParams(nameOfSaving)
            )

        expect(
            parseInt(initialUserBalance)
        ).to.be.lt(
            parseInt(await registeredUser.getBalance())
        )
    });

    it('should withdraw original token');

    it('should invalidate saving after withdrawal');

    it('should change value of saving to null');

    it('should emit event for withdrawal');
});