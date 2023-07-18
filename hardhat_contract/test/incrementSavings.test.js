const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")
const {BigNumber, utils} = require("ethers")
const {expect} = require("chai")
const {ONE_GWEI} = require("../constants/config")
const {deployBitsaveFixture, childContractGenerate} = require("./utils/generator")
const {getIncrementParams} = require("./utils/helper");
const {createSaving, nameOfSaving} = require("./createSavings.test")

const amount = 1;
const amountToSave = utils.parseUnits(amount.toString(), "ether");
const incrementAmount = utils.parseUnits((amount + 1).toString(), "ether")


const incrementSaving = async (bitsave, registeredUser, reg_userChildAddress) => {
    const {ZRC20Contracts} = await loadFixture(deployBitsaveFixture)
    const PaymentContract = ZRC20Contracts[0];

    await PaymentContract
        .connect(registeredUser)
        .approve(bitsave.address, incrementAmount)

    await bitsave
        .connect(registeredUser)
        .onCrossChainCall(
            PaymentContract.address,
            incrementAmount,
            getIncrementParams(nameOfSaving)
        )
}

describe('INCREMENT SAVING', () => {

    it('should revert if user not registered');

    it('should add to saving', async () => {
        const {
            bitsave, registeredUser, reg_userChildAddress
        } = await loadFixture(deployBitsaveFixture)

        await createSaving(bitsave, registeredUser, reg_userChildAddress)

        const {userChildContract} = await childContractGenerate(reg_userChildAddress)
        const savingCreated = await userChildContract
            .getSavings(nameOfSaving);

        await incrementSaving(bitsave, registeredUser, reg_userChildAddress)

        // todo: format data retrieved properly
        // Savings data test
        expect(
            savingCreated.maturityTime.toNumber()
        ).to.equal(endTime)
        // uses wrong time input for lev.
        expect(
            savingCreated.startTime
        ).to.be.equal(startTime)
    });

    it('should reduce balance of user', async function () {
        const {bitsave, registeredUser, reg_userChildAddress}
            = await loadFixture(deployBitsaveFixture)

        await createSaving(bitsave, registeredUser, reg_userChildAddress)

        const userInitialBalance = await registeredUser.getBalance()
        await incrementSaving(bitsave, registeredUser, reg_userChildAddress)
        expect(
            parseInt(userInitialBalance.toString())
        ).to.be.gte(
            parseInt(await registeredUser.getBalance())
        )
    });

    it('should convert token to stableCoin for safe mode', async function () {
        const {bitsave, reg_userChildAddress} = await loadFixture(deployBitsaveFixture)

        // await create savings with safe mode

        const savingCreated = await userChildContract.getSavings(nameOfSaving);
        const stableCoin = await bitsave.stableCoin()

        expect(savingCreated.isSafeMode).to.be.true
        expect(savingCreated.tokenId).to.be.equal(stableCoin)
        // todo: later integrate technique for testing conversion rate
    });

    it('should avoid invalid timestamp');

    it('should avoid invalid data');

    it('should prevent overwriting saving data');

    it('should emit event for creating saving');
})

