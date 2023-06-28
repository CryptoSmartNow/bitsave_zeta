
const {expect} = require("chai")
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")
const {utils} = require("ethers")
const {deployBitsaveFixture, childContractGenerate} = require("./utils/generator")
const {getSavingParams, getWithdrawParams} = require("./utils/helper");
const {createSaving, nameOfSaving} = require("./createSavings.test")


describe('WITHDRAW SAVING', function () {

    it('should withdraw user\'s saving', async() => {
        const {bitsave, registeredUser} = await loadFixture(deployBitsaveFixture)

        createSaving(bitsave, registeredUser)
        
        const initialUserBalance = registeredUser.getBalance()
        console.log(initialUserBalance)
        
    });

    it('should withdraw original token');

    it('should invalidate saving after withdrawal');

    it('should change value of saving to null');

    it('should emit event for withdrawal');
});