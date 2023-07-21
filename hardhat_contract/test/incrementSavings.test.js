const {loadFixture, time} = require("@nomicfoundation/hardhat-network-helpers")
const {BigNumber, utils} = require("ethers")
const {expect} = require("chai")
const {deployBitsaveFixture, childContractGenerate} = require("./utils/generator")
const {getIncrementParams} = require("./utils/helper");
const {createSaving, nameOfSaving, endTime, startTime} = require("./createSavings.test")

const amount = 0.5;
const amountToSave = utils.parseUnits(amount.toString(), "ether");
const incrementAmount = utils.parseEther(amount.toString())


const incrementSaving = async (bitsave, registeredUser, PaymentContract, extra) => {
    
    if(!(extra?.noCreate)) {
        await createSaving(bitsave, registeredUser, "")
    }

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

    it('should revert if user not registered', async () => {
        const {
            bitsave, otherAccount, reg_userChildAddress, ZRC20Contracts
        } = await loadFixture(deployBitsaveFixture)

        await expect(
            incrementSaving(bitsave, otherAccount, ZRC20Contracts[0], {
                noCreate: true
            })
        ).to.be.revertedWithCustomError(bitsave, "UserNotRegistered")
    });

    it('should add to saving', async () => {
        const {
            bitsave, registeredUser, reg_userChildAddress, ZRC20Contracts
        } = await loadFixture(deployBitsaveFixture)

        const { userChildContract } = await childContractGenerate(reg_userChildAddress)
        await createSaving(bitsave, registeredUser, reg_userChildAddress)

        const savingCreated = await userChildContract.getSavings(nameOfSaving);

        const initialSavingAmount = parseInt(savingCreated.amount)

        await incrementSaving(bitsave, registeredUser, ZRC20Contracts[0], {
            noCreate: true
        })

        const savingInc = await userChildContract.getSavings(nameOfSaving);
        const finalSavingAmount = parseInt(savingInc.amount.toString())

        // todo: format data retrieved properly
        // Savings data test
        expect(
            savingCreated.maturityTime.toNumber()
        ).to.equal(endTime)
        // uses wrong time input for lev.
        expect(
            savingCreated.startTime
        ).to.be.equal(startTime)

        expect(finalSavingAmount).to.be.gt(initialSavingAmount);
    });

    it('should reduce balance of user', async function () {
        const {bitsave, registeredUser, reg_userChildAddress, ZRC20Contracts}
            = await loadFixture(deployBitsaveFixture)

        await createSaving(bitsave, registeredUser, reg_userChildAddress)

        const userInitialBalance = await registeredUser.getBalance()
        await incrementSaving(bitsave, registeredUser, ZRC20Contracts[0])
        expect(
            parseInt(userInitialBalance.toString())
        ).to.be.gte(
            parseInt(await registeredUser.getBalance())
        )
    });

    it('should convert token to stableCoin for safe mode', async function () {
        const {bitsave, reg_userChildAddress, registeredUser, ZRC20Contracts} = await loadFixture(deployBitsaveFixture)
        const PC = ZRC20Contracts[0]
        // await create savings with safe mode
        const { userChildContract } = await childContractGenerate(reg_userChildAddress)
        await createSaving(bitsave, registeredUser, reg_userChildAddress)

        const savingCreated = await userChildContract.getSavings(nameOfSaving);

        expect(savingCreated.isSafeMode).to.be.true
        const userInitialBalance = await PC.balanceOf(registeredUser.address)

        await incrementSaving(bitsave, registeredUser, ZRC20Contracts[0])

        expect(
            parseInt(userInitialBalance.toString())
        ).to.be.gte(
            parseInt((await PC.balanceOf(registeredUser.address)).toString())
        )
        // todo: later integrate technique for testing conversion rate
    });

    it('should avoid invalid timestamp', async function () {
        const {bitsave, reg_userChildAddress, registeredUser, ZRC20Contracts} = await loadFixture(deployBitsaveFixture)

        await createSaving(bitsave, registeredUser, reg_userChildAddress)
        time.increaseTo(endTime + 3600)

        await expect(
            bitsave
            .connect(registeredUser)
            .onCrossChainCall(
                ZRC20Contracts[0].address,
                incrementAmount,
                getIncrementParams(nameOfSaving)
            )
        ).to.be.revertedWithCustomError(bitsave, "InvalidTime")
    });
})

