
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")
const {BigNumber} = require("ethers")
const {expect} = require("chai")
const {deployBitsaveFixture, childContractGenerate} = require("./utils/generator")

describe('CREATE SAVING', () => {

    const nameOfSaving = "school"
    const twoPenaltyPercentage = 2;
    const amountToSave = 3 * ONE_GWEI;
    const endTime = Date.now() + 300_000;

    const createSaving = async (bitsave, data) => {
        await bitsave
            .connect(registeredUser)
            .onCrossChainCall(
                "",
                amountToSave,
                "" // parser to parse message
            )
    }

    it('should revert if user not registered');

    it('should create saving', async()=>{
        const {
            bitsave, registeredUser, reg_userChildAddress
        } = await loadFixture(deployBitsaveFixture)

        const startTime = Date.now();
        const tokenAddress = ""

        await bitsave
            .connect(registeredUser)
            .onCrossChainCall(
                "",
                amountToSave,
                "" // parser to parse message
            )

        const userChildContract = await childContractGenerate(reg_userChildAddress)
        const savingCreated = await userChildContract.getSavings(nameOfSaving);

        // todo: format data retrieved properly
        // Savings data test
        expect(savingCreated.amount).to.be.equal(
            BigNumber.from(amountToSave.toString())
        )
        expect(savingCreated.maturityTime).to.be.equal(endTime)
        // uses wrong time input for lev.
        expect(savingCreated.tokenId).to.be.equal(tokenAddress.toString())
    });

    it('should reduce balance of user', async function() {
        const {bitsave, registeredUser, reg_userChildAddress}
            = await loadFixture(deployBitsaveFixture)

        const userInitialBalance = registeredUser.getBalance()

        // await createSavings

        expect(
            parseInt(userInitialBalance.toString())
        ).to.be.gte(
            parseInt(registeredUser.getBalance())
        )
    });

    it('should save risk mode and use exact token', async function() {
        const {bitsave, reg_userChildAddress} = await loadFixture(deployBitsaveFixture)

        // await create savings with risk mode

        const savingCreated = await userChildContract.getSavings(nameOfSaving);

        expect(savingCreated.isSafeMode).to.be.false

    });

    it('should convert token to stableCoin for safe mode', async function() {
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
