const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { BigNumber, utils } = require("ethers")
const { expect } = require("chai")
const { ONE_GWEI } = require("../constants/config")
const { deployBitsaveFixture, childContractGenerate } = require("./utils/generator")
const { getSavingParams } = require("./utils/helper");

const nameOfSaving = "school"
const twoPenaltyPercentage = 2;
const amount = 1;
const amountToSave = utils.parseUnits(amount.toString(), "ether");
const approvalAmount = utils.parseUnits((amount + 1).toString(), "ether")
const endTime = parseInt(((Date.now() + 3000000) / 1000).toString());
const startTime = parseInt((Date.now() / 1000).toString())


const createSaving = async (bitsave, registeredUser, reg_userChildAddress, extra) => {
    const { ZRC20Contracts } = await loadFixture(deployBitsaveFixture)
    const PaymentContract = ZRC20Contracts[0];

    await PaymentContract
        .connect(registeredUser)
        .approve(bitsave.address, approvalAmount)

    // const {
    //     userChildContract
    // } = await childContractGenerate(reg_userChildAddress)
    const safeMode = extra?.safeMode ?? true
    const eTime = extra?.endTime ?? endTime

    await bitsave
        .connect(registeredUser)
        .onCrossChainCall(
            PaymentContract.address,
            amountToSave,
            getSavingParams(
                nameOfSaving,
                eTime,
                startTime,
                twoPenaltyPercentage,
                safeMode
            )
        )

    // await expect(
    //     bitsave
    //     .connect(registeredUser)
    //     .onCrossChainCall(
    //         PaymentContract.address,
    //         amountToSave,
    //         getSavingParams(
    //             nameOfSaving,
    //             endTime,
    //             startTime,
    //             twoPenaltyPercentage,
    //             true
    //         )
    //     )
    // ).to.emit(userChildContract, "SavingCreated")
    // .withArgs(
    //     nameOfSaving,
    //     amount,
    //     PaymentContract.address
    // )
}

describe('CREATE SAVING', () => {

    it('should revert if user not registered', async () => {
        const {
            bitsave, otherAccount, reg_userChildAddress
        } = await loadFixture(deployBitsaveFixture)

        await expect(
            createSaving(bitsave, otherAccount, reg_userChildAddress)
        ).to.be.revertedWithCustomError(bitsave, "UserNotRegistered")
    });

    it('should create saving', async () => {
        const {
            bitsave, registeredUser, reg_userChildAddress
        } = await loadFixture(deployBitsaveFixture)

        await createSaving(bitsave, registeredUser, reg_userChildAddress)

        const { userChildContract } = await childContractGenerate(reg_userChildAddress)
        const savingCreated = await userChildContract
            .getSavings(nameOfSaving);

        // todo: format data retrieved properly
        // Savings data test
        expect(
            savingCreated.maturityTime.toNumber()
        ).to.equal(endTime)
        // uses wrong time input for lev.
        expect(
            savingCreated.startTime
        ).to.be.equal(startTime)

        // const savings = await userChildContract.getSavingsNames();
        // console.log("All user's savings", savings)
    });

    it('should reduce balance of user', async function () {
        const { bitsave, registeredUser, reg_userChildAddress }
            = await loadFixture(deployBitsaveFixture)

        const userInitialBalance = await registeredUser.getBalance()

        await createSaving(bitsave, registeredUser, reg_userChildAddress)

        expect(
            parseInt(userInitialBalance.toString())
        ).to.be.gte(
            parseInt(await registeredUser.getBalance())
        )
    });

    it('should save risk mode and use exact token', async function () {
        const {
            bitsave, reg_userChildAddress,
            ZRC20Contracts, registeredUser
        } = await loadFixture(deployBitsaveFixture)

        // await create savings with risk mode
        const { userChildContract } = await childContractGenerate(reg_userChildAddress)

        await createSaving(
            bitsave, registeredUser,
            reg_userChildAddress, {
            safeMode: false
        }
        )
        const savingCreated = await userChildContract.getSavings(nameOfSaving);

        expect(savingCreated.isSafeMode).to.be.false
        const PaymentToken = ZRC20Contracts[0]
        expect(savingCreated.tokenId).to.be.equal(PaymentToken.address)

    });

    it('should convert token to stableCoin for safe mode', async function () {
        const { bitsave, registeredUser, reg_userChildAddress } = await loadFixture(deployBitsaveFixture)

        // await create savings with safe mode
        const { userChildContract } = await childContractGenerate(reg_userChildAddress)

        await createSaving(
            bitsave, registeredUser,
            reg_userChildAddress, {
            safeMode: true
        }
        )
        const savingCreated = await userChildContract.getSavings(nameOfSaving);

        expect(savingCreated.isSafeMode).to.be.true
        // todo: later integrate technique for testing conversion rate
    });

    it('should avoid invalid timestamp', async () => {
        const {
            bitsave, registeredUser, reg_userChildAddress
        } = await loadFixture(deployBitsaveFixture)

        await expect(
            createSaving(bitsave, registeredUser, reg_userChildAddress,
                {
                    endTime: 0
                }
            )
        ).to.be.revertedWithCustomError(bitsave, "InvalidTime")
    });

    it('should avoid invalid data');

    it('should prevent overwriting saving data', async () => {
        const {
            bitsave, reg_userChildAddress, registeredUser, ZRC20Contracts
        } = await loadFixture(deployBitsaveFixture)

        await createSaving(
            bitsave, registeredUser,
            reg_userChildAddress,
        )

        const { userChildContract } = await childContractGenerate(reg_userChildAddress)

        await expect(
            bitsave
                .connect(registeredUser)
                .onCrossChainCall(
                    ZRC20Contracts[0].address,
                    amountToSave,
                    getSavingParams(
                        nameOfSaving,
                        endTime,
                        startTime,
                        twoPenaltyPercentage,
                        false
                    )
                )
        ).to.be.revertedWithCustomError(userChildContract, "InvalidSaving");
    });
})


module.exports = {
    nameOfSaving,
    createSaving,
    amountToSave
}